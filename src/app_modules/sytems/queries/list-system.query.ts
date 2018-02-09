import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListSystemActivity } from '../activities/list-system.activity';
import { ISystemInput, ISystemDocument } from '../../../domain/app/system/system';
import { Systems } from '../../../domain/app/system/system.model';
import { System } from '../system.types';

@injectable()
@query({
    name: 'system',
    activity: ListSystemActivity,
    output: { type: System , isArray: true }
})
export class ListSystemQuery implements IQuery<ISystemDocument[]> {

    constructor(@inject(Systems.name) private _system: Systems ) { }

    run(): Promise<ISystemDocument[]> {
        const that = this;

        return new Promise<ISystemDocument[]>((resolve, reject) => {
            that._system.model
            .find()
            .then(system => {
                return resolve(system);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }
}
