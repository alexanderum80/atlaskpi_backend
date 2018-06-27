import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as Twitter from 'node-twitter-api';

import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import { loadIntegrationConfig } from '../models/load-integration-controller';
import { Connectors } from './../../../domain/master/connectors/connector.model';

@injectable()
export class TwitterIntegrationController {

    private _twitter: Twitter;
    private _requestSecret: any;
    private _config: any;
    private _integrationDocument: IConnectorDocument;
    private _companyName: string;

    constructor(@inject(Connectors.name) private _connectorModel: Connectors) {
        if (!_connectorModel) {
            console.log('missing parameters...');
            return null;
        }
    }

    public initialize(companyName?: string): Promise<any> {
        this._companyName = companyName;
        const that = this;
        return new Promise<any>((resolve, reject) => {
            loadIntegrationConfig(that._connectorModel, 'twitter').then(configDoc => {
                if (!configDoc) {
                    reject('connector configuration not found');
                    return;
                }

                that._integrationDocument = configDoc;
                that._config = configDoc.config;

                that._twitter = new Twitter({
                    consumerKey: this._config.consumerKey,
                    consumerSecret: this._config.consumerSecret,
                    callback: this._config.callbackUrl + `access-token/?company_name=${this._companyName}`
                });

                resolve();
                return;
            })
            .catch(err => reject(err));
        });
    }

    public getRequestToken(req, res): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that._twitter.getRequestToken((err, requestToken, requestSecret) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    that._requestSecret = requestSecret;
                    res.redirect(this._config.endpoints.authenticate_url + '?oauth_token=' + requestToken);
                    resolve();
                    return;
                }
            });
        });
    }

    public getAccessToken(req, res): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            const requestToken = req.query.oauth_token;
            const verifier = req.query.oauth_verifier;

            that._twitter.getAccessToken(requestToken, that._requestSecret, verifier, (err, accessToken, accessSecret) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                        access_token: accessToken,
                        access_secret: accessSecret,
                });
                return;
            });
        });
    }

    public getUserInfo(token): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that._twitter.verifyCredentials(token.access_token, token.access_secret, (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (user) {
                    resolve(user);
                    return;
                }
            });
        });
    }

    public get integrationDocument(): IConnectorDocument {
        return this._integrationDocument;
    }
}