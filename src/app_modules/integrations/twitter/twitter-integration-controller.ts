import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import * as Twitter from 'node-twitter-api';

@injectable()
export class TwitterIntegrationController {

    private _twitter: Twitter;
    private _requestSecret: any;
    private _config: any;

    constructor(private _connectorModel: IConneZctorModel, private _companyName: string) {
        if (!_connectorModel || !_companyName) {
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
                    callback: this._config.callbackUrl + this._companyName + '/access-token'
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
}