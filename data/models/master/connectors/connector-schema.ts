import { userAuditSchema } from './../../common/audit.schema';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IConnector, IConnectorModel, IConnectorDocument } from './IConnector';

const Schema = mongoose.Schema;

const ConnectorSchema = new Schema({
    name: String!,
    databaseName: String!,
    type: String!,
    active: Boolean,
    config: mongoose.Schema.Types.Mixed,
    ... userAuditSchema
});

ConnectorSchema.statics.addConnector = function(data: IConnector): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        if (!data) { reject({ message: 'no data provided'}); }
        const findOneKey = data.uniqueKeyValue;

        that.findOne({ 'type': data.type,
                        [findOneKey.key]: findOneKey.value,
                        databaseName: data.databaseName
        }, (err, doc) => {
            if (err) {
                reject({ message: 'unknown error', error: err });
                return;
            }
            if (doc) {
                that.update({
                     'type': data.type,
                     [findOneKey.key]: findOneKey.value,
                     databaseName: data.databaseName
                }, data)
                .then(updateResp => {
                    resolve(updateResp);
                    return;
                })
                .catch(updateErr => reject(updateErr));
                return;
            }
            that.create(data, (errCreate, connector: IConnectorDocument) => {
                if (errCreate) {
                    reject({ message: 'Not able to add connector', error: errCreate});
                    return;
                }
                resolve(connector);
                return;
            });
        });
    });
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

                        resolve(deletedConnector);
                    });
                }
            }).catch(err => resolve(err));
    });
};

export function getConnectorModel(): IConnectorModel {
    return <IConnectorModel>mongoose.model('Connector', ConnectorSchema, 'connectors');
}
