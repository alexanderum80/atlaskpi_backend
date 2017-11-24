import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IConnector, IConnectorModel } from './IConnector';

export const baseAuditSchema = {
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
};

export const userAuditSchema = {
    ...baseAuditSchema,
    createdBy: String,
    updatedBy: String
};

// define mongo schema
const ConnectorSchema = new mongoose.Schema({
    name: String!,
    databaseName: { type: String! },
    type: { type: String!, enum: ['qbo'] },
    active: Boolean,
    config: mongoose.Schema.Types.Mixed,
    ... userAuditSchema
});

export function getConnectorModel(): IConnectorModel {
    return <IConnectorModel>mongoose.model('Connector', ConnectorSchema, 'connectors');
}
