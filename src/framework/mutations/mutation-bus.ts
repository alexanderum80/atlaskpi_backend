import { injectable } from 'inversify';
import { inject } from 'inversify';
import { run } from 'tslint/lib/runner';
import { flatMap } from 'tslint/lib/utils';
import * as logger from 'winston';

import { AccessLogs } from '../../domain/app/access-log/access-log.model';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { IActivity } from '../modules/security/activity';
import { IEnforcer } from '../modules/security/enforcer';
import { IMutation } from './mutation';
import { Enforcer } from '../../app_modules/security/enforcer/enforcer';
import { IGraphqlArtifacts, BRIDGE, MetadataType, IArtifactDetails } from '../decorators/helpers';
import { IQuery } from '../queries/query';
import { ICacheService } from '../bridge';
import { constants } from '../constants';



export interface IMutationBus {
    run < T > (activity: new () => IActivity, req: IExtendedRequest, mutation: IMutation < T > , data: any): Promise < any > ;
}

@injectable()
export class MutationBus implements IMutationBus {

    authorizedValue: any;
    errorBool: any;
    errorStr: any;
    logParams: any;

    public get enforcer(): IEnforcer {
        return this._enforcer;
    }

    constructor(
        @inject(Enforcer.name) private _enforcer: IEnforcer,
        @inject(constants.CACHE_SERVICE) private _cacheService: ICacheService,
    ) {}

    async run < T > (activity: new () => IActivity, request: IExtendedRequest, mutation: IMutation < T > , data: any): Promise < any > {
        const that = this;

        try {

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

            if (!authorized) throw new Error('Unauthorized');

            const res = await (mutation as any).run(data);

            // process cache logic if necessary
            const mutations: IGraphqlArtifacts = BRIDGE.graphql[MetadataType.Mutations];
            const mutationMetadata = mutations[mutation.constructor.name] as IArtifactDetails;

            if (mutationMetadata.invalidateCacheFor) {
                mutationMetadata.invalidateCacheFor.forEach(query => {
                    // process cache logic if necessary
                    const keyPattern = this.generateCacheKeyPattern(request, query);
                    this._cacheService.removePattern(keyPattern);
                });
            }

            if (mutation.log === true) {
                const user = request.user;
                const accessBy = user ? user.profile.firstName + ' ' + user.profile.lastName : '';

                that.logParams = {
                    timestamp: Date.now(),
                    accessBy: accessBy,
                    ipAddress: request.connection.remoteAddress,
                    event: mutation.constructor.name,
                    clientDetails: request.get('User-Agent'),
                    eventType: 'mutation',
                    payload: JSON.stringify(request.body),
                    results: {
                        authorized: that.authorizedValue,
                        status: true,
                        details: that.errorStr || ('Success executing ' + mutation.constructor.name)
                    }
                };

                const accessLogs = request.Container.instance.get < AccessLogs > (AccessLogs.name);

                accessLogs.model.create(that.logParams);
            }

            return res;

        } catch (e) {
            logger.error(e);
            return null;
        }
    }

    private generateCacheKeyPattern(request: IExtendedRequest, query: new(...args) => IQuery<any>): string {
        return `${request.account.database.name}:${query.name}*`;
    }
}