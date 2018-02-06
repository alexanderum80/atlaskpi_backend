import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateChartRunRateActivity } from '../activities/update-run-rate.activity';
import { ChartRunRateInput, UpdateChartRunRateResponse } from '../run-rate.types';
import { IChartRunRateInput } from '../../../domain/app/run-rate/run-rate';
import { ChartRunRates } from '../../../domain/app/run-rate/run-rate.model';


@injectable()
@mutation({
    name: 'updateChartRunRate',
    activity: UpdateChartRunRateActivity ,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'chartRunRateInput', type: ChartRunRateInput },
    ],
    output: { type: UpdateChartRunRateResponse }
})
export class UpdateChartRunRateMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(ChartRunRates.name) private _chartRunRate: ChartRunRates) {
        super();
    }

    run(data: { _id: string, ChartRunRate: IChartRunRateInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._chartRunRate.model.updateChartRunRate(data._id, data.ChartRunRate).then(chartRunRate => {
                resolve({
                    success: true,
                    entity: chartRunRate
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the run rate']
                        }
                    ]
                });
            });
        });
    }
}
