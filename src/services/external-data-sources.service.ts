import { inject, injectable } from 'inversify';

import { ExternalDataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { Connectors } from './../domain/master/connectors/connector.model';
import { CurrentAccount } from './../domain/master/current-account';

@injectable()
export class ExternalDataSourcesService {

    constructor(
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources
    ) { }

    async get(): Promise<ExternalDataSourceResponse[]> {
        const reportingConnectors =  await this._connectors.model.getReportingConnectors(this._currentAccount.get.database.name);

        if (!reportingConnectors) {
            return [];
        }

        const virtualSourceNames = reportingConnectors.map(c => c.virtualSource);
        const virtualSources = await this._virtualSources.model.getDataSources(virtualSourceNames);

        return virtualSources.map(v => {
            const conn = reportingConnectors.find(c => c.virtualSource.toLowerCase() === v.name.toLowerCase());

            return {
                id: `${conn.type}$${conn.id}`,
                connectorId: conn.id,
                connectorType: conn.type,
                name: v.name,
                dataSource: v.dataSource,
                fields: v.fields,
                description: v.description
            };
        });
    }
}