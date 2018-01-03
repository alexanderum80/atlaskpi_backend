import { CallRailInput, CallRailResponse } from '../callrail.types';
import { CreateCallRailConnectorActivity } from '../activities/create-callrail-connector.activity';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';
import { mutation } from '../../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../../framework/mutations/mutation-response';

@mutation({
    name: 'callRailConnect',
    activity: CreateCallRailConnectorActivity,
    parameters: [
        { name: 'input', type: CallRailInput }
    ],
    output: { type: CallRailResponse }
})

@injectable()
export class CreateCallRailConnectorMutation extends MutationBase<IMutationResponse> {
    constructor() {
        super();
    }

    run(input: CallRailInput): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!input) {
                reject({ success: false, errors: [{ field: 'input', errors: ['No data provided'] }] });
                return;
            }

            if (!input.accountId || !input.apiKey) {
                reject({ success: false, errors: [{ field: 'input', errors: ['Missing one field']}] });
                return;
            }

            
        });
    }
}