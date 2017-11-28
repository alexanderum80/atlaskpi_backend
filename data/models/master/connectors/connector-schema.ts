import { getTokenType, revokeToken } from './token-helpers.ts/revoke-token';
import { IConnectorDocument, IConnectorModel, IConnector } from './IConnector';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { findKey } from './token-helper';

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


ConnectorSchema.statics.addConnector = function(data: IConnector): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        if (!data) { reject({ message: 'no data provided'}); }

        that.findOne({
            [data.uniqueKeyValue.key]: data.uniqueKeyValue.value
        }, (err, doc) => {
            if (err) {
                reject({ message: 'unknown error', error: err });
            }
            if (doc) {
                that.update({
                    [data.uniqueKeyValue.key]: data.uniqueKeyValue.value
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
    // return new Promise<IConnectorDocument>((resolve, reject) => {
    //     that.create(data, (err, connector: IConnectorDocument) => {
    //         if (err) {
    //             reject({ message: 'Not able to add connector', error: err });
    //             return;
    //         }
    //         resolve(connector);
    //     });
    // });
};

ConnectorSchema.statics.updateConnector = function(data: IConnector, token: string): Promise<IConnectorDocument> {
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

ConnectorSchema.statics.removeConnector = function(data: any): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        that.findOne({_id: data._id})
            .then(connector => {
                if (connector) {
                    const deletedConnector = connector;

                    connector.remove((err, connector: IConnectorDocument) => {
                        if (err) {
                            reject({ message: 'There was an error removing a connector', error: err});
                            return;
                        }
                        // revoking the token from integration
                        let connectorType = getTokenType(deletedConnector);
                        if (connectorType && connectorType.url && connectorType.headers) {
                            revokeToken(connectorType.url, connectorType.headers, connectorType.body);
                        }

                        resolve(deletedConnector);
                    });
                }
            }).catch(err => resolve(err));
    });
};

export function getConnectorModel(): IConnectorModel {
    return <IConnectorModel>mongoose.model('Connector', ConnectorSchema, 'connectors');
}
