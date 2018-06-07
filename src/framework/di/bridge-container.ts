import { Request } from 'express';
import { Container, interfaces } from 'inversify';
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

export interface IWebRequestContainerDetails {
    instance: interfaces.Container;
    bridgeModule: IBridgeContainer;
}

type GenericObject = { [key: string]: any };

export interface IBridgeContainer {
    // __perRequestTypesRegistrations: GenericObject;

    // container: Container;
    bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T>;
    register<T extends Newable<any>>(type: T): void;
    registerSingleton<T extends Newable<any>>(type: T): void;
    registerPerWebRequest<T extends Newable<any>>(type: T): void;
    registerConstant<T extends GenericObject>(identifier: string, value: T): void;
    deregister<T extends Newable<any>>(identifier: string | T): void;

    // getSubmodule(): IBridgeContainer;
    // addSubmodule(module: IBridgeContainer);

    get<T>(identifier: string): T;
    getBridgeContainerForWebRequest(req: Request): IWebRequestContainerDetails;
    // cleanup(container: interfaces.Container): void;
}

export interface IRequestContext {

}

export class BridgeContainer implements IBridgeContainer {
    private _containerModules: IBridgeContainer[];
    // __perRequestTypesRegistrations: GenericObject;

    constructor(private _container: Container) {
        // this.__perRequestTypesRegistrations = {};
        this._containerModules = [];

        // in the case of criterias for kpis I need to be able to inject
        // dynamic models that is what this factory is used for
        this._container.bind<any>('resolver')
            .toFactory<any>((context: interfaces.Context) => {
                return (name: string) => {
                    return context.container.get<any>(name);
                };
            });
    }

    // get container(): Container {
    //     return this._container;
    // }

    bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
        return this._container.bind<T>(serviceIdentifier);
    }

    register<T extends Newable<any>>(type: T): void {
        if (this._container.isBound(type.name)) {
            throw new Error(`Duplicated registration for: ${type.name}`);
        }

        this._container.bind<T>(type.name).to(type);
    }

    registerSingleton<T extends Newable<any>>(type: T): void {
        if (this._container.isBound(type.name)) {
            throw new Error(`Duplicated registration for: ${type.name}`);
        }

        this._container.bind<T>(type.name).to(type).inSingletonScope();
    }

    registerPerWebRequest<T extends Newable<any>>(type: T): void {
        if (!type) {
            throw new Error('A type is required for the registration');
        }

        if (this._container.isBound(type.name)) {
            throw new Error(`Duplicated registration for: ${type.name}`);
        }

        this._container.bind(type.name).to(type).inRequestScope();
    }

    registerConstant<T extends GenericObject>(identifier: string, value: T): void {
        if (this._container.isBound(identifier)) {
            throw new Error(`Duplicated registration for: ${identifier}`);
        }

        this._container.bind<T>(identifier).toConstantValue(value);
    }

    deregister<T extends Newable<any>>(identifier: string | T): void {
        this._container.unbind(identifier);
    }

    // getSubmodule(): IBridgeContainer {
    //     return new BridgeContainer(this._container);
    // }

    // addSubmodule(containerModule: IBridgeContainer) {
    //     const moduleFound = this._containerModules.find(m => m === containerModule);

    //     if (moduleFound) {
    //         throw new Error('The module you are trying to add alredy exist');
    //     }

    //     // this._containerModules.push(containerModule);

    //     _bindPerRequestRegistrations(this._container, containerModule.__perRequestTypesRegistrations);
    // }

    get<T>(identifier: string): T {
        return this._container.get(identifier);
    }

    getBridgeContainerForWebRequest(req: Request): IWebRequestContainerDetails {
        const container = this._container.createChild(); // new Container({ autoBindInjectable: true });

        // IMPORTANT: Here we register the containr with the request
        container.bind<Container>('Container').toConstantValue(container);
        container.bind<Request>('Request').toConstantValue(req);

        // bind all per web request elements
        // _bindPerRequestRegistrations(container, this.__perRequestTypesRegistrations);

        // this._containerModules.forEach(m => _bindPerRequestRegistrations(container, m.__perRequestTypesRegistrations)); 

        return {
            instance: container, // Container.merge(this._container, container),
            bridgeModule: this
        };
    }

    // cleanup(container: interfaces.Container): void {
    //     container.unbind('Container');
    //     container.unbind('Request');

    //     _unbindPerRequestRegistrations(container, this.__perRequestTypesRegistrations);
    //     this._containerModules.forEach(m => _unbindPerRequestRegistrations(container, m.__perRequestTypesRegistrations));
    // }

}

function _bindPerRequestRegistrations(container: Container, registrations: GenericObject) {
    Object.keys(registrations).forEach(key => {
        container.bind(key).to(registrations[key]).inRequestScope();
    });
}

function _unbindPerRequestRegistrations(container: interfaces.Container, registrations: GenericObject) {
    Object.keys(registrations).forEach(key => {
        container.unbind(key);
    });
}
