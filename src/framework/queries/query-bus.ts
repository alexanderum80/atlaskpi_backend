import { injectable } from 'inversify';
import { inject } from 'inversify';
import { flatMap } from 'lodash';
import * as logger from 'winston';

import { Enforcer } from '../../app_modules/security/enforcer/enforcer';
import { AccessLogs } from '../../domain/app/access-log/access-log.model';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { IActivity } from '../modules/security/activity';
import { IEnforcer } from '../modules/security/enforcer';
import { IQuery } from './query';
import { IGraphqlArtifacts, BRIDGE, MetadataType, IArtifactDetails } from '../decorators/helpers';
import { ICacheService } from '../bridge';
import { constants } from '../constants';

export interface IQueryBus {
    run<T>(activity: new () => IActivity, req: IExtendedRequest, query: IQuery<T>, data: any): Promise<any>;
}

@injectable()
export class QueryBus implements IQueryBus {

    authorizedValue: any;
    errorBool: any;
    errorStr: any;
    logParams: any;

    public get enforcer():  IEnforcer {
        return this._enforcer;
    }

    constructor(
        @inject(Enforcer.name) private _enforcer: IEnforcer,
        @inject(constants.CACHE_SERVICE) private _cacheService: ICacheService,
    ) { }

    async run<T>(activity: new () => IActivity, request: IExtendedRequest, query: IQuery<T>, data: any): Promise<any> {
        const that = this;

        // we are not going to have a user for every request so we need to take that into consideration
        let roles = [];
        let permissions = [];

        if (request.user) {
            roles = request.user.roles.map(r => r.name);
            permissions = flatMap(request.user.roles, (r) => r.permissions);
        }

        // get activity instance
        const act: IActivity = request.Container.instance.get(activity.name);

        // check activity authorization
        const authorized = await this.enforcer.authorizationTo(
            act,
            roles,
            permissions);

        if (!authorized) {
            return authorized;
        }

        // process cache logic if necessary
        const graphqlArtifact: IGraphqlArtifacts = BRIDGE.graphql[MetadataType.Queries];
        const queryMetadata = graphqlArtifact[query.constructor.name] as IArtifactDetails;
        const cacheKey = this.generateCacheKey(request, query, data);
        let cacheData: any = null;

        if (queryMetadata.cache) {
            cacheData = await this._cacheService.get(cacheKey);
        }

        let result: any = null;

        if (cacheData) {
            console.log('Returning data fom cache for query: ' + query.constructor.name);
            result = cacheData;
        } else {
            console.log('trying to run query: ' + query.constructor.name);
            result = await (query as any).run(data);

            // if cache is enabled save the results
            if (queryMetadata.cache) {
                this._cacheService.set(cacheKey, result, queryMetadata.cache.ttl);
            }

        }

        try {
            // sometimes when using Apollo Chrome Extension the request object is undefined
            if ((query.log === true) && request && request) {
                const user = request.user;
                const accessBy = user ? user.profile.firstName + ' ' + user.profile.lastName : '';

                that.logParams = {
                    timestamp: Date.now(),
                    accessBy: accessBy,
                    ipAddress: request.connection ? request.connection.remoteAddress : '',
                    event: query.constructor.name,
                    clientDetails: request.get('User-Agent'),
                    eventType: 'query',
                    payload: JSON.stringify(request.body),
                    results: {
                        authorized: that.authorizedValue,
                        status: true,
                        details: that.errorStr || ('Success executing ' + query.constructor.name)
                    }
                };
                const accessLogs = request.Container.instance.get<AccessLogs>(AccessLogs.name);

                accessLogs.model.create(that.logParams);
            }
        } catch (e) {
            console.error(e);
        }

        return result;
    }

    private generateCacheKey(request: IExtendedRequest, query: IQuery<any>, data: any): string {
        const keys = Object.keys(data);
        const suffix = keys.map(k => `${k}:${data[k]}`);

        return `${request.account.database.name}:${query.constructor.name}:${suffix.join(':')}`;
    }
}