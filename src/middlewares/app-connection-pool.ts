import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { remove } from 'lodash';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { connectToMongoDb } from '../helpers/mongodb.helpers';

export interface IConnectionDetails {
    uri: string;
    connection: mongoose.Connection;
}

@injectable()
export class AppConnectionPool {
    private _connectionPool: IConnectionDetails[];

    constructor() {
        console.log('Creating AppConnectionPool');
        this._connectionPool = [];
    }

    getConnection(uri: string): Promise<mongoose.Connection> {
        const that = this;
        const connectionWithSameUri = this._getConnectionWithSameUri(uri);
        
        return new Promise<mongoose.Connection>((resolve, reject) => {
            /**
             * Connection ready state
             * 0 = disconnected
             * 1 = connected
             * 2 = connecting
             * 3 = disconnecting
             * Each state change emits its associated event name.
             */

            if (!connectionWithSameUri) {
                this._addConnection(uri).then(connection => {
                    resolve(connection);
                })
                .catch(err => reject(err));
            } else {
                logger.debug('Ready status connection: ' + connectionWithSameUri.connection.readyState);
                const ctxConnectionAlive = [1, 2].indexOf(connectionWithSameUri.connection.readyState) !== -1;

                if (ctxConnectionAlive) {
                    logger.debug('Reusing existing connections');
                    return resolve(connectionWithSameUri.connection);
                } else {
                    this._removeContext(uri);
                    this._addConnection(uri).then(connection => {
                        resolve(connection);
                    })
                    .catch(err => reject(err));
                }
            }
        });

    }

    private _getConnectionWithSameUri(uri: string) {
        return this._connectionPool.find(details => details.uri === uri);
    }

    private _removeContext(uri: string) {
        logger.debug('Removing obsolete context');

        remove(this._connectionPool, (details) => {
            return details.uri === uri;
        });
    }

    private _addConnection(uri: string): Promise<mongoose.Connection> {
        const that = this;
        const contextDetails = this._connectionPool.find(details => details.uri === uri);

        return new Promise<mongoose.Connection>((resolve, reject) => {
            if (!contextDetails) {
                connectToMongoDb(uri).then((m) => {
                    // sometime we are going to have connections to close to each other so even after
                    // I create a connection I need to check again if this connection was already created before use it
                    const connectionWithSameUri = that._getConnectionWithSameUri(uri);

                    if (connectionWithSameUri) {
                        // console.log('Closing non-needed connection to: ' + uri);

                        m.close();
                        return resolve(connectionWithSameUri.connection);
                    }

                    // console.log('Adding new connection to the pool for: ' + uri);
                    that._connectionPool.push({
                        uri: uri,
                        connection: m
                    });
                    resolve(m);
                })
                .catch(e => {
                    logger.error('There was an error creating a new connection to: ' + uri, e);
                    reject(e);
                });
            }
        });
    }

}