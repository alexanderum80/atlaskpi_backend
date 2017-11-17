import { IState, IStateModel } from '../../../models/master/countries';
import { ICountry, ICountryModel } from '../../../models/master/countries/ICountry';
import { IQuery } from '../..';
import * as Promise from 'bluebird';

export class GetStatesForCountryQuery implements IQuery<IState[]> {

    constructor(private _StateModel: IStateModel) { }

    run(country: string): Promise<IState[]> {
        return new Promise<IState[]>((resolve, reject) => {
            this._StateModel.find({ country: country }).then((states) => {
                resolve(states);
            }, (err) => {
                reject(err);
            });
        });
    }
}
