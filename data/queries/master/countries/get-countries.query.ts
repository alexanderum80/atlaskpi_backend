import { ICountry, ICountryModel } from '../../../models/master/countries/ICountry';
import { IQuery } from '../..';
import * as Promise from 'bluebird';

export class GetCountriesQuery implements IQuery<ICountry[]> {

    constructor(private _CountryModel: ICountryModel) { }

    run(data: any): Promise<ICountry[]> {
        return new Promise<ICountry[]>((resolve, reject) => {
            this._CountryModel.find({}).then((countries) => {
                if (!countries) {
                    reject({ name: 'not-found', message: 'No Country found' });
                }

                resolve(countries);
            }, (err) => {
                reject(err);
            });
        });
    }
}
