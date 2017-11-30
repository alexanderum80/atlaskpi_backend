import { IOAuth2Token, IKeyValuePair } from './../../../integrations/models/connector-base';
import { IConnector } from './IConnector';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IUserAudit } from './../../common/audit.model';

export interface IConnectorConfigScope {
    name: string;
    filter?: any;
}

export interface IConnectorConfig {
    token: IOAuth2Token;
    realmId?: string;
    scope: IConnectorConfigScope[];
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
