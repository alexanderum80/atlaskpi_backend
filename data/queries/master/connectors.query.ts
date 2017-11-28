import { IQuery } from '..';
import { IConnector, IConnectorModel } from '../..';
import { IIdentity } from '../../';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export class ConnectorsQuery implements IQuery<IConnector[]> {

    constructor(public identity: IIdentity, private _ConnectorModel: IConnectorModel) {}

    run(data: any): Promise<IConnector[]> {
        const that = this;
        return new Promise<IConnector[]>((resolve, reject) => {
            mongoose.set('debug', true);
            that._ConnectorModel.find({})
                .then(connectors => {
                    return resolve(connectors);
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }
}
