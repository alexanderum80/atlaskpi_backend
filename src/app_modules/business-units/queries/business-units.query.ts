import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IBusinessUnitDocument } from '../../../domain/app/business-unit/business-unit';
import { BusinessUnits } from '../../../domain/app/business-unit/business-unit-model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListBusinessUnitsActivity } from '../activities/list-business-unit.activity';
import { BusinessUnit } from '../business-units.types';


@injectable()
@query({
    name: 'businessUnits',
    activity: ListBusinessUnitsActivity,
    output: { type: BusinessUnit, isArray: true }
})
export class BusinessUnitsQuery implements IQuery<IBusinessUnitDocument[]> {
    constructor(@inject(BusinessUnits.name) private _businessUnits: BusinessUnits) { }

    run(data: { id: string }): Promise<IBusinessUnitDocument[]> {
        return this._businessUnits.model.businessUnits();
    }
}
