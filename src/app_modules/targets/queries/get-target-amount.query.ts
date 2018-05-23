import { IQuery } from '../../../framework/queries/query';
import { GetTargetAmountActivity } from '../activities/get-target-amount.activity';
import { TargetAmountInput, TargetAmountResponse } from '../targets.types';
import { TargetService } from '../../../services/target.service';
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

    async run(data: { input: TargetAmountInput }): Promise<any> {
        const that = this;

        try {
            const targetAmount = await this._targetService.getTargetValue(data.input);
            const targetMet = await this._targetService.getTargetMet(data.input);

            return ({
                amount: targetAmount,
                met: targetMet
            });
        } catch (err) {
            return err;
        }
    }
}