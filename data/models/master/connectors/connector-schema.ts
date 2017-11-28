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

ConnectorSchema.statics.addConnector = function(data: IConnectorDocument): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        if (!data) { reject({ message: 'no data provided'}); }
        // that.findOne({
        //     'config.token.merchant_id': data.config.token.merchant_id
        // }, (err, role) => {
        //     if (err) {
        //         reject({ message: 'unknown error', error: err });
        //     }
        //     if (role) {
        //         reject({ message: 'connector exists' });
        //         return;
        //     }
            that.create(data, (errCreate, connector: IConnectorDocument) => {
                if (errCreate) {
                    reject({ message: 'Not able to add connector', error: errCreate});
                    return;
                }
                resolve(connector);
            });
        // });
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
