import { Container } from 'inversify';
import { isString, isObject } from 'lodash';
import { Sales } from '../../domain/app/index';
import { Request } from 'express';
import { Error } from 'mongoose';

export interface TypeWithName {
    name: string;
}

interface Newable<T> {
    new (...args: any[]): T;
}
interface Abstract<T> {
    prototype: T;
}

type GenericObject = { [key: string]: any };

export interface IBridgeContainer {
    register<T extends Newable<any>>(type: T): void;
    registerSingleton<T extends Newable<any>>(type: T): void;
    registerPerWebRequest<T extends Newable<any>>(type: T): void;
    registerConstant<T extends GenericObject>(identifier: string, value: T): void;
    deregister<T extends Newable<any>>(identifier: string | T): void;

    loadModule(module: IBridgeContainer);

    get<T extends Newable<any>>(identifier: T): T;
}

export interface IRequestContext {

}

export class BridgeContainer implements IBridgeContainer {
    private _perRequestTypesRegistrations: any;
    private _containerModules: IBridgeContainer[];

    constructor(private _container: Container) {
        this._perRequestTypesRegistrations = {};
        this._containerModules = [];
    }

    register<T extends Newable<any>>(type: T): void {
        this._container.bind<T>(type.name).to(type);
    }

    registerSingleton<T extends Newable<any>>(type: T): void {
        this._container.bind<T>(type.name).to(type).inSingletonScope();
    }

    registerPerWebRequest<T extends Newable<any>>(type: T): void {
        if (this._perRequestTypesRegistrations[type.name]) {
            throw new Error(`Duplicated registration for: ${type.name}`);
        }

        this._perRequestTypesRegistrations[type.name] = type;
    }

    registerConstant<T extends GenericObject>(identifier: string, value: T): void {
        this._container.bind<T>(identifier).toConstantValue(value);
    }

    deregister<T extends Newable<any>>(identifier: string | T): void {
        this._container.unbind(identifier);
    }

    loadModule(containerModule: IBridgeContainer) {
        const moduleFound = this._containerModules.find(m => m === containerModule);

        if (moduleFound) {
            throw new Error('The module you are trying to add alredy exist');
        }

        this._containerModules.push(containerModule);
    }

    get<T extends Newable<any>>(identifier: string | T): T {
        if (isString(identifier)) {
            return this._container.get(identifier);
        } else {
            return this._container.get(identifier.name);
        }
    }

    getBridgeContainerForWebRequest(req: Request): IRequestContext {
        const container = new Container({ autoBindInjectable: true });

        container.bind<Container>('Container').toConstantValue(container);
        container.bind<Request>('Request').toConstantValue(req);

        // bind all per web request elements
        this._perRequestTypesRegistrations.forEach(type => {
            container.bind(type.name).to(type).inRequestScope();
        });

        return Container.merge(this._container, container);
    }

}