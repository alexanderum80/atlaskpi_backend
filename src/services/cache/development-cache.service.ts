import { injectable } from 'inversify';

import { ICacheService } from '../../framework/bridge';


@injectable()
export class DevelopmentCacheService implements ICacheService {
    private _cache = new Map<string, string>();

    async set(key: string, payload: any, ttl?: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._cache.set(key, JSON.stringify(payload));
            resolve();
        });
    }

    async get(key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // const data = this._cache.get(key);
            // if (!data) return resolve(null);

            // resolve(JSON.parse(data));

            resolve(null);
        });
    }

    async removePattern(pattern: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._cache.delete(pattern);
            resolve();
        });
    }
}