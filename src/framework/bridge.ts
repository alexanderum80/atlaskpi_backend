import { BridgeContainer } from './di/bridge-container';
import { IEnforcer } from './modules/security';
import { Enforcer } from '../app_modules/security/enforcer';
import { Request, Response } from 'Express';
import { IQueryBus, QueryBus } from './queries/query-bus';
import { IMutationBus, MutationBus } from './mutations/mutation-bus';
import { makeGraphqlSchemaExecutable } from './graphql/graphql-schema-generator';
import { IAppModule } from './decorators/app-module';
import {
    IModuleOptions
} from './decorators';
import {
    IQuery
} from './queries';
import {
    IMutation
} from './mutations';
import {
    GraphqlDefinition,
    GraphqlSchema
} from './graphql';
import {
    MetadataFieldsMap
} from './decorators';
import {
    Container,
    interfaces
} from 'inversify';
import * as express from 'express';
import { IExecutableSchemaDefinition } from 'graphql-tools/dist/Interfaces';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { Server } from 'http';
import { Express } from 'express';
import { RequestHandlerParams } from 'express-serve-static-core';
import { RequestHandler } from 'apollo-link';
import { graphqlExpress } from 'apollo-server-express/dist/expressApollo';
import { BRIDGE } from './index';
import { IExtendedRequest } from '../middlewares/index';

interface IQueryData {
    types: string[];
    queries: string[];
    instances: IQuery < any > ;
}

export interface IFrameworkOptions {
    port?: number;
    logLevel?: 'debug' | 'info' | 'warning' | 'error';
    bodyParserLimit?: string;
    graphqlPath?: string;
    graphqlContextExtra?: any;
}

const defaultServerOptions: IFrameworkOptions = {
    port: 9091,
    logLevel: 'error',
    bodyParserLimit: '50mb',
    graphqlPath: '/graphql'
};

export class Bridge {
    private _server: Express;
    private _httpServer: Server;

    static create(appModule: new() => IAppModule, options?: IFrameworkOptions): Bridge {
        const newOptions = Object.assign({}, defaultServerOptions, options);
        const container = new Container({ autoBindInjectable: true });
        const bridgeContainer = new BridgeContainer(container);

        // I need to save the container in a global name space so it can be accessed from the middlewares
        BRIDGE.bridgeContainer = bridgeContainer;

        const moduleDefinition = appModule[MetadataFieldsMap.Definition];
        let moduleInstances: IAppModule[];

        // process module imports
        if (moduleDefinition && moduleDefinition.imports) {
            moduleInstances = moduleDefinition.imports.map(m => new m(bridgeContainer));
        }

        // create app module
        const app = new appModule();

        if (!moduleInstances) {
            moduleInstances = [];
        }

        moduleInstances.push(app);

        // process bridge container registrations
        registerBridgeDependencies(bridgeContainer);

        // generate graphql schema
        const graphqlSchema: IExecutableSchemaDefinition = makeGraphqlSchemaExecutable(moduleInstances);

        return new Bridge(bridgeContainer, graphqlSchema, options);
    }

    constructor(private _container: BridgeContainer, private _executableSchema: IExecutableSchemaDefinition, private _options: IFrameworkOptions) {
        this._options = Object.assign({}, defaultServerOptions, _options);

        this._server = express();

        // middlewares
        this._server.use(setBridgeContainer);
        this._server.use('*', cors());
        this._server.use(bodyParser.urlencoded({ extended: false, limit: this._options.bodyParserLimit }));
        this._server.use(bodyParser.json({ limit: this._options.bodyParserLimit }));

        this._server.use('/graphql', bodyParser.json(), graphqlExpress((req) => (
            {
              context: {
                req: req,
                requestContainer: _container.getBridgeContainerForWebRequest(req),
                mutationBus: _container.get(MutationBus),
                queryBus: _container.get(QueryBus)
              },
              schema: _executableSchema
            }
        )));
    }

    get Container(): BridgeContainer {
        return this._container;
    }

    start() {
        this._httpServer = this._server.listen(this._options.port, () => console.log(
            `Bridge Server is now running on http://localhost:${this._options.port}/${this._options.graphqlPath}`
        ));
    }

    get server(): Express {
        return this._server;
    }

}

function registerBridgeDependencies(container: BridgeContainer) {
    container.registerSingleton(Enforcer);
    container.registerSingleton(MutationBus);
    container.registerSingleton(QueryBus);
}


function setBridgeContainer(req: Request, res: Response, next) {
    (<any>req)._bridgeContainer = BRIDGE.getRequestContainer(req);
    next();
}