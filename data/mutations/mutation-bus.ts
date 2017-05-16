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


export interface IMutationBus {
    run<T>(activityName: string, req: ExtendedRequest, mutation: IMutation<T>, data: any): Promise<any>;
}

export class MutationBus implements IMutationBus {

    public get enforcer():  IEnforcer {
        return this._enforcer;
    }

    constructor(private _enforcer: IEnforcer) {}

    run<T>(activityName: string, req: ExtendedRequest, mutation: IMutation<T>, data: any): Promise<any> {
        // chack activity authorization
        return this.enforcer.authorizationTo(activityName, mutation.identity)
            .then((authorized) => {
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
                return Promise.reject(err);
            });
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


