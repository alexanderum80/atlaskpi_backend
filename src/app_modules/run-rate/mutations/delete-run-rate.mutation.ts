import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteRunRateActivity } from '../activities/delete-delete.activity';
import { DeleteChartRunRateResponse  } from '../run-rate.types';
import { ChartRunRates } from '../../../domain/app/run-rate/run-rate.model';


@injectable()
@mutation({
    name: 'deleteChartRunRate',
    activity: DeleteRunRateActivity ,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteChartRunRateResponse }
})
export class DeleteChartRunRateMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(ChartRunRates.name) private _chartRunRate: ChartRunRates) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._chartRunRate.model.deleteChartRunRate(data._id).then(chartRunRate => {
                resolve({
                    success: chartRunRate !== null,
                    errors: chartRunRate !== null ? [] : [{ field: 'general', errors: ['Run rate not found'] }]
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the run rate']
                        }
                    ]
                });
            });
        });
    }
}
