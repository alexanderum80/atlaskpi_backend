import { ApolloServer } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Server } from 'http';
import { Container } from 'inversify';

import { Enforcer } from '../app_modules/security/enforcer/enforcer';
import { IExtendedRequest } from '../middlewares/extended-request';
import { IBridgeRequest } from './bridge.request';
import { IAppModule } from './decorators/app-module';
import { BRIDGE } from './decorators/helpers';
import { MetadataFieldsMap } from './decorators/metadata-fields.map';
import { BridgeContainer } from './di/bridge-container';
import { ITypesAndResolvers, makeGraphqlSchemaExecutable } from './graphql/graphql-schema-generator';
import { MutationBus } from './mutations/mutation-bus';
import { QueryBus } from './queries/query-bus';
import { constants } from './constants';

export interface ICacheItemOptions {
    /** Seconds to persist the cached data */
    ttl: number;
}

export interface ICacheService {
    set(key: string, payload: any, ttl?: number): Promise<void>;
    get(key: string): any;
    removePattern(pattern: string): Promise<void>;
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
    graphqlPath: '/graphql',
};

export class Bridge {
    private _server: express.Express;
    private _httpServer: Server;

    static create(
        appModule: new() => IAppModule,
        cacheService: new (...args: any[]) => ICacheService,
        options?: IFrameworkOptions
    ): Bridge {
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
        registerBridgeDependencies(bridgeContainer, cacheService);

        // generate graphql schema
        const graphqlSchema: ITypesAndResolvers = makeGraphqlSchemaExecutable(moduleInstances);

        return new Bridge(bridgeContainer, graphqlSchema, options);
    }

    constructor(private _container: BridgeContainer, private _executableSchema: ITypesAndResolvers, private _options: IFrameworkOptions) {
        this._options = Object.assign({}, defaultServerOptions, _options);

        this._server = express();

        // middlewares
        // this._server.use(cleanup);
        this._server.use(setBridgeContainer);
        this._server.use('*', cors());
        this._server.use(bodyParser.urlencoded({ extended: false, limit: this._options.bodyParserLimit }));
        this._server.use(bodyParser.json({ limit: this._options.bodyParserLimit }));
    }

    get Container(): BridgeContainer {
        return this._container;
    }

    // start() {
    //     this._server.use('/graphql', bodyParser.json(), graphqlExpress((req: IBridgeRequest) => (
    //         {
    //           context: {
    //             req: req,
    //             requestContainer: req.Container,
    //             mutationBus: this._container.get(MutationBus.name),
    //             queryBus: this._container.get(QueryBus.name)
    //           },
    //           schema: this._executableSchema
    //         }
    //     )));

    //     this._httpServer = this._server.listen(this._options.port, () => console.log(
    //         `Bridge Server is now running on http://localhost:${this._options.port}/${this._options.graphqlPath}`
    //     ));
    // }

    start() {

        const apolloServer = new ApolloServer({
            ...this._executableSchema,
            context: ({ req }: { req: express.Request }) => {
                const ctx = {
                    req,
                    requestContainer: (req as IBridgeRequest).Container,
                    mutationBus: this._container.get(MutationBus.name),
                    queryBus: this._container.get(QueryBus.name)
                };

                return ctx;
            },
            debug: true,
            playground: true,
        });

        apolloServer.applyMiddleware({
            app: this._server,
            cors: true,
        });

        const _httpServer = this._server.listen(this._options.port, () => console.log(
            `Bridge Server is now running on http://localhost:${this._options.port}/${this._options.graphqlPath}`
        ));

        // process http controllers
        // if (this._artifacts.httpControllers && this._artifacts.httpControllers.length) {
        //     this._artifacts.httpControllers.forEach(c => injectHttpController(c, this._server, this._container));
        //     Bridge.logger.debug(`HTTP Controllers: ${this._artifacts.httpControllers.map(c => (c as any).name).sort().join(', ')}`);
        // }
    }

    get server(): express.Express {
        return this._server;
    }

}

function registerBridgeDependencies(container: BridgeContainer, cacheService: new (...args: any[]) => ICacheService) {
    container.registerSingleton(Enforcer);
    container.registerSingleton(MutationBus);
    container.registerSingleton(QueryBus);

    // even if cache service is empty I need to register it because from the query bus
    // I am requesting this service
    container.registerSingleton(cacheService, constants.CACHE_SERVICE);
}

function setBridgeContainer(req: IBridgeRequest, res: express.Response, next) {
    req.Container = BRIDGE.getRequestContainer(req);
    next();
}

function cleanup(req: IExtendedRequest, res: express.Response, next) {
    res.on('finish', function() {
      // perform your cleanups...
    //   const containerDetails = req.Container;
    //   containerDetails.bridgeModule.cleanup(containerDetails.instance);
    //   delete(req.Container);
    });

    next();
}