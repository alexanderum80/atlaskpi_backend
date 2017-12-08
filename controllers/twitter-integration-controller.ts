import { IntegrationConnectorFactory } from '../data/integrations/integration-connectors.factory';
import { loadIntegrationConfig } from './integration-controller';
import { IOAuthConnector } from '../data/integrations/models/connector-base';
import { IConnector, IConnectorDocument, IConnectorModel } from '../data/models/master/connectors';
import * as Twitter from  'node-twitter-api';
import * as Promise from  'bluebird';

export class TwitterIntegrationController {

    private _twitter: Twitter;
    private _requestSecret: any;
    private _config: any;

    constructor(private _connectorModel: IConnectorModel) {
        if (!_connectorModel) {
            console.log('missing parameters...');
            return null;
        }
    }

    public initialize(): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            loadIntegrationConfig(that._connectorModel, 'twitter').then(configDoc => {
                if (!configDoc) {
                    reject('connector configuration not found');
                    return;
                }

                this._config = configDoc.config;

                this._twitter = new Twitter({
                    consumerKey: this._config.consumerKey,
                    consumerSecret: this._config.consumerSecret,
                    callback: this._config.callbackUrl + '/access-token'
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
                    res.status(500).send(err);
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
                    res.status(500).send(err);
                    reject(err);
                    return;
                  } else {
                      that._twitter.verifyCredentials(accessToken, accessSecret, (err, user) => {
                        if (err) {
                            res.status(500).send(err);
                            reject(err);
                            return;
                          } else {
                              resolve({
                                  access_token: accessToken,
                                  access_secret: accessSecret,
                                  user: user
                              });
                          }
                      });
                }
            });
        });
    }
}