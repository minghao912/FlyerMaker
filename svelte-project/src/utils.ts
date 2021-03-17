export enum DataFields {
    SPEAKER_NAME, SPEAKER_TITLE, SPEAKER_INSTITUTION_0, SPEAKER_INSTITUTION_1,
    SEMINAR_TITLE, SEMINAR_ABSTRACT,
    SEMINAR_DATE, SEMINAR_TIME, SEMINAR_QUARTER,
    SEMINAR_LOCATION, SEMINAR_LINK, SEMINAR_ID_PWD,
    REFRESHMENTS_SERVED
}

export interface FlyerData {
    "speakerName": string,
    "speakerTitle": string,
    "speakerInstitution0": string,
    "speakerInstitution1": string,
    "seminarTitle": string,
    "seminarAbstract": string,
    "seminarDate": Date,
    "seminarTime": string,
    "seminarQuarter": string,
    "seminarLocation": string,
    "seminarLink"?: string,
    "seminarIDPWD"?: string,
    "refreshments"?: boolean
}