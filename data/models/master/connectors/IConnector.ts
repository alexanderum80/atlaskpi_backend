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

export interface ISquareConnectorConfigScope {
    name: string;
}

export interface ISquareConnectorConfig {
    token: IOAuth2Token;
    scope: ISquareConnectorConfigScope[];
}

export interface IConnector extends IUserAudit {
    name?: string;
    databaseName: string;
    type: string;
    active: string;
    config: ISquareConnectorConfig;
}

export interface IConnectorDocument extends IConnector, mongoose.Document {}

export interface IConnectorModel extends mongoose.Model<IConnectorDocument> {
    addConnector(data: any, token: string): Promise<IConnectorDocument>;
    updateConnector(access_token: string): Promise<IConnectorDocument>;
}