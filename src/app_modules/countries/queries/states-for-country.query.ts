import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { inject } from 'inversify';

import { IState } from '../../../domain/master/countries/State';
import { States } from '../../../domain/master/countries/state.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetStatesActivity } from '../activities/get-states.activity';
import { State } from '../countries.types';


@injectable()
@query({
    name: 'statesFor',
    activity: GetStatesActivity,
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
