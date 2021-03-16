export enum DataFields {
    SPEAKER_NAME, SPEAKER_TITLE,
    SEMINAR_TITLE, SEMINAR_ABSTRACT,
    SEMINAR_DATE, SEMINAR_TIME,
    SEMINAR_LOCATION, SEMINAR_LINK
}

export interface FlyerData {
    "speakerName": string,
    "speakerTitle": string,
    "seminarTitle": string,
    "seminarAbstract": string,
    "seminarDate": Date,
    "seminarTime": Date,
    "seminarLocation": string,
    "seminarLink"?: string
}