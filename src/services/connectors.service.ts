import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IntegrationConnectorFactory } from '../app_modules/integrations/models/integration-connectors.factory';
import { loadIntegrationConfig } from '../app_modules/integrations/models/load-integration-controller';
import { Logger } from '../domain/app/logger';
import { IConnectorDocument } from '../domain/master/connectors/connector';
import { Connectors } from '../domain/master/connectors/connector.model';


@injectable()
export class ConnectorsService {

    constructor(
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(IntegrationConnectorFactory.name) private _integrationConnectorFactory: IntegrationConnectorFactory,
        @inject(Logger.name) private _logger: Logger
    ) { }

    findConnectorsByDatabaseName(databaseName: string): Promise<IConnectorDocument[]> {
        const that = this;
        return new Promise<IConnectorDocument[]>((resolve, reject) => {
            that._connectors.model.find({ databaseName: databaseName })
            .then(connectors => {
                return resolve(connectors);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    findConnectorsBySubdomain(subdomain: string): Promise<IConnectorDocument[]> {
        const that = this;
        return new Promise<IConnectorDocument[]>((resolve, reject) => {
            that._connectors.model.find({ subdomain: subdomain })
            .then(connectors => {
                return resolve(connectors);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    removeConnector(id: string): Promise<IConnectorDocument> {
        const that = this;
        return new Promise<IConnectorDocument>((resolve, reject) => {
            that._connectors.model.removeConnector(id)
                .then((deletedConnector) => {
                    // try to transparently revoke the token
                    that._disconnect(deletedConnector)
                        .then(() => {
                            that._logger.debug('connector: ' + deletedConnector.name + ' disconnected');
                        })
                        .catch(err => {
                            that._logger.debug('could not disconnect ' + deletedConnector.name);
                        });
                    resolve(deletedConnector);
                    return;
                })
                .catch(err => reject(err));
        });
    }

    private _disconnect(doc: IConnectorDocument): Promise<any> {
        const that = this;
        return loadIntegrationConfig(this._connectors, doc.type).then(docConfig => {
            const connector = that._integrationConnectorFactory.getInstanceFromDocument(docConfig.config, doc);
            if (!connector) {
                return Promise.reject('could not get an instance of the connector');
            }
            return connector.revokeToken();
        });
    }
}