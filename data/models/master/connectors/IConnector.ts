import { IOAuth2Token } from './../../../integrations/models/connector-base';
import { IConnector } from './IConnector';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';

export interface IBaseAudit {
    createdOn: Date;
    updatedOn?: Date;
}

export interface IUserAudit extends IBaseAudit {
    createdBy: string;
    updatedBy?: string;
}

export interface IQBOConnectorConfigScope {
    name: string;
    filter?: any;
}

export interface IQBOConnectorConfig {
    token: IOAuth2Token;
    realmId: string;
    scope: IQBOConnectorConfigScope[];
}

export interface IConnector extends IUserAudit {
    name: string;
    databaseName: string;
    type: string;
    active: boolean;
    config: IQBOConnectorConfig;
}

export interface IConnectorDocument extends IConnector, mongoose.Document {
}

export interface IConnectorModel extends mongoose.Model<IConnectorDocument> {
    addConnector(data: any): Promise<IConnectorDocument>;
    updateConnector(data: any, access_token: string): Promise<IConnectorDocument>;
    removeConnector(data: any): Promise<IConnectorDocument>;
}
