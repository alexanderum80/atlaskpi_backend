import { getContext } from '../data/models/app/app-context';

import * as logger from 'winston';
import * as _ from 'lodash';
import * as Promise from 'bluebird';
import { IAppModels } from '../data/models/app/app-models';

export interface IContextDetails {
    uri: string;
    context: IAppModels;
}

export class AppContextPool {
    private _contextPool: IContextDetails[];

    constructor() {
        this._contextPool = [];
    }

    getContext(uri: string): Promise<IAppModels> {
        const that = this;
        const ctxWithSameUri = _.find(this._contextPool, details => details.uri === uri);

        return new Promise<IAppModels>((resolve, reject) => {
            /**
             * Connection ready state
             * 0 = disconnected
             * 1 = connected
             * 2 = connecting
             * 3 = disconnecting
             * Each state change emits its associated event name.
             */

            if (!ctxWithSameUri) {
                this._createNewContext(uri).then(ctx => {
                    resolve(ctx);
                })
                .catch(err => reject(err));
            } else {
                logger.debug('Ready status connection: ' + ctxWithSameUri.context.Connection.readyState);
                const ctxConnectionAlive = [1, 2].indexOf(ctxWithSameUri.context.Connection.readyState) !== -1;

                if (ctxConnectionAlive) {
                    logger.debug('Reusing existing app context');
                    return resolve(ctxWithSameUri.context);
                } else {
                    this._removeContext(uri);
                    this._createNewContext(uri).then(ctx => {
                        resolve(ctx);
                    })
                    .catch(err => reject(err));
                }
            }
        });

    }

    private _removeContext(uri: string) {
        logger.debug('Removing obsolete context');

        _.remove(this._contextPool, (details) => {
            return details.uri === uri;
        });
    }

    private _addContext(uri: string, ctx: IAppModels) {
        const contextDetails = _.find(this._contextPool, details => details.uri === uri);

        if (!contextDetails) {
            this._contextPool.push({
                uri: uri,
                context: ctx
            });
        }
    }

    private _createNewContext(uri: string): Promise<IAppModels> {
        logger.debug('Creating new app context');
        const that = this;

        return new Promise<IAppModels>((resolve, reject) => {
            getContext(uri).then(ctx => {
                    that._addContext(uri, ctx);
                    resolve(ctx);
                })
                .catch(err => {
                    logger.error('Error creating app context for', err);
                    reject(err);
                });
        });
    }

}