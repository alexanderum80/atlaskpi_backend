import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindHelpCenterUserByIdActivity } from '../activities/help-center-user-by-id.activity';
import { HelpCenterUser } from '../help-center.types';
import { IHelpCenterUserDocument } from '../../../domain/app/help-center-user/help-center-user';
import { HelpCenterUsers } from '../../../domain/app/help-center-user/help-center-user.model';
import { IEmployeeDocument } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';


@injectable()
@query({
    name: 'helpCenterUserById',
    activity: FindHelpCenterUserByIdActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: HelpCenterUser }
})
export class HelpCenterUserByIdQuery implements IQuery<IHelpCenterUserDocument> {
    constructor(@inject(HelpCenterUsers.name) private _helpCenterUser: HelpCenterUsers) { }

    run(data: { _id: string }): Promise<IHelpCenterUserDocument> {
        return this._helpCenterUser.model.helpCenterUserById(data._id);
    }
}
