import { ICountry, ICountryModel } from '../../../models/master/countries/ICountry';
import { IQuery } from '../..';
import * as Promise from 'bluebird';
import { QueryBase } from '../../query-base';
import { IIdentity } from '../../../models/app/identity';

export class GetCountriesQuery extends QueryBase<ICountry[]> {

    constructor(public identity: IIdentity, private _CountryModel: ICountryModel) {
        super(identity);
    }

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
