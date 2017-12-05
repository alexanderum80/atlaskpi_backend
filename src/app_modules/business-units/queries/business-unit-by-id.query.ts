import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { BusinessUnits } from '../../../domain';
import { BusinessUnit } from '../business-units.types';
import { BusinessUnitByIdActivity } from '../activities';

@injectable()
@query({
    name: 'businessUnitById',
    activity: BusinessUnitByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: BusinessUnit }
})
export class BusinessUnitByIdQuery extends QueryBase<BusinessUnit> {
    constructor(@inject('BusinessUnits') private _businessUnits: BusinessUnits) {
        super();
    }

    run(data: { id: string }): Promise<BusinessUnit> {
        return this._businessUnits.model.businessUnitById(data.id);
    }
}
