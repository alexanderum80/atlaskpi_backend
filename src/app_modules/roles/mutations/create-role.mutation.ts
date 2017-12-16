import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IRoleCustom } from '../../../domain/app/security/roles/role';
import { Roles } from '../../../domain/app/security/roles/role.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateRoleActivity } from '../activities/create-role.activity';
import { Role, RoleDetailsInput } from '../roles.types';


@injectable()
@mutation({
    name: 'createRole',
    activity: CreateRoleActivity,
    parameters: [
        { name: 'data', type: RoleDetailsInput },
    ],
    output: { type: Role }
})
export class CreateRoleMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Roles.name) private _roles: Roles) {
        super();
    }

    run(data: { data: IRoleCustom  }): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            return this._roles.model.createRole(data.data).then((response) => {
                return resolve({success: true, entity: response });
            }).catch((err) => {
                return resolve({ success: false, errors: [ { field: 'role', errors: [err] } ]});
            });
        });
    }
}
