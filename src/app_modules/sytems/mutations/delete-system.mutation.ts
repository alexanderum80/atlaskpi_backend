import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteSystemActivity } from '../activities/delete-system.activity';
import { DeleteSystemResponse  } from '../system.types';
import { Systems } from '../../../domain/app/system/system.model';


@injectable()
@mutation({
    name: 'deleteSystem',
    activity: DeleteSystemActivity ,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteSystemResponse }
})
export class DeleteSystemMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Systems.name) private _system: Systems) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._system.model.deleteSystem(data._id).then(system => {
                resolve({
                    success: system !== null,
                    errors: system !== null ? [] : [{ field: 'general', errors: ['System not found'] }]
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the system']
                        }
                    ]
                });
            });
        });
    }
}
