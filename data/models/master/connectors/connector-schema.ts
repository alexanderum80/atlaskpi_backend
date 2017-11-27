import { IConnectorDocument, IConnectorModel } from './IConnector';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

const Schema = mongoose.Schema;

const baseAuditSchema = {
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
};

const userAuditSchema = {
    ...baseAuditSchema,
    createdBy: String,
    updatedBy: String
};

const ConnectorSchema = new Schema({
    name: String,
    databaseName: {
        type: String!
    },
    type: { type: String! },
    active: Boolean,
    config: mongoose.Schema.Types.Mixed,
    ...userAuditSchema
});

ConnectorSchema.statics.addConnector = function(data: IConnectorDocument): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        that.create(data, (err, connector: IConnectorDocument) => {
            if (err) {
                reject({ message: 'Not able to add connector', error: err });
                return;
            }
            resolve(connector);
        });
    });
};

ConnectorSchema.statics.updateConnector = function(data: IConnectorDocument, token: string): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        if (!token) {
            reject({ message: 'no token provided' });
            return;
        }

        that.findOneAndUpdate( { 'config.token.access_token': token, 'type': data.type }, {
            'config.token': data
        }, { new: true } )
        .exec()
        .then(res => {
            return resolve(res);
        }).catch(err => reject(err));
    });
};

export function getConnectorModel(): IConnectorModel {
    return <IConnectorModel>mongoose.model('Connector', ConnectorSchema, 'connectors');
}
