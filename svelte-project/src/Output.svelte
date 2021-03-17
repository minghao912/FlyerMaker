<script lang="ts">
    import type { FlyerData } from './utils';

    export let flyerData: FlyerData = {} as FlyerData;

    function createOutputFromData(flyerData: FlyerData): string {
        console.log(flyerData);
        return `<p>test</p>`;
    }
</script>

<main>
    {@html createOutputFromData(flyerData)}
</main>