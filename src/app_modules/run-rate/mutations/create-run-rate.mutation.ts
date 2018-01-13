import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IEmployeeInput } from '../../../domain/app/employees/employee';
import { Employees } from '../../../domain/app/employees/employee.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateRunRateActivity } from '../activities/create-run-rate.activity';
import { ChartRunRateInput, CreateChartRunRateResponse  } from '../run-rate.types';
import { ChartRunRates } from '../../../domain/app/run-rate/run-rate.model';
import { IChartRunRateInput } from '../../../domain/app/run-rate/run-rate';


@injectable()
@mutation({
    name: 'createChartRunRate',
    activity: CreateRunRateActivity,
    parameters: [
        { name: 'chartRunRateInput', type: ChartRunRateInput },
    ],
    output: { type: CreateChartRunRateResponse }
})
export class CreateChartRunRateMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(ChartRunRates.name) private _chartRunRate: ChartRunRates) {
        super();
    }

    run(data: { chartRunRateInput: IChartRunRateInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._chartRunRate.model.createNew(data.chartRunRateInput)
            .then(chartRunRate => {
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
                            errors: ['There was an error creating the run rate']
                        }
                    ]
                });
            });
        });
    }
}
