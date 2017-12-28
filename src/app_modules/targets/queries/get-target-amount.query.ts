import { IQuery } from '../../../framework/queries/query';
import { GetTargetAmountActivity } from '../activities/get-target-amount.activity';
import { TargetAmountInput, TargetAmountResponse } from '../targets.types';
import { TargetService } from '../../../services/target.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';

@injectable()
@query({
    name: 'targetAmount',
    activity: GetTargetAmountActivity
    parameters: [
        { name: 'input', type: TargetAmountInput }
    ],
    output: { type: TargetAmountResponse }
})

export class GetTargetAmountQuery implements IQuery<any> {
    constructor(@inject(TargetService.name) private _targetService: TargetService) {}

    run(data: { input: TargetAmountInput }): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that._targetService.caculateFormat(data.input)
                .then((targetAmount) => {
                    resolve({ amount: targetAmount });
                    return;
                }).catch(err => {
                    reject(err);
                    return;
                });
        });
    }
}