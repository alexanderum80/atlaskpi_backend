import { IOAuth2Token } from '../../common/oauth2-token.model';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IBaseAudit {
    createdOn: Date;
    updatedOn?: Date;
}

export interface IUserAudit extends IBaseAudit {
    createdBy: string;
    updatedBy?: string;
}

export interface IConnectorConfigScope {
    name: string;
}

export interface IConnectorConfig {
    token: IOAuth2Token;
    realmId?: string;
    scope: IConnectorConfigScope[];
}

export interface IConnector extends IUserAudit {
    name?: string;
    databaseName: string;
    type: string;
    active: boolean;
    config: IConnectorConfig;
}

export interface IConnectorDocument extends IConnector, mongoose.Document {}

export interface IConnectorModel extends mongoose.Model<IConnectorDocument> {
    addConnector(data: any): Promise<IConnectorDocument>;
    updateConnector(data: any, access_token: string): Promise<IConnectorDocument>;
    removeConnector(data: any): Promise<IConnectorDocument>;
}