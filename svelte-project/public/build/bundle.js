
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var DataFields;
    (function (DataFields) {
        DataFields[DataFields["SPEAKER_NAME"] = 0] = "SPEAKER_NAME";
        DataFields[DataFields["SPEAKER_TITLE"] = 1] = "SPEAKER_TITLE";
        DataFields[DataFields["SPEAKER_INSTITUTION_0"] = 2] = "SPEAKER_INSTITUTION_0";
        DataFields[DataFields["SPEAKER_INSTITUTION_1"] = 3] = "SPEAKER_INSTITUTION_1";
        DataFields[DataFields["SEMINAR_TITLE"] = 4] = "SEMINAR_TITLE";
        DataFields[DataFields["SEMINAR_ABSTRACT"] = 5] = "SEMINAR_ABSTRACT";
        DataFields[DataFields["SEMINAR_DATE"] = 6] = "SEMINAR_DATE";
        DataFields[DataFields["SEMINAR_TIME"] = 7] = "SEMINAR_TIME";
        DataFields[DataFields["SEMINAR_QUARTER"] = 8] = "SEMINAR_QUARTER";
        DataFields[DataFields["SEMINAR_LOCATION"] = 9] = "SEMINAR_LOCATION";
        DataFields[DataFields["SEMINAR_LINK"] = 10] = "SEMINAR_LINK";
        DataFields[DataFields["SEMINAR_ID_PWD"] = 11] = "SEMINAR_ID_PWD";
        DataFields[DataFields["REFRESHMENTS_SERVED"] = 12] = "REFRESHMENTS_SERVED";
    })(DataFields || (DataFields = {}));

    async function handleData(formFields, refreshmentsWillBeServed) {
        return new Promise((resolve, reject) => {
            try {
                const data = organizeData(formFields, refreshmentsWillBeServed);
                resolve(data);
            }
            catch (err) {
                console.error(err);
                reject(`An error occured: ${err}`);
            }
        });
    }
    function organizeData(formFields, refreshmentsWillBeServed) {
        let flyer = {};
        // Get flyer fields organized
        for (const field of formFields) {
            switch (field.id) {
                case "speaker-name":
                    flyer.speakerName = field.value;
                    break;
                case "speaker-title":
                    flyer.speakerTitle = field.value;
                    break;
                case "speaker-institution-0":
                    flyer.speakerInstitution0 = field.value;
                    break;
                case "speaker-institution-1":
                    flyer.speakerInstitution1 = field.value;
                    break;
                case "seminar-title":
                    flyer.seminarTitle = field.value;
                    break;
                case "seminar-abstract":
                    flyer.seminarAbstract = field.value;
                    break;
                case "seminar-quarter":
                    flyer.seminarQuarter = field.value;
                    break;
                case "seminar-date":
                    flyer.seminarDate = field.valueAsDate;
                    break;
                case "seminar-time":
                    flyer.seminarTime = field.value;
                    break;
                case "seminar-link":
                    flyer.seminarLink = field.value;
                    break;
                case "seminar-meeting-id-pwd":
                    flyer.seminarIDPWD = field.value;
                    break;
                case "seminar-location":
                    flyer.seminarLocation = field.value;
                    break;
                default:
                    continue;
            }
        }
        flyer.refreshments = refreshmentsWillBeServed;
        return flyer;
    }

    /* src\Input.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;
    const file = "src\\Input.svelte";

    // (104:12) {:else}
    function create_else_block(ctx) {
    	let div3;
    	let div0;
    	let h3;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div2;
    	let div1;
    	let input1;
    	let t3;
    	let label1;
    	let h4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			label0 = element("label");
    			label0.textContent = "Seminar Location *";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			input1 = element("input");
    			t3 = space();
    			label1 = element("label");
    			h4 = element("h4");
    			h4.textContent = "Refreshments will be served";
    			attr_dev(label0, "for", "seminar-location");
    			add_location(label0, file, 106, 28, 5839);
    			add_location(h3, file, 106, 24, 5835);
    			attr_dev(input0, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "seminar-location");
    			input0.value = "CHS 33-105A";
    			add_location(input0, file, 107, 24, 5926);
    			attr_dev(div0, "class", "form-group col-md-6");
    			add_location(div0, file, 105, 20, 5776);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "custom-control-input svelte-b9ll4o");
    			attr_dev(input1, "id", "customCheck1");
    			add_location(input1, file, 111, 28, 6252);
    			add_location(h4, file, 112, 83, 6437);
    			attr_dev(label1, "class", "custom-control-label");
    			attr_dev(label1, "for", "customCheck1");
    			add_location(label1, file, 112, 28, 6382);
    			attr_dev(div1, "class", "custom-control custom-checkbox");
    			add_location(div1, file, 110, 24, 6178);
    			set_style(div2, "text-align", "center");
    			set_style(div2, "margin-top", "4em");
    			attr_dev(div2, "class", "form-group col-md-6");
    			add_location(div2, file, 109, 20, 6074);
    			attr_dev(div3, "class", "form-row my-2");
    			attr_dev(div3, "id", "form-row-6b");
    			add_location(div3, file, 104, 16, 5710);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h3);
    			append_dev(h3, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input1);
    			append_dev(div1, t3);
    			append_dev(div1, label1);
    			append_dev(label1, h4);

    			if (!mounted) {
    				dispose = listen_dev(input1, "click", /*refreshmentsServed*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(104:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (91:12) {#if showSeminarOnlineInfo}
    function create_if_block(ctx) {
    	let div2;
    	let div0;
    	let h30;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let small0;
    	let t4;
    	let div1;
    	let h31;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let small1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			label0 = element("label");
    			label0.textContent = "Seminar Link *";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			small0 = element("small");
    			small0.textContent = "Zoom Link";
    			t4 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			label1 = element("label");
    			label1.textContent = "Meeting ID and Password *";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			small1 = element("small");
    			small1.textContent = "Fill in the template above";
    			attr_dev(label0, "for", "seminar-link");
    			add_location(label0, file, 93, 28, 4903);
    			add_location(h30, file, 93, 24, 4899);
    			attr_dev(input0, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "seminar-link");
    			add_location(input0, file, 94, 24, 4982);
    			attr_dev(small0, "id", "seminar-link-help");
    			attr_dev(small0, "class", "form-text text-muted svelte-b9ll4o");
    			add_location(small0, file, 95, 24, 5082);
    			attr_dev(div0, "class", "form-group col-md-6");
    			add_location(div0, file, 92, 20, 4840);
    			attr_dev(label1, "for", "seminar-meeting-id-pwd");
    			add_location(label1, file, 98, 28, 5271);
    			add_location(h31, file, 98, 24, 5267);
    			attr_dev(input1, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "seminar-meeting-id-pwd");
    			input1.value = DEFAULT_MEETING_ID_PASSWORD;
    			add_location(input1, file, 99, 24, 5371);
    			attr_dev(small1, "id", "seminar-meeting-id-pwd-help");
    			attr_dev(small1, "class", "form-text text-muted svelte-b9ll4o");
    			add_location(small1, file, 100, 24, 5516);
    			attr_dev(div1, "class", "form-group col-md-6");
    			add_location(div1, file, 97, 20, 5208);
    			attr_dev(div2, "class", "form-row my-2");
    			attr_dev(div2, "id", "form-row-6a");
    			add_location(div2, file, 91, 16, 4774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h30);
    			append_dev(h30, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(div0, t2);
    			append_dev(div0, small0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, h31);
    			append_dev(h31, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			append_dev(div1, t7);
    			append_dev(div1, small1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(91:12) {#if showSeminarOnlineInfo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div17;
    	let form;
    	let div2;
    	let div0;
    	let h30;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let h31;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let div5;
    	let div3;
    	let h32;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let div4;
    	let h33;
    	let label3;
    	let t10;
    	let input3;
    	let t11;
    	let div7;
    	let div6;
    	let h34;
    	let label4;
    	let t13;
    	let input4;
    	let t14;
    	let div9;
    	let div8;
    	let h35;
    	let label5;
    	let t16;
    	let textarea;
    	let t17;
    	let div13;
    	let div10;
    	let h36;
    	let label6;
    	let t19;
    	let input5;
    	let t20;
    	let div11;
    	let h37;
    	let label7;
    	let t22;
    	let input6;
    	let t23;
    	let div12;
    	let h38;
    	let label8;
    	let t25;
    	let input7;
    	let t26;
    	let div15;
    	let div14;
    	let input8;
    	let t27;
    	let label9;
    	let h4;
    	let t29;
    	let t30;
    	let div16;
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*showSeminarOnlineInfo*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div17 = element("div");
    			form = element("form");
    			div2 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			label0 = element("label");
    			label0.textContent = "Speaker Name *";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			label1 = element("label");
    			label1.textContent = "Speaker Title *";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h32 = element("h3");
    			label2 = element("label");
    			label2.textContent = "Speaker Institution Line 0 *";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div4 = element("div");
    			h33 = element("h3");
    			label3 = element("label");
    			label3.textContent = "Speaker Institution Line 1 *";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			div7 = element("div");
    			div6 = element("div");
    			h34 = element("h3");
    			label4 = element("label");
    			label4.textContent = "Seminar Title *";
    			t13 = space();
    			input4 = element("input");
    			t14 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h35 = element("h3");
    			label5 = element("label");
    			label5.textContent = "Seminar Abstract *";
    			t16 = space();
    			textarea = element("textarea");
    			t17 = space();
    			div13 = element("div");
    			div10 = element("div");
    			h36 = element("h3");
    			label6 = element("label");
    			label6.textContent = "Seminar Quarter *";
    			t19 = space();
    			input5 = element("input");
    			t20 = space();
    			div11 = element("div");
    			h37 = element("h3");
    			label7 = element("label");
    			label7.textContent = "Seminar Date *";
    			t22 = space();
    			input6 = element("input");
    			t23 = space();
    			div12 = element("div");
    			h38 = element("h3");
    			label8 = element("label");
    			label8.textContent = "Seminar Time *";
    			t25 = space();
    			input7 = element("input");
    			t26 = space();
    			div15 = element("div");
    			div14 = element("div");
    			input8 = element("input");
    			t27 = space();
    			label9 = element("label");
    			h4 = element("h4");
    			h4.textContent = "This seminar will be hosted online";
    			t29 = space();
    			if_block.c();
    			t30 = space();
    			div16 = element("div");
    			button = element("button");
    			button.textContent = "Create Flyer";
    			attr_dev(label0, "for", "speaker-name");
    			add_location(label0, file, 40, 24, 1458);
    			add_location(h30, file, 40, 20, 1454);
    			attr_dev(input0, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "speaker-name");
    			attr_dev(input0, "placeholder", "e.g. Tomioka Giyuu, PhD");
    			add_location(input0, file, 41, 20, 1533);
    			attr_dev(div0, "class", "form-group col-md-6 svelte-b9ll4o");
    			add_location(div0, file, 39, 16, 1399);
    			attr_dev(label1, "for", "speaker-title");
    			add_location(label1, file, 44, 24, 1746);
    			add_location(h31, file, 44, 20, 1742);
    			attr_dev(input1, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "speaker-title");
    			attr_dev(input1, "placeholder", "e.g. Assistant Professor of Statistics");
    			add_location(input1, file, 45, 20, 1823);
    			attr_dev(div1, "class", "form-group col-md-6 svelte-b9ll4o");
    			add_location(div1, file, 43, 16, 1687);
    			attr_dev(div2, "class", "form-row my-2 svelte-b9ll4o");
    			attr_dev(div2, "id", "form-row-0");
    			add_location(div2, file, 38, 12, 1338);
    			attr_dev(label2, "for", "speaker-institution-0");
    			add_location(label2, file, 50, 24, 2129);
    			add_location(h32, file, 50, 20, 2125);
    			attr_dev(input2, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "speaker-institution-0");
    			attr_dev(input2, "placeholder", "e.g. Department of Biostatistics");
    			add_location(input2, file, 51, 20, 2227);
    			attr_dev(div3, "class", "form-group col-md-6");
    			add_location(div3, file, 49, 16, 2070);
    			attr_dev(label3, "for", "speaker-institution-1");
    			add_location(label3, file, 54, 24, 2458);
    			add_location(h33, file, 54, 20, 2454);
    			attr_dev(input3, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "speaker-institution-1");
    			attr_dev(input3, "placeholder", "e.g. UCLA");
    			add_location(input3, file, 55, 20, 2556);
    			attr_dev(div4, "class", "form-group col-md-6");
    			add_location(div4, file, 53, 16, 2399);
    			attr_dev(div5, "class", "form-row my-2");
    			attr_dev(div5, "id", "form-row-1");
    			add_location(div5, file, 48, 12, 2009);
    			attr_dev(label4, "for", "seminar-title");
    			add_location(label4, file, 60, 24, 2836);
    			add_location(h34, file, 60, 20, 2832);
    			attr_dev(input4, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "id", "seminar-title");
    			add_location(input4, file, 61, 20, 2913);
    			attr_dev(div6, "class", "form-group col");
    			add_location(div6, file, 59, 16, 2782);
    			attr_dev(div7, "class", "form-row my-2");
    			attr_dev(div7, "id", "form-row-2");
    			add_location(div7, file, 58, 12, 2721);
    			attr_dev(label5, "for", "seminar-abstract");
    			add_location(label5, file, 66, 24, 3161);
    			add_location(h35, file, 66, 20, 3157);
    			set_style(textarea, "min-height", "400px");
    			set_style(textarea, "padding-left", "20px");
    			attr_dev(textarea, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(textarea, "id", "seminar-abstract");
    			add_location(textarea, file, 67, 20, 3244);
    			attr_dev(div8, "class", "form-group col");
    			add_location(div8, file, 65, 16, 3107);
    			attr_dev(div9, "class", "form-row my-2");
    			attr_dev(div9, "id", "form-row-3");
    			add_location(div9, file, 64, 12, 3046);
    			attr_dev(label6, "for", "seminar-quarter");
    			add_location(label6, file, 72, 24, 3533);
    			add_location(h36, file, 72, 20, 3529);
    			attr_dev(input5, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "id", "seminar-quarter");
    			attr_dev(input5, "placeholder", "e.g. Spring 2021");
    			add_location(input5, file, 73, 20, 3614);
    			attr_dev(div10, "class", "form-group col");
    			add_location(div10, file, 71, 16, 3479);
    			attr_dev(label7, "for", "seminar-date");
    			add_location(label7, file, 76, 24, 3818);
    			add_location(h37, file, 76, 20, 3814);
    			attr_dev(input6, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input6, "type", "date");
    			attr_dev(input6, "id", "seminar-date");
    			add_location(input6, file, 77, 20, 3893);
    			attr_dev(div11, "class", "form-group col");
    			add_location(div11, file, 75, 16, 3764);
    			attr_dev(label8, "for", "seminar-time");
    			add_location(label8, file, 80, 24, 4063);
    			add_location(h38, file, 80, 20, 4059);
    			attr_dev(input7, "class", "form-control-lg full-width svelte-b9ll4o");
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "id", "seminar-time");
    			input7.value = "3:30pm - 4:30pm";
    			add_location(input7, file, 81, 20, 4138);
    			attr_dev(div12, "class", "form-group col");
    			add_location(div12, file, 79, 16, 4009);
    			attr_dev(div13, "class", "form-row my-2");
    			attr_dev(div13, "id", "form-row-4");
    			add_location(div13, file, 70, 12, 3418);
    			attr_dev(input8, "type", "checkbox");
    			attr_dev(input8, "class", "custom-control-input svelte-b9ll4o");
    			attr_dev(input8, "id", "customCheck1");
    			add_location(input8, file, 86, 20, 4448);
    			add_location(h4, file, 87, 75, 4620);
    			attr_dev(label9, "class", "custom-control-label");
    			attr_dev(label9, "for", "customCheck1");
    			add_location(label9, file, 87, 20, 4565);
    			set_style(div14, "margin-left", "10px");
    			attr_dev(div14, "class", "custom-control custom-checkbox");
    			add_location(div14, file, 85, 16, 4355);
    			attr_dev(div15, "class", "form-row my-2");
    			attr_dev(div15, "id", "form-row-5");
    			add_location(div15, file, 84, 12, 4294);
    			attr_dev(button, "class", "btn btn-primary mb-5");
    			add_location(button, file, 118, 16, 6649);
    			set_style(div16, "text-align", "center");
    			add_location(div16, file, 117, 12, 6598);
    			attr_dev(form, "class", "full-width svelte-b9ll4o");
    			add_location(form, file, 37, 8, 1299);
    			attr_dev(div17, "class", "row my-2 align-items-center full-width svelte-b9ll4o");
    			attr_dev(div17, "id", "user-input-form");
    			add_location(div17, file, 36, 4, 1216);
    			add_location(main, file, 35, 0, 1204);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div17);
    			append_dev(div17, form);
    			append_dev(form, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h30);
    			append_dev(h30, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h31);
    			append_dev(h31, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			append_dev(form, t5);
    			append_dev(form, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h32);
    			append_dev(h32, label2);
    			append_dev(div3, t7);
    			append_dev(div3, input2);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, h33);
    			append_dev(h33, label3);
    			append_dev(div4, t10);
    			append_dev(div4, input3);
    			append_dev(form, t11);
    			append_dev(form, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h34);
    			append_dev(h34, label4);
    			append_dev(div6, t13);
    			append_dev(div6, input4);
    			append_dev(form, t14);
    			append_dev(form, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h35);
    			append_dev(h35, label5);
    			append_dev(div8, t16);
    			append_dev(div8, textarea);
    			append_dev(form, t17);
    			append_dev(form, div13);
    			append_dev(div13, div10);
    			append_dev(div10, h36);
    			append_dev(h36, label6);
    			append_dev(div10, t19);
    			append_dev(div10, input5);
    			append_dev(div13, t20);
    			append_dev(div13, div11);
    			append_dev(div11, h37);
    			append_dev(h37, label7);
    			append_dev(div11, t22);
    			append_dev(div11, input6);
    			append_dev(div13, t23);
    			append_dev(div13, div12);
    			append_dev(div12, h38);
    			append_dev(h38, label8);
    			append_dev(div12, t25);
    			append_dev(div12, input7);
    			append_dev(form, t26);
    			append_dev(form, div15);
    			append_dev(div15, div14);
    			append_dev(div14, input8);
    			append_dev(div14, t27);
    			append_dev(div14, label9);
    			append_dev(label9, h4);
    			append_dev(form, t29);
    			if_block.m(form, null);
    			append_dev(form, t30);
    			append_dev(form, div16);
    			append_dev(div16, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input8, "click", /*seminarOnline*/ ctx[1], false, false, false),
    					listen_dev(button, "click", /*buttonClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(form, t30);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const DEFAULT_MEETING_ID_PASSWORD = "Meeting ID: XXX XXXX XXXX | Password: XXXXXX";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	

    	// Checkbox triggerable variables
    	let showSeminarOnlineInfo = false;

    	function seminarOnline(e) {
    		$$invalidate(0, showSeminarOnlineInfo = !showSeminarOnlineInfo);
    	}

    	let refreshmentsWillBeServed = false;

    	function refreshmentsServed(e) {
    		refreshmentsWillBeServed = !refreshmentsWillBeServed;
    	}

    	// Submits form
    	function buttonClick(e) {
    		e.preventDefault();

    		// Get form data
    		let formFields = [];

    		const form = document.querySelector("#user-input-form");

    		form.querySelectorAll("input, textarea").forEach(inputField => {
    			formFields.push(inputField);
    		});

    		// Submit
    		handleData(formFields, refreshmentsWillBeServed).then(verifiedFlyer => triggerFinished(verifiedFlyer)).catch(err => console.error(err));
    	}

    	// Tells main page that flyer data was submitted
    	const dispatch = createEventDispatcher();

    	function triggerFinished(flyerData) {
    		dispatch("finished", { "data": flyerData });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		DataFields,
    		handleData,
    		DEFAULT_MEETING_ID_PASSWORD,
    		showSeminarOnlineInfo,
    		seminarOnline,
    		refreshmentsWillBeServed,
    		refreshmentsServed,
    		buttonClick,
    		dispatch,
    		triggerFinished
    	});

    	$$self.$inject_state = $$props => {
    		if ("showSeminarOnlineInfo" in $$props) $$invalidate(0, showSeminarOnlineInfo = $$props.showSeminarOnlineInfo);
    		if ("refreshmentsWillBeServed" in $$props) refreshmentsWillBeServed = $$props.refreshmentsWillBeServed;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showSeminarOnlineInfo, seminarOnline, refreshmentsServed, buttonClick];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\Output.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\Output.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let raw_value = createOutputFromData(/*flyerData*/ ctx[0]) + "";

    	const block = {
    		c: function create() {
    			main = element("main");
    			add_location(main, file$1, 8, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			main.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*flyerData*/ 1 && raw_value !== (raw_value = createOutputFromData(/*flyerData*/ ctx[0]) + "")) main.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createOutputFromData(flyerData) {
    	console.log(flyerData);
    	return `<p>test</p>`;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Output", slots, []);
    	
    	let { flyerData = {} } = $$props;
    	const writable_props = ["flyerData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Output> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("flyerData" in $$props) $$invalidate(0, flyerData = $$props.flyerData);
    	};

    	$$self.$capture_state = () => ({ flyerData, createOutputFromData });

    	$$self.$inject_state = $$props => {
    		if ("flyerData" in $$props) $$invalidate(0, flyerData = $$props.flyerData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [flyerData];
    }

    class Output extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { flyerData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Output",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get flyerData() {
    		throw new Error("<Output>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flyerData(value) {
    		throw new Error("<Output>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.0 */
    const file$2 = "src\\App.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let header;
    	let h1;
    	let t1;
    	let div3;
    	let div0;
    	let span;
    	let i;
    	let t2;
    	let div1;
    	let input;
    	let t3;
    	let div2;
    	let output;
    	let current;
    	let mounted;
    	let dispose;
    	input = new Input({ $$inline: true });
    	input.$on("finished", /*submitFinished*/ ctx[1]);

    	output = new Output({
    			props: { flyerData: /*flyerData*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Biostatistics Flyer Maker";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			span = element("span");
    			i = element("i");
    			t2 = space();
    			div1 = element("div");
    			create_component(input.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			create_component(output.$$.fragment);
    			attr_dev(h1, "class", "my-3 text-white");
    			add_location(h1, file$2, 29, 2, 1088);
    			attr_dev(header, "class", "bg-dark text-center p-2 mb-3");
    			add_location(header, file$2, 28, 1, 1039);
    			attr_dev(i, "class", "centered-item fas fa-print fa-2x svelte-12jkxcc");
    			add_location(i, file$2, 35, 9, 1311);
    			add_location(span, file$2, 35, 3, 1305);
    			attr_dev(div0, "class", "container float pointer-hover svelte-12jkxcc");
    			attr_dev(div0, "id", "print-button");
    			div0.hidden = true;
    			add_location(div0, file$2, 34, 2, 1215);
    			attr_dev(div1, "class", "container");
    			attr_dev(div1, "id", "input-form");
    			add_location(div1, file$2, 39, 2, 1409);
    			attr_dev(div2, "class", "container print-area print my-5 svelte-12jkxcc");
    			attr_dev(div2, "id", "output-area");
    			attr_dev(div2, "paper-size", "US-LETTER");
    			div2.hidden = true;
    			add_location(div2, file$2, 44, 2, 1533);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$2, 32, 1, 1163);
    			add_location(main, file$2, 27, 0, 1030);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, h1);
    			append_dev(main, t1);
    			append_dev(main, div3);
    			append_dev(div3, div0);
    			append_dev(div0, span);
    			append_dev(span, i);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			mount_component(input, div1, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			mount_component(output, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", print, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const output_changes = {};
    			if (dirty & /*flyerData*/ 1) output_changes.flyerData = /*flyerData*/ ctx[0];
    			output.$set(output_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(output.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(output.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(input);
    			destroy_component(output);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function print() {
    	// Create window for printing
    	const printContent = document.querySelector(".print");

    	const printWindow = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0");

    	// Link CSS and write HTML
    	printWindow.document.write("<link rel='stylesheet' href='bootstrap.min.css'>");

    	printWindow.document.write(printContent.innerHTML);

    	// Focus and call browser print
    	printWindow.document.close();

    	printWindow.focus();
    	printWindow.print();
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	

    	// Create output flyer
    	let flyerData = {};

    	function submitFinished(e) {
    		$$invalidate(0, flyerData = e.detail.data);
    		document.querySelector("#input-form").hidden = true;
    		document.querySelector("#output-area").hidden = false;
    		document.querySelector("#print-button").hidden = false;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Input,
    		Output,
    		handleData,
    		print,
    		flyerData,
    		submitFinished
    	});

    	$$self.$inject_state = $$props => {
    		if ("flyerData" in $$props) $$invalidate(0, flyerData = $$props.flyerData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [flyerData, submitFinished];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
