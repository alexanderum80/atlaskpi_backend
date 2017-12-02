import * as mongoose from 'mongoose';
import * as logger from 'winston';
import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { connectToMongoDb } from '../helpers';
import { remove } from 'lodash';

export interface IConnectionDetails {
    uri: string;
    connection: mongoose.Connection;
}

@injectable()
export class AppConnectionPool {
    private _connectionPool: IConnectionDetails[];

    constructor() {
        this._connectionPool = [];
    }

    getConnection(uri: string): Promise<mongoose.Connection> {
        const that = this;
        const connectionWithSameUri = this._connectionPool.find(details => details.uri === uri);

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

    private _removeContext(uri: string) {
        logger.debug('Removing obsolete context');

        remove(this._connectionPool, (details) => {
            return details.uri === uri;
        });
    }

    private _addConnection(uri: string): Promise<mongoose.Connection> {
        const that = this;
        const contextDetails = _.find(this._connectionPool, details => details.uri === uri);

        return new Promise<mongoose.Connection>((resolve, reject) => {
            if (!contextDetails) {
                connectToMongoDb(uri).then((m) => {
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