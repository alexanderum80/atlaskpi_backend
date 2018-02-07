import * as Promise from 'bluebird';
import { injectable } from 'inversify';

import { IIdentity } from '../../../domain/app/security/users/identity';
import { IState, IStateModel } from '../../../domain/master/countries/State';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetStatesActivity } from '../activities/get-states.activity';
import { Country, State } from '../countries.types';
import { inject } from 'inversify';
import { States } from '../../../domain/master/countries/state.model';


@injectable()
@query({
    name: 'statesAll',
    activity: GetStatesActivity,
    output: { type: State, isArray: true }
})
export class StatesAllQuery implements IQuery<IState[]> {

    constructor(@inject(States.name) private _states: States) { }

    run(): Promise<IState[]> {
        return new Promise<IState[]>((resolve, reject) => {
            this._states.model.find({}).then((states) => {
                resolve(states);
            }, (err) => {
                reject(err);
            });
        });
    }
}
