import type { FlyerData } from './utils';

export async function handleData(formFields: HTMLInputElement[], seminarOnline: boolean, refreshmentsWillBeServed: boolean): Promise<FlyerData> {
    return new Promise((resolve, reject) => {
        try {
            const data = organizeData(formFields, seminarOnline, refreshmentsWillBeServed);
            resolve(data);
        } catch (err) {
            console.error(err);
            reject(`An error occured:\n${err}`);
        }
    });
}

function organizeData(formFields: HTMLInputElement[], seminarOnline: boolean, refreshmentsWillBeServed: boolean): FlyerData {
    let flyer = {} as FlyerData;

    // Non-input fields
    flyer.refreshments = refreshmentsWillBeServed;
    if (seminarOnline)
        flyer.seminarLocation = "Online via Zoom";

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
                // Do check to see if date is valid
                if (field.valueAsDate == undefined)
                    throw Error("You have not selected a valid date. Please try again.");
                else flyer.seminarDate = field.valueAsDate;
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
                if (!seminarOnline)
                    flyer.seminarLocation = field.value;
                break;
            default:
                continue;
        }
    }

    return flyer;
}