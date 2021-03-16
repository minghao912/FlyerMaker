<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { DataFields } from './utils';
    import type { FlyerData } from './utils';
    import { handleData } from './dataHandler';

    function buttonClick(e: Event) {
        e.preventDefault();

        // Get form data
        let formFields = [] as HTMLInputElement[];
        const form = document.querySelector("#user-input-form");
        form.querySelectorAll("input").forEach(inputField => {
            formFields.push(inputField);
        });
        // console.log(formFields);

        // Try submitting each field
        submitField(DataFields.SPEAKER_NAME, "Tomioka Giyuu");
    }

    function submitField(field: DataFields, data: string | Date) {
        handleData(field, data).then((flyerData) => {
            // Check if all fields filled in
            triggerFinished(flyerData);
        }).catch((err) => console.error(err));
    }
    
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
            <div style="text-align: center;">
                <button class="btn btn-primary" on:click={buttonClick}>Create Flyer</button>
            </div>
        </form>
    </div>
</main>

<style>
    input {
        margin-left: 5px;
        padding: 10px;
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