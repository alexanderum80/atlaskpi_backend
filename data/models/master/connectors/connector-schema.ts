import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IConnector, IConnectorModel, IConnectorDocument } from './IConnector';

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

ConnectorSchema.statics.addConnector = function(data: IConnector): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        if (!data) { reject({ message: 'no data provided'}); }
        const findOneKey = data.uniqueKeyValue;

        that.findOne({
            [findOneKey.key]: findOneKey.value
        }, (err, doc) => {
            if (err) {
                reject({ message: 'unknown error', error: err });
            }
            if (doc) {
                that.update({
                    [findOneKey.key]: findOneKey.value
                }, data)
                .then(updateResp => resolve(updateResp))
                .catch(updateErr => reject(updateErr));
                return;
            }
            that.create(data, (errCreate, connector: IConnectorDocument) => {
                if (errCreate) {
                    reject({ message: 'Not able to add connector', error: errCreate});
                    return;
                }
                resolve(connector);
            });
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

ConnectorSchema.statics.removeConnector = function(id: string): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        that.findOne({_id: id})
            .then(connector => {
                if (connector) {
                    const deletedConnector = connector;

                    connector.remove((err, connector: IConnectorDocument) => {
                        if (err) {
                            reject({ message: 'There was an error removing a connector', error: err});
                            return;
                        }
                        // revoking the token from integration
                        // let connectorType = getTokenType(deletedConnector);
                        // if (connectorType && connectorType.url && connectorType.headers) {
                        //     revokeToken(connectorType.url, connectorType.headers, connectorType.body);
                        // }

                        resolve(deletedConnector);
                    });
                }
            }).catch(err => resolve(err));
    });
};

export function getConnectorModel(): IConnectorModel {
    return <IConnectorModel>mongoose.model('Connector', ConnectorSchema, 'connectors');
}
