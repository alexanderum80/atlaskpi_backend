import { CurrentAccount } from './../../../domain/master/current-account';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { Charts } from '../../../domain/app/charts/chart.model';
import { IDashboard } from '../../../domain/app/dashboards/dashboard';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { Logger } from '../../../domain/app/logger';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListConnectorsActivity } from '../activities/list-connectors.activity';
import { Connector } from '../connectors.types';
import { CurrentUser } from './../../../domain/app/current-user';
import { IConnector } from './../../../domain/master/connectors/connector';
import { Connectors } from '../../../domain/master/connectors/connector.model';


@injectable()
@query({
    name: 'connectors',
    activity: ListConnectorsActivity,
    output: { type: Connector, isArray: true }
})
export class ConnectorsQuery implements IQuery<IConnector[]> {
    constructor(
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(Logger.name) private _logger: Logger,
    ) { }

    run(data: { }): Promise<IConnector[]> {
        const that = this;
        return new Promise<IConnector[]>((resolve, reject) => {
            that._connectors.model.find({ databaseName: that._currentAccount.get.name })
                .then(connectors => {
                    return resolve(connectors);
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }
}
