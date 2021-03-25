<script lang="ts">
    import { onMount } from 'svelte';
    import jQuery from 'jquery';

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
                return flyer.seminarTitle.toUpperCase();
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

    // On load to DOM
    onMount(async () => {
        // Debug and log flyer
        console.log(flyer);

        // Resize the title and abstract text to fit into div
        const elements: NodeListOf<HTMLElement> = document.querySelectorAll(".resize");
        elements.forEach(element => {
            while (element.scrollHeight > element.offsetHeight) {
                let jqElement = jQuery(element);

                let newFontSize = (parseInt(jqElement.css('font-size').slice(0, -2)) - 1) + 'px';
                jqElement.css('font-size', newFontSize);
            }
        });
    });
</script>

<svelte:head>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main>
    <div class="container full-width" id="flyer-header">
        <img id="ucla-logo" src="images/UCLA_white.png" alt="UCLA_logo" />
        <img id="biostats-logo" src="images/biostats_white.png" alt="Biostats_logo" />
        <div style="text-align: right;" id="header-text">
            <strong style="color: white;" id="header-text-top">SEMINAR SERIES</strong>
            <p style="color: #fcb316; font-weight: lighter; margin-top: -0.4em;">{getField(DataFields.SEMINAR_QUARTER)}</p>
        </div>
    </div>
    <div class="container full-width" id="flyer-body">
        <div id="speaker-info">
            <p id="speaker-name">{getField(DataFields.SPEAKER_NAME)}</p>
            <p id="speaker-title">{getField(DataFields.SPEAKER_TITLE)}</p>
            <p id="speaker-institution-0" style="margin-top: 0.93cm;">{getField(DataFields.SPEAKER_INSTITUTION_0)}</p>
            <p id="speaker-institution-1">{getField(DataFields.SPEAKER_INSTITUTION_1)}</p>
        </div>
        <div id="seminar-info">
            <p class="resize" id="seminar-title">{getField(DataFields.SEMINAR_TITLE)}</p>
            <div style="height: 10%;"></div>
            <p class="resize" style="white-space: pre-wrap;" id="seminar-abstract">{getField(DataFields.SEMINAR_ABSTRACT)}</p>
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

    /* Override Bootstrap */
    p {
        margin: 0 0 0 0em;
    }

    #flyer-header {
        height: 3.1cm;
        background-color: #1177af;
        font-family: 'Open Sans', sans-serif;
    }

    #flyer-header > #ucla-logo {
        width: 3.2cm;
        margin-top: 1.15cm;
        margin-left: 1.09cm;
        margin-right: 0.31cm;
    }

    #flyer-header > #biostats-logo {
        width: 5.94cm;
        margin-top: 0.983cm;
    }

    #flyer-header > #header-text {
        width: 4.85cm;
        padding: 0px 0px 0px 0px;
        margin-top: 0.98cm;
        margin-right: 1.00cm;
        float: right;
        font-size: 17pt;
    }

    #flyer-body {
        height: 24.9cm;
        overflow: auto;
        font-family: 'Open Sans', sans-serif;
    }

    #flyer-body > #speaker-info {
        text-align: center;
        margin-top: 1.00cm;
    }

    #flyer-body #speaker-name {
        height: 1.20cm;
        font-family: 'Merriweather', serif;
        font-size: 30pt;
    }

    #flyer-body #speaker-title {
        height: 0.64cm;
        margin-top: 0.10em;
        color: #1177af;
        font-size: 16pt;
    }

    #flyer-body #speaker-institution-0, #flyer-body #speaker-institution-1 {
        height: 0.82cm;
        font-size: 20pt;
        font-weight: lighter;
    }

    #flyer-body > #seminar-info {
        margin-top: 1.5cm;
        margin-bottom: auto;
        margin-left: auto;
        margin-right: auto;
        width: 80%;
        height: 55%;
        align-self: center;
    }

    #seminar-info > #seminar-title {
        margin: auto;
        max-height: 30%;
        text-align: center;
        font-size: 24pt;
        font-weight: bold;
    }

    #seminar-info > #seminar-abstract {
        max-height: 60%;
        text-align: left;
        font-size: 14pt;
        font-weight: lighter;
    }
</style>