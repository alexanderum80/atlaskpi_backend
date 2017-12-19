import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import { Connectors } from '../../../domain/master/connectors/connector.model';

export function loadIntegrationConfig(connector: Connectors, code: string): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        connector   .model
                    .findOne({ databaseName: 'atlas', type: 'integration-config', name: code, active: true })
                    .then(doc => {
                        if (!doc) {
                            reject('integration configuration not found or inactive...');
                            return;
                        }
                        resolve(doc);
                        return;
                    })
                    .catch(err => reject(err));
    });
}