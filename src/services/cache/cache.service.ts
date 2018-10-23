import { inject, injectable } from 'inversify';
import * as redis from 'redis';

import { IAppConfig } from '../../configuration/config-models';
import { ICacheService } from '../../framework/bridge';


@injectable()
export class CacheService implements ICacheService {
    private _client: redis.RedisClient;

    constructor(@inject('Config') private _config: IAppConfig) {
        this._client = redis.createClient({
            host: _config.cache.redisServer,
            port: +_config.cache.redisPort,
        });
    }

    async set(key: string, payload: any, ttl?: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let expireIn = 3000; // 5 minutes;
                if (ttl) {
                    expireIn = ttl;
                }

                this._client.set(key, JSON.stringify(payload), 'EX', expireIn, (err: any, reply: 'OK') => {
                    if (err) return reject(err);
                    resolve();
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async get(key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                this._client.get(key, (err: any, reply: string) => {
                    if (err) return reject(err);

                    if (!reply) return resolve(null);

                    resolve(JSON.parse(reply));
                });
            } catch (e) {
                reject(e);
            }
        });
    }


}