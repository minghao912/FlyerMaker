<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { DataFields } from './utils';
    import type { FlyerData } from './utils';
    import { handleData } from './dataHandler';

    const DEFAULT_MEETING_ID_PASSWORD = "Meeting ID: XXX XXXX XXXX | Password: XXXXXX";

    // Checkbox triggerable variables
    let showSeminarOnlineInfo = false;
    function seminarOnline(e: Event) {
        showSeminarOnlineInfo = !showSeminarOnlineInfo;
    }

    let refreshmentsWillBeServed = false;
    function refreshmentsServed(e: Event) {
        refreshmentsWillBeServed = !refreshmentsWillBeServed;
    }

    // Submits form
    function buttonClick(e: Event) {
        e.preventDefault();

        // Get form data
        let formFields = [] as HTMLInputElement[];
        const form = document.querySelector("#user-input-form");
        form.querySelectorAll("input, textarea").forEach(inputField => {
            formFields.push(inputField as HTMLInputElement);
        });

        // Submit
        handleData(formFields, refreshmentsWillBeServed)
            .then(verifiedFlyer => triggerFinished(verifiedFlyer))
            .catch(err => console.error(err));
    }
    
    // Tells main page that flyer data was submitted
    const dispatch = createEventDispatcher();
    function triggerFinished(flyerData: FlyerData) {
        dispatch("finished", {"data": flyerData});
    }
</script>

<main>
    <div class="row my-2 align-items-center full-width" id="user-input-form">
        <form class="full-width">
            <div class="form-row my-2" id="form-row-0">
                <div class="form-group col-md-6">
                    <h3><label for="speaker-name">Speaker Name *</label></h3>
                    <input class="form-control-lg full-width" type="text" id="speaker-name" placeholder="e.g. Tomioka Giyuu, PhD" />
                </div>
                <div class="form-group col-md-6">
                    <h3><label for="speaker-title">Speaker Title *</label></h3>
                    <input class="form-control-lg full-width" type="text" id="speaker-title" placeholder="e.g. Assistant Professor of Statistics" />
                </div>
            </div>
            <div class="form-row my-2" id="form-row-1">
                <div class="form-group col-md-6">
                    <h3><label for="speaker-institution-0">Speaker Institution Line 0 *</label></h3>
                    <input class="form-control-lg full-width" type="text" id="speaker-institution-0" placeholder="e.g. Department of Biostatistics" />
                </div>
                <div class="form-group col-md-6">
                    <h3><label for="speaker-institution-1">Speaker Institution Line 1 *</label></h3>
                    <input class="form-control-lg full-width" type="text" id="speaker-institution-1" placeholder="e.g. UCLA" />
                </div>
            </div>
            <div class="form-row my-2" id="form-row-2">
                <div class="form-group col">
                    <h3><label for="seminar-title">Seminar Title *</label></h3>
                    <input class="form-control-lg full-width" type="text" id="seminar-title" />
                </div>
            </div>
            <div class="form-row my-2" id="form-row-3">
                <div class="form-group col">
                    <h3><label for="seminar-abstract">Seminar Abstract *</label></h3>
                    <textarea class="form-control-lg full-width" id="seminar-abstract" />
                </div>
            </div>
            <div class="form-row my-2" id="form-row-4">
                <div class="form-group col">
                    <h3><label for="seminar-quarter">Seminar Quarter *</label></h3>
                    <input class="form-control-lg full-width" type="text" id="seminar-quarter" placeholder="e.g. Spring 2021" />
                </div>
                <div class="form-group col">
                    <h3><label for="seminar-date">Seminar Date *</label></h3>
                    <input class="form-control-lg full-width" type="date" id="seminar-date" />
                </div>
                <div class="form-group col">
                    <h3><label for="seminar-time">Seminar Time *</label></h3>
                    <input class="form-control-lg full-width" type="text" id="seminar-time" value="3:30pm - 4:30pm" />
                </div>
            </div>
            <div class="form-row my-2" id="form-row-5">
                <div style="margin-left: 10px;" class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="customCheck1" on:click={seminarOnline}>
                    <label class="custom-control-label" for="customCheck1"><h4>This seminar will be hosted online</h4></label>
                </div>
            </div>
            {#if showSeminarOnlineInfo}
                <div class="form-row my-2" id="form-row-6a">
                    <div class="form-group col-md-6">
                        <h3><label for="seminar-link">Seminar Link *</label></h3>
                        <input class="form-control-lg full-width" type="text" id="seminar-link" />
                        <small id="seminar-link-help" class="form-text text-muted">Zoom Link</small>
                    </div>
                    <div class="form-group col-md-6">
                        <h3><label for="seminar-meeting-id-pwd">Meeting ID and Password *</label></h3>
                        <input class="form-control-lg full-width" type="text" id="seminar-meeting-id-pwd" value={DEFAULT_MEETING_ID_PASSWORD}/>
                        <small id="seminar-meeting-id-pwd-help" class="form-text text-muted">Fill in the template above</small>
                    </div>
                </div>
            {:else}
                <div class="form-row my-2" id="form-row-6b">
                    <div class="form-group col-md-6">
                        <h3><label for="seminar-location">Seminar Location *</label></h3>
                        <input class="form-control-lg full-width" type="text" id="seminar-location" value="CHS 33-105A" />
                    </div>
                    <div style="text-align: center; margin-top: 4em;" class="form-group col-md-6">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" id="customCheck1" on:click={refreshmentsServed}>
                            <label class="custom-control-label" for="customCheck1"><h4>Refreshments will be served</h4></label>
                        </div>
                    </div>
                </div>
            {/if}
            <div style="text-align: center;">
                <button class="btn btn-primary mb-5" on:click={buttonClick}>Create Flyer</button>
            </div>
        </form>
    </div>
</main>

<style>
    input {
        margin-left: 5px;
        padding: 10px;
    }

    small {
        margin-left: 5px;
    }

    textarea {
        min-height: 400px;
        margin-left: 5px;
        padding: 20px;
        border-width: 2px;
    }

    .full-width {
        width: 100%;
    }

    #form-row-0 > * {
        width: 50%;
    }

    #user-input-form {
        align-content: center;
        margin-top: 20px;
    }
</style>