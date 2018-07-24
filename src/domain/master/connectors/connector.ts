import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IOAuth2Token } from '../../common/oauth2-token';
import { IUserAudit } from './../../common/audit.model';
import { IKeyValuePair } from './../../common/key-value-pair';
import { NameValuePair } from './../../common/name-value-pair';

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

export interface IConnectorTaskDefinition {
    container: string;
    schedule: string;
    id: string;
    environment?: NameValuePair[];
}

export interface IConnector extends IUserAudit {
    name: string;
    databaseName: string;
    subdomain: string;
    type: string;
    virtualSource?: string;
    active: boolean;
    config: IConnectorConfig | any;
    uniqueKeyValue?: IKeyValuePair;
    task?: IConnectorTaskDefinition;
}

export interface IConnectorDocument extends IConnector, mongoose.Document {}

export interface IConnectorModel extends mongoose.Model<IConnectorDocument> {
    addConnector(data: any): Promise<IConnectorDocument>;
    updateConnector(data: any, access_token: string): Promise<IConnectorDocument>;
    removeConnector(id: string): Promise<IConnectorDocument>;
    getReportingConnectors(databaseName: string): Promise<IConnectorDocument[]>;
}
