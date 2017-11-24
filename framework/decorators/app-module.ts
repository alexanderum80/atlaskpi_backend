import { IQuery } from '../queries/query';
import { IMutation } from '../mutations/mutation';

export interface IModule {
    imports?: IModule[];
    queries?: Array<new () => IQuery<any>>;
    mutations?: Array<new () => IMutation<any>>;
}

export interface IModuleDecoratorOptions extends IModule {

}

export function Module(options: IModule) {
    return function (target: Object) {
        console.log('AppModule Decorator: called');
    };
}