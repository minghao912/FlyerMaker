<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { DataFields } from './utils';
    import type { FlyerData } from './utils';
    import { handleData } from './dataHandler';

    function buttonClick(e: Event) {
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
    <p>Hey!</p>
    <button class="btn-primary" on:click={buttonClick}>Click</button>
</main>

<style>
    
</style>