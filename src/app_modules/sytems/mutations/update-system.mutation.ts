import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateSystemActivity } from '../activities/update-system.activity';
import { SystemInput, UpdateSystemResponse } from '../system.types';
import { ISystemInput } from '../../../domain/app/system/system';
import { Systems } from '../../../domain/app/system/system.model';


@injectable()
@mutation({
    name: 'updateSystem',
    activity: UpdateSystemActivity ,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'systemInput', type: SystemInput },
    ],
    output: { type: UpdateSystemResponse }
})
export class UpdateSystemMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Systems.name) private _system: Systems) {
        super();
    }

    run(data: { _id: string, System: ISystemInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._system.model.updateSystem(data._id, data.System).then(system => {
                resolve({
                    success: true,
                    entity: system
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the system']
                        }
                    ]
                });
            });
        });
    }
}
