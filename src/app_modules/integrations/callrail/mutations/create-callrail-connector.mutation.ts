import { CurrentAccount } from '../../../../domain/master/current-account';
import { CallRailService } from '../../../../services/callrail.services';
import { ConnectorTypeEnum, getConnectorTypeId } from '../../models/connector-type';
import { IConnector } from '../../../../domain/master/connectors/connector';
import { CallRailInput, CallRailResponse } from '../callrail.types';
import { CreateCallRailConnectorActivity } from '../activities/create-callrail-connector.activity';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';
import { mutation } from '../../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../../framework/mutations/mutation-response';
import { Connectors } from '../../../../domain/master/connectors/connector.model';

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
    constructor(
                @inject(Connectors.name) private _connectorModel: Connectors,
                @inject(CallRailService.name) private _callrailService: CallRailService,
                @inject(CurrentAccount.name) private _currentAccount: CurrentAccount) {
        super();
    }

    run(data: { input: CallRailInput }): Promise<IMutationResponse> {
        const that = this;
        const input = data.input;
        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!input) {
                resolve({ success: false, errors: [{ field: 'input', errors: ['No data provided'] }] });
                return;
            }

            if (!input.accountId || !input.apiKey) {
                resolve({ success: false, errors: [{ field: 'input', errors: ['Missing one field']}] });
                return;
            }

            that._callrailService.initialize().then(() => {
                that._callrailService.validateCredentials(input).then(valid => {
                    if (valid) {
                        that._callrailService.getUserName(input).then(callRailUser => {
                            const connObj: IConnector = {
                                name: callRailUser.name, // karl smith, query to get name
                                active: true,
                                config: {
                                    token: {
                                        accountId: input.accountId,
                                        apiKey: input.apiKey
                                    }
                                },
                                databaseName: that._currentAccount.get.database.name, // local database name
                                type: getConnectorTypeId(ConnectorTypeEnum.CallRail),
                                createdBy: 'backend',
                                createdOn: new Date(Date.now()),
                                uniqueKeyValue: {
                                    key: 'config.token.apiKey',
                                    value: input.apiKey
                                }
                            };

                            that._connectorModel.model.addConnector(connObj).then(() => {
                                resolve({ success: true });
                                return;
                            }).catch(err => {
                                resolve({ success: false, errors: [{ field: 'connector', errors: ['Unable to add connector'] }] });
                                return;
                            });
                        });
                    } else {
                        resolve({ success: false, errors: [{ field: 'callrail', errors: ['invalid credentials'] }] });
                        return;
                    }
                });
            }).catch(err => {
                resolve({ success: false, errors: [{ field: 'callrail', errors: ['unknown error'] } ]});
                return;
            });

        });
    }
}