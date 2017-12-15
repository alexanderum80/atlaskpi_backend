import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { BusinessUnits } from '../../../domain/app/business-unit/business-unit-model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { BusinessUnitByIdActivity } from '../activities/business-unit-by-id.activity';
import { BusinessUnit } from '../business-units.types';

@injectable()
@query({
    name: 'businessUnitById',
    activity: BusinessUnitByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: BusinessUnit }
})
export class BusinessUnitByIdQuery implements IQuery<BusinessUnit> {
    constructor(@inject('BusinessUnits') private _businessUnits: BusinessUnits) { }

    run(data: { id: string }): Promise<BusinessUnit> {
        return this._businessUnits.model.businessUnitById(data.id);
    }
}
