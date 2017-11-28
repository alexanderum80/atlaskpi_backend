import { IntegrationConnectorFactory } from './../../integrations/integration-connectors.factory';
import { IMutationResponse } from './../../models/common/mutation-response';
import { IIdentity } from './../../models/app/identity';
import { IConnectorModel, IConnectorDocument } from './../../models/master/connectors/IConnector';
import { WidgetFactory } from './../../models/app/widgets/widget-factory';
import { IWidget, IWidgetDocument } from './../../models/app/widgets/IWidget';
import { IUIWidget } from './../../models/app/widgets/ui-widget-base';
import { IAppModels } from './../../models/app/app-models';
import * as Promise from 'bluebird';

export class ConnectorsService {

    constructor(private _connectorModel: IConnectorModel) { }

    removeConnector(id: string): Promise<IConnectorDocument> {
        const that = this;
        return new Promise<IConnectorDocument>((resolve, reject) => {
            that._connectorModel.removeConnector(id)
                .then((deletedConnector) => {
                    that._disconnect(deletedConnector).then(() => {
                        resolve(deletedConnector );
                        return;
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    private _disconnect(doc: IConnectorDocument): Promise<any> {
        const that = this;
        const connector = IntegrationConnectorFactory.getInstanceFromDocument(doc);
        return connector.revokeToken();
    }
}