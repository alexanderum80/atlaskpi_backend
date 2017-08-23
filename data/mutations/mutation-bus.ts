import {
    IIdentity,
    IMasterModels,
    IAppModels,
    IMutation,
    MutationResponse,
    IValidationResult,
    LocalizedError
} from '..';
import { Enforcer, getEnforcerConfig, IEnforcer } from '../../lib/enforcer';
import { ExtendedRequest } from '../../middlewares';
import * as Promise from 'bluebird';
import { CreateAccessLogMutation } from './app/access-log';


export interface IMutationBus {
    run<T>(activityName: string, req: ExtendedRequest, mutation: IMutation<T>, data: any): Promise<any>;
}

export class MutationBus implements IMutationBus {

    authorizedValue: any;
    errorBool: any;
    errorStr: any;
    logParams: any;

    public get enforcer():  IEnforcer {
        return this._enforcer;
    }

    constructor(private _enforcer: IEnforcer) {}

    run<T>(activityName: string, req: ExtendedRequest, mutation: IMutation<T>, data: any): Promise<any> {
        const that = this;
        // chack activity authorization
        return this.enforcer.authorizationTo(activityName, mutation.identity)
            .then((authorized) => {
                that.authorizedValue = authorized;
                if (!authorized) {
                    return Promise.reject(authorized);
                }

                // run the mutation validation
                return mutation.validate ? mutation.validate(data) : { success: true };
            })
            .then((result: IValidationResult) => {
                // if it is valid
                if (!result.success) {
                    return Promise.reject(LocalizedError.fromValidationResult(req, result));
                }

                return Promise.resolve(true);
            })
            .then((validated: boolean) => {
                return mutation.run(data);
            })
            .then((res: T) => {
                if (res instanceof MutationResponse) {
                    return res.localized(req);
                } else {
                    return res;
                }
            })
            .catch((err) => {
                that.errorStr = err;
                return Promise.reject(err);
            }).finally(() => {
                if ((mutation.log === true) && activityName !== 'create-access-log') {
                    that.logParams = {
                        timestamp: Date.now(),
                        accessBy: mutation.identity.firstName + ' ' + mutation.identity.lastName,
                        ipAddress: req.connection.remoteAddress,
                        event: mutation.constructor.name,
                        clientDetails: req.get('User-Agent'),
                        eventType: 'mutation',
                        payload: JSON.stringify(req.body),
                        results: {
                            authorized: that.authorizedValue,
                            status: true,
                            details: that.errorStr || ('Success executing ' + mutation.constructor.name)
                        }
                    };
                    let accessLog = new CreateAccessLogMutation(mutation.identity, req.appContext.AccessModel);
                    accessLog.run(that.logParams);
                }

            })
    }
}


let _mutationBus: IMutationBus = null;

export function getMutationBusSingleton() {
    if (!_mutationBus) {
        let enforcer = new Enforcer(getEnforcerConfig());
        _mutationBus = new MutationBus(enforcer);
    }

    return _mutationBus;
}


