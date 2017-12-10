import { IState, IStateModel } from '../../../models/master/countries';
import { ICountry, ICountryModel } from '../../../models/master/countries/ICountry';
import * as Promise from 'bluebird';
import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../../query-base';

export class GetStatesForCountryQuery extends QueryBase<IState[]> {

    constructor(public identity: IIdentity, private _StateModel: IStateModel) {
        super(identity);
    }

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
