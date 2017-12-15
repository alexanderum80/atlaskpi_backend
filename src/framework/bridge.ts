import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'Express';
import { IExecutableSchemaDefinition } from 'graphql-tools/dist/Interfaces';
import { Server } from 'http';
import { Container } from 'inversify';

import { Enforcer } from '../app_modules/security/enforcer/enforcer';
import { IExtendedRequest } from '../middlewares/extended-request';
import { IAppModule } from './decorators/app-module';
import { BRIDGE } from './decorators/helpers';
import { MetadataFieldsMap } from './decorators/metadata-fields.map';
import { BridgeContainer } from './di/bridge-container';
import { makeGraphqlSchemaExecutable } from './graphql/graphql-schema-generator';
import { MutationBus } from './mutations/mutation-bus';
import { IQuery } from './queries/query';
import { QueryBus } from './queries/query-bus';
import { graphqlExpress } from 'graphql-server-express';



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
    private _server: express.Express;
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
        this._server.use(cleanup);
        this._server.use(setBridgeContainer);
        this._server.use('*', cors());
        this._server.use(bodyParser.urlencoded({ extended: false, limit: this._options.bodyParserLimit }));
        this._server.use(bodyParser.json({ limit: this._options.bodyParserLimit }));
    }

    get Container(): BridgeContainer {
        return this._container;
    }

    start() {
        this._server.use('/graphql', bodyParser.json(), graphqlExpress((req) => (
            {
              context: {
                req: req,
                requestContainer: (<any>req).container,
                mutationBus: this._container.get(MutationBus.name),
                queryBus: this._container.get(QueryBus.name)
              },
              schema: this._executableSchema
            }
        )));

        this._httpServer = this._server.listen(this._options.port, () => console.log(
            `Bridge Server is now running on http://localhost:${this._options.port}/${this._options.graphqlPath}`
        ));
    }

    get server(): express.Express {
        return this._server;
    }

}

function registerBridgeDependencies(container: BridgeContainer) {
    container.registerSingleton(Enforcer);
    container.registerSingleton(MutationBus);
    container.registerSingleton(QueryBus);
}


function setBridgeContainer(req: express.Request, res: express.Response, next) {
    (<any>req).container = BRIDGE.getRequestContainer(req);
    next();
}

function cleanup(req: IExtendedRequest, res: express.Response, next) {
    res.on('finish', function() {
      // perform your cleanups...
      const containerDetails = req.container;
      containerDetails.bridgeModule.cleanup(containerDetails.container);
      delete(req.container);
    });

    next();
  }