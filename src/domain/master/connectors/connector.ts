import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IOAuth2Token } from '../../common/oauth2-token';
import { IUserAudit } from './../../common/audit.model';
import { IKeyValuePair } from './../../common/key-value-pair';

export interface IConnectorConfigScope {
    name: string;
    filter?: any;
}

export interface IConnectorConfig {
    token: IOAuth2Token;
    realmId?: string;
    companyId?: string;
    pageId?: string;
    scope?: IConnectorConfigScope[];
    accountId?: string;
}

export interface IConnector extends IUserAudit {
    name: string;
    databaseName: string;
    type: string;
    active: boolean;
    config: IConnectorConfig | any;
    uniqueKeyValue?: IKeyValuePair;
}

export interface IConnectorDocument extends IConnector, mongoose.Document {}

export interface IConnectorModel extends mongoose.Model<IConnectorDocument> {
    addConnector(data: any): Promise<IConnectorDocument>;
    updateConnector(data: any, access_token: string): Promise<IConnectorDocument>;
    removeConnector(id: string): Promise<IConnectorDocument>;
}
