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
    __perRequestTypesRegistrations: GenericObject;

    register<T extends Newable<any>>(type: T): void;
    registerSingleton<T extends Newable<any>>(type: T): void;
    registerPerWebRequest<T extends Newable<any>>(type: T): void;
    registerConstant<T extends GenericObject>(identifier: string, value: T): void;
    deregister<T extends Newable<any>>(identifier: string | T): void;

    getSubmodule(): IBridgeContainer;
    addSubmodule(module: IBridgeContainer);

    get<T extends Newable<any>>(identifier: T): T;
}

export interface IRequestContext {

}

export class BridgeContainer implements IBridgeContainer {
    private _containerModules: IBridgeContainer[];
    __perRequestTypesRegistrations: GenericObject;

    constructor(private _container: Container) {
        this.__perRequestTypesRegistrations = {};
        this._containerModules = [];
    }

    register<T extends Newable<any>>(type: T): void {
        this._container.bind<T>(type.name).to(type);
    }

    registerSingleton<T extends Newable<any>>(type: T): void {
        this._container.bind<T>(type.name).to(type).inSingletonScope();
    }

    registerPerWebRequest<T extends Newable<any>>(type: T): void {
        if (this.__perRequestTypesRegistrations[type.name]) {
            throw new Error(`Duplicated registration for: ${type.name}`);
        }

        this.__perRequestTypesRegistrations[type.name] = type;
    }

    registerConstant<T extends GenericObject>(identifier: string, value: T): void {
        this._container.bind<T>(identifier).toConstantValue(value);
    }

    deregister<T extends Newable<any>>(identifier: string | T): void {
        this._container.unbind(identifier);
    }

    getSubmodule(): IBridgeContainer {
        return new BridgeContainer(this._container);
    }

    addSubmodule(containerModule: IBridgeContainer) {
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
        _processPerRequestRegistrations(container, this.__perRequestTypesRegistrations);

        this._containerModules.forEach(m => _processPerRequestRegistrations(container, m.__perRequestTypesRegistrations))

        return Container.merge(this._container, container);
    }

}

function _processPerRequestRegistrations(container: Container, registrations: GenericObject) {
    this.registrations.forEach(type => {
        container.bind(type.name).to(type).inRequestScope();
    });
}