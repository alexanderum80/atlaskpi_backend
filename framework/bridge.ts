import { Enforcer, IEnforcer } from './modules/security/enforcer';
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
    Container
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

        const moduleDefinition = appModule[MetadataFieldsMap.Definition];
        let moduleInstances: IAppModule[];

        // process module imports
        if (moduleDefinition && moduleDefinition.imports) {
            moduleInstances = moduleDefinition.imports.map(m => new m(container));
        }

        // create app module
        const app = new appModule();

        if (!moduleInstances) {
            moduleInstances = [];
        }

        moduleInstances.push(app);

        // process bridge container registrations
        registerBridgeDependencies(container);

        // generate graphql schema
        const graphqlSchema: IExecutableSchemaDefinition = makeGraphqlSchemaExecutable(moduleInstances);

        return new Bridge(container, graphqlSchema, options);
    }

    constructor(private _container: Container, private _executableSchema: IExecutableSchemaDefinition, private _options: IFrameworkOptions) {
        this._options = Object.assign({}, defaultServerOptions, _options);

        this._server = express();

        // middlewares
        this._server.use('*', cors());
        this._server.use(bodyParser.urlencoded({ extended: false, limit: this._options.bodyParserLimit }));
        this._server.use(bodyParser.json({ limit: this._options.bodyParserLimit }));

        this._server.use('/graphql', bodyParser.json(), graphqlExpress((req) => (
            {
              context: {
                req: req,
                mutationBus: _container.get<IMutationBus>('MutationBus'),
                queryBus: _container.get<IQueryBus>('QueryBus')
              },
              schema: _executableSchema
            }
        )));
    }

    get Container(): Container {
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

function registerBridgeDependencies(container: Container) {
    container.bind<IEnforcer>('Enforcer').to(Enforcer).inSingletonScope();
    container.bind<IMutationBus>('MutationBus').to(MutationBus).inSingletonScope();
    container.bind<IQueryBus>('QueryBus').to(QueryBus).inSingletonScope();
}