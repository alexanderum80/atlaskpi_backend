import { IActivity } from '../modules/security/activity';

export interface IParameterDefinition {
    name: string;
    type: any;
    required?: boolean;
    isArray?: boolean;
}

export interface ICacheOptions {
    /* time to live in seconds */
    ttl?: number;
    /** If provided it override the automatic key generation */
    overrideKey?: string;
}

const defaultCacheOptions: ICacheOptions = {
    ttl: 5,
};

export interface GraphQLQueryMutationDecoratorOptions {
    name?: string;
    activity: new (...args) => IActivity;
    parameters?: IParameterDefinition[];
    cache?: ICacheOptions;
    output: any;
}
