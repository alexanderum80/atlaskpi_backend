import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateSystemActivity } from '../activities/create-system.activity';
import { SystemInput, CreateSystemResponse  } from '../system.types';
import { Systems } from '../../../domain/app/system/system.model';
import { ISystemDocument, ISystemInput } from '../../../domain/app/system/system';


@injectable()
@mutation({
    name: 'createSystem',
    activity: CreateSystemActivity,
    parameters: [
        { name: 'systemInput', type: SystemInput },
    ],
    output: { type: CreateSystemResponse }
})
export class CreateSystemMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Systems.name) private _system: Systems) {
        super();
    }

    run(data: { systemInput: ISystemInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._system.model.createNew(data.systemInput)
            .then(system => {
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
                            errors: ['There was an error creating the system']
                        }
                    ]
                });
            });
        });
    }
}
