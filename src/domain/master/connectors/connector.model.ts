import { inject, injectable } from 'inversify';
import mongoose = require('mongoose');

import { userAuditSchema } from './../../common/audit.schema';
import { IConnector, IConnectorDocument, IConnectorModel } from './connector';
import { ModelBase } from '../../../type-mongo/model-base';
import { MasterConnection } from '../master.connection';

const Schema = mongoose.Schema;

const ConnectorSchema = new Schema({
    name: String!,
    databaseName: String!,
    subdomain: String!,
    type: String!,
    virtualSource: String,
    active: Boolean,
    config: mongoose.Schema.Types.Mixed,
    task: mongoose.Schema.Types.Mixed,
    ... userAuditSchema
});

ConnectorSchema.statics.addConnector = addConnector;
ConnectorSchema.statics.updateConnector = updateConnector;
ConnectorSchema.statics.removeConnector = removeConnector;
ConnectorSchema.statics.getConnectorByName = getConnectorByName;
ConnectorSchema.statics.getReportingConnectors = getReportingConnectors;


// Method's Implementation

function addConnector(data: IConnector): Promise<IConnectorDocument> {
    if (!data) { return Promise.reject('cannot add a document with, empty payload'); }
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
            return that.create(data)
                        .then((newConnector: IConnectorDocument) => {
                            resolve(newConnector);
                            return;
                        })
                        .catch(err => {
                            reject('cannot create connector: ' + err);
                            return;
                        });
    });
}

function updateConnector(data: IConnector, token: string): Promise<IConnectorDocument> {
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
}

function removeConnector(id: string): Promise<IConnectorDocument> {
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
}

function getReportingConnectors(subdomain: string): Promise<IConnectorDocument[]> {
    return this.find({
        subdomain: subdomain,
        virtualSource: { $ne: null },
        type: 'googleanalytics'
    });
}

async function getConnectorByName(name: string): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        that.findOne({ name: name })
        .then(connector => {
            return resolve(connector);
        })
        .catch(err => {
            return reject(err);
        });
    });
}


@injectable()
export class Connectors extends ModelBase<IConnectorModel> {
    constructor(@inject(MasterConnection.name) masterConnection: MasterConnection) {
        super();
        this.initializeModel(masterConnection.get, 'Connector', ConnectorSchema, 'connectors');
    }
}