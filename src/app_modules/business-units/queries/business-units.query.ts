import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { BusinessUnits, IBusinessUnitDocument } from '../../../domain';
import { BusinessUnit } from '../business-units.types';
import { BusinessUnitByIdActivity } from '../activities';

@injectable()
@query({
    name: 'businessUnits',
    activity: BusinessUnitByIdActivity,
    output: { type: BusinessUnit }
})
export class BusinessUnitsQuery implements IQuery<IBusinessUnitDocument[]> {
    constructor(@inject('BusinessUnits') private _businessUnits: BusinessUnits) {
        
    }

    run(data: { id: string }): Promise<IBusinessUnitDocument[]> {
        return this._businessUnits.model.businessUnits();
    }
}
