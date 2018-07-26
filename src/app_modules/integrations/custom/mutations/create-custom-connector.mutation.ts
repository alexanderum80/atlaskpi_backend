import { ICustomInput, ICustomResponse } from '../custom.types';
import { VirtualSources } from '../../../../domain/app/virtual-sources/virtual-source.model';
import { CurrentAccount } from '../../../../domain/master/current-account';
import { IConnector } from '../../../../domain/master/connectors/connector';
import { CreateCustomConnectorActivity } from '../activities/create-custom-connector.activity';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';
import { mutation } from '../../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../../framework/mutations/mutation-response';
import { Connectors } from '../../../../domain/master/connectors/connector.model';
import { runTask } from '../../helpers/run-task.helper';
import { Logger } from '../../../../domain/app/logger';
import { IVirtualSource, IVirtualSourceFields } from '../../../../domain/app/virtual-sources/virtual-source';
import { camelCase } from 'change-case';
import { DataSourcesService } from '../../../../services/data-sources.service';


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
                @inject(VirtualSources.name) private _virtualSourceModel: VirtualSources,
                @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
                @inject(DataSourcesService.name) private _dataSourceService: DataSourcesService,
                @inject(Connectors.name) private _connectors: Connectors,
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
            const inputName = data.input.inputName.split('.')[0];
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

            const connObj: IConnector = {
                name: data.input.inputName,
                databaseName: that._currentAccount.get.database.name,
                type: connectorType,
                virtualSource: camelCase(inputName).toLowerCase(),
                config: {},
                createdBy: 'backend',
                createdOn: new Date(Date.now()),
                active: true
            };

            that._connectors.model.addConnector(connObj).then(() => {
                let collectionName = camelCase(inputName);
                collectionName = collectionName.substr(collectionName.length - 1, 1) !== 's'
                                    ? collectionName.concat('s') : collectionName;

                const inputDateField = data.input.fields.find(f => f.dataType === 'Date');
                let inputFieldsMap: IVirtualSourceFields = {};

                data.input.fields.map(f => {
                    const field = f.columnName;
                    const dataType = f.dataType;
                    inputFieldsMap[field] = {
                        path: field,
                        dataType: dataType,
                    };
                    if (dataType === 'String') {
                        inputFieldsMap[field].allowGrouping = true;
                    }
                });

                const virtualSourceObj: IVirtualSource = {
                    name: camelCase(inputName).toLowerCase(),
                    description: data.input.inputName,
                    source: camelCase(collectionName).toLowerCase(),
                    modelIdentifier: camelCase(collectionName).toLowerCase(),
                    dateField: inputDateField.columnName,
                    aggregate: [],
                    fieldsMap: inputFieldsMap
                };

                that._virtualSourceModel.model.addDataSources(virtualSourceObj).then(newVirtualSource => {
                    data.input.inputName = collectionName;
                    data.input.records = JSON.parse(data.input.records);

                    this._dataSourceService.createVirtualSourceMapCollection(data);

                    resolve({ success: true });
                    return;
                }).catch(err => {
                    resolve({ success: false, errors: [{ field: 'dataSource', errors: ['Unable to add data source'] }] });
                    return;
                });
            }).catch(err => {
                resolve({ success: false, errors: [{ field: 'connectors', errors: ['Unable to add connector'] }] });
                return;
            });
        });
    }
}