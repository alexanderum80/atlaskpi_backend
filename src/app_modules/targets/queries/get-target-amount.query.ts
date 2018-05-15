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
    activity: GetTargetAmountActivity,
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
            const targetAmount = that._targetService.getTargetValue(data.input);
            const targetMet = that._targetService.getTargetMet(data.input);

            const queries = {
                targetAmount: targetAmount,
                targetMet: targetMet
            };

            Promise.props(queries).then(target => {
                resolve({ amount: target.targetAmount, met: target.targetMet });
                return;
            }).catch(err => {
                reject(err);
            });
        });
    }
}