import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

import { IIdentity } from '../../../domain/app/security/users/identity';
import { ICountry, ICountryModel } from '../../../domain/master/countries/Country';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetCountriesActivity } from '../activities/get-countries.activity';
import { Country } from '../countries.types';
import { Countries } from '../../../domain/master/countries/country.model';


@injectable()
@query({
    name: 'countries',
    activity: GetCountriesActivity,
    output: { type: Country, isArray: true }
})
export class CountriesQuery implements IQuery<ICountry[]> {

    constructor(
        @inject(Countries.name) private _countries: Countries
    ) { }

    run(data: any): Promise<ICountry[]> {
        return new Promise<ICountry[]>((resolve, reject) => {
            this._countries.model.find({}).then((countries) => {
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
