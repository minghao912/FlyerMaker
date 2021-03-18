<script lang="ts">
    import { DataFields } from './utils';
    import type { FlyerData } from './utils';

    // Empty flyer
    export let flyer: FlyerData = {
        "speakerName": "",
        "speakerTitle": "",
        "speakerInstitution0": "",
        "speakerInstitution1": "",
        "seminarTitle": "",
        "seminarAbstract": "",
        "seminarDate": null,
        "seminarTime": "",
        "seminarQuarter": "",
        "seminarLocation": "",
        "seminarLink": "",
        "seminarIDPWD": "",
        "refreshments": false
    } as FlyerData;

    function createOutputFromData(flyerData: FlyerData): string {
        console.log(flyerData);
        return `<p>${JSON.stringify(flyerData)}</p>`;
    }

    function getField(field: DataFields): string {
        switch (field) {
            case DataFields.SPEAKER_NAME:
                return flyer.speakerName;
            case DataFields.SPEAKER_TITLE:
                return flyer.speakerTitle;
            case DataFields.SPEAKER_INSTITUTION_0:
                return flyer.speakerInstitution0;
            case DataFields.SPEAKER_INSTITUTION_1:
                return flyer.speakerInstitution1;
            case DataFields.SEMINAR_TITLE:
                return flyer.seminarTitle;
            case DataFields.SEMINAR_ABSTRACT:
                return flyer.seminarAbstract;
            case DataFields.SEMINAR_QUARTER:
                return flyer.seminarQuarter.toUpperCase();
            case DataFields.SEMINAR_DATE:
                // WILL FIX LATER
                return flyer.seminarDate.toDateString();
            case DataFields.SEMINAR_TIME:
                return flyer.seminarTime;
            case DataFields.SEMINAR_LINK:
                return flyer.seminarLink;
            case DataFields.SEMINAR_ID_PWD:
                return flyer.seminarIDPWD;
            case DataFields.SEMINAR_LOCATION:
                return flyer.seminarLocation;
            default:
                return "";
        }
    }
</script>

<svelte:head>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main>
    <div class="container full-width" id="header">
        <img id="ucla-logo" src="images/UCLA_white.png" alt="UCLA_logo" />
        <img id="biostats-logo" src="images/biostats_white.png" alt="Biostats_logo" />
        <div style="text-align: right;" id="header-text">
            <strong style="color: white;" id="header-text-top">SEMINAR SERIES</strong>
            <p style="color: #fcb316; font-weight: lighter;">{getField(DataFields.SEMINAR_QUARTER)}</p>
        </div>
    </div>
</main>

<style>
    /*  font-family: 'Merriweather', serif;
        font-family: 'Open Sans', sans-serif;   
        
        blue: #1177af
        gold: #fcb316
    */
    div {
        box-sizing: border-box;
        margin: 0px;
        padding: 0px 0px 0px 0px;
    }

    #header {
        height: 3.1cm;
        background-color: #1177af;
        font-family: 'Open Sans', sans-serif;
    }

    #header > #ucla-logo {
        width: 3.2cm;
        margin-top: 1.15cm;
        margin-left: 1.09cm;
        margin-right: 0.31cm;
    }

    #header > #biostats-logo {
        width: 5.94cm;
        margin-top: 0.983cm;
    }

    #header > #header-text {
        width: 4.85cm;
        padding: 0px 0px 0px 0px;
        margin-top: 0.98cm;
        margin-right: 1.00cm;
        float: right;
        font-size: 17pt;
    }
</style>