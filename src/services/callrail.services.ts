import { loadIntegrationConfig } from '../app_modules/integrations/models/load-integration-controller';
import { Connectors } from '../domain/master/connectors/connector.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as request from 'request';
import { isNull } from 'lodash';

interface ICallRailInput {
    accountId: string;
    apiKey;
}

interface ICallRailHeader {
    Authorization: string;
}
interface ICallRailRequestData {
    url: string;
    headers: ICallRailHeader;
}

interface IGetUserNameResponse {
    name: string;
}

@injectable()
export class CallRailService {

    private _config: any;

    constructor(@inject(Connectors.name) private _connectorModel: Connectors) {}

    public initialize(): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            loadIntegrationConfig(that._connectorModel, 'callrail').then(configDoc => {
                if (!configDoc) {
                    reject('connect configuration not found');
                    return;
                }

                that._config = configDoc.config;
                resolve();
                return;
            }).catch(err => reject(err));
        });
    }
    validateCredentials(input: ICallRailInput): Promise<boolean> {
        const that = this;
        return new Promise<boolean>((resolve, reject) => {
            const url = `${that._config.callrailIntegration.endpoint}/${input.accountId}${that._config.usersApiUrl}`;
            const headers = {
                Authorization: 'Token token=' + input.apiKey
            };

            request({
                url: url,
                method: 'GET',
                headers: headers
            }, (error, response, body) => {
                const data = JSON.parse(body);
                resolve(data.error ? false : true);
                return;
            });
        });

    }
    getUserName(input: ICallRailInput): Promise<IGetUserNameResponse> {
        const that = this;

        return new Promise<IGetUserNameResponse>((resolve, reject) => {
            const url = `${that._config.callrailIntegration.endpoint}/${input.accountId}/${that._config.usersApiUrl}`;
            const headers = {
                Authorization: 'Token token=' + input.apiKey
            };

            request({
                url: url,
                method: 'GET',
                headers: headers
            }, (error, response, body) => {
                const data = JSON.parse(body);
                const findAdminUser = data.users.find(d => d.role === 'admin');
                if (!findAdminUser) {
                    resolve({ name: 'callrail' });
                    return;
                }

                resolve({ name: findAdminUser.name });
                return;
            });
        });

    }
}