import { IConnectorDocument } from './../../../../domain/master/connectors/connector';
import { ICustomInput, ICustomResponse } from '../custom.types';
import { CurrentAccount } from '../../../../domain/master/current-account';
import { CreateCustomConnectorActivity } from '../activities/create-custom-connector.activity';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';
import { mutation } from '../../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../../framework/mutations/mutation-response';
import { Connectors } from '../../../../domain/master/connectors/connector.model';
import { runTask } from '../../helpers/run-task.helper';
import { Logger } from '../../../../domain/app/logger';
import { ConnectorsService } from '../../../../services/connectors.service';


@injectable()
@mutation({
    name: 'customConnect',
    activity: CreateCustomConnectorActivity,
    parameters: [
        { name: 'input', type: ICustomInput }
    ],
    output: { type: ICustomResponse }
})
export class CreateCustomConnectorMutation extends MutationBase<IMutationResponse> {
    constructor(
                @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
                @inject(Connectors.name) private _connectors: Connectors,
                @inject(ConnectorsService.name) private _connectorsService: ConnectorsService,
                @inject(Logger.name) private _logger: Logger) {
        super();
    }

    run(data: { input: ICustomInput }): Promise<IMutationResponse> {
        const that = this;
        const input = data.input;
        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!input) {
                resolve({ success: false, errors: [{ field: 'input', errors: ['No data provided'] }] });
                return;
            }
            const inputExt = data.input.inputName.split('.')[1];

            let connectorType: string;
            switch (inputExt) {
                case 'xls':
                    connectorType = 'customexcel';
                    break;
                case 'xlsx':
                    connectorType = 'customexcel';
                    break;
                case 'csv':
                    connectorType = 'customcsv';
                    break;
                default:
                    connectorType = 'customtable';
                    break;
            }

            const query = {
                name: data.input.inputName,
                'type': connectorType,
                databaseName: that._currentAccount.get.database.name
            };

            that._connectors.model.findOne(query).then((connector: IConnectorDocument) => {
                if (connector) {
                    this._connectorsService.removeConnector(connector.id).then(() => {
                        that._connectorsService.createCustomConnector(input, connectorType).then(() => {
                            resolve({success: true});
                            return;
                        });
                    });
                } else {
                    that._connectorsService.createCustomConnector(input, connectorType).then(() => {
                        resolve({success: true});
                        return;
                    });
            }
            });
        });
    }
}