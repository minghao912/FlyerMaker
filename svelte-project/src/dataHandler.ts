import type { DataFields, FlyerData } from './utils';

let flyer = {} as FlyerData;

export async function handleData(field: DataFields, data: string | Date): Promise<FlyerData> {
    

    return new Promise((resolve, reject) => {
        try {
            resolve(flyer);
        } catch (err) {
            console.error(err);
            reject(`An error occured: ${err}`);
        }
    });
}