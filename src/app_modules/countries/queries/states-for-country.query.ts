import * as Promise from 'bluebird';
import { injectable } from 'inversify';

import { IIdentity } from '../../../domain/app/security/users/identity';
import { IState, IStateModel } from '../../../domain/master/countries/State';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetCountriesActivity } from '../activities/get-countries.activity';
import { Country, State } from '../countries.types';
import { inject } from 'inversify';
import { States } from '../../../domain/master/countries/state.model';


@injectable()
@query({
    name: 'statesFor',
    activity: GetCountriesActivity,
    parameters: [
        { name: 'country', type: String, required: true }
    ],
    output: { type: State, isArray: true }
})
export class StatesForCountryQuery implements IQuery<IState[]> {

    constructor(@inject(States.name) private _states: States) { }

    run(data: { country: string }): Promise<IState[]> {
        return new Promise<IState[]>((resolve, reject) => {
            this._states.model.find({ country: data.country }).then((states) => {
                resolve(states);
            }, (err) => {
                reject(err);
            });
        });
    }
}
