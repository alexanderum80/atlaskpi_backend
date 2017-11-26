import { getGraphqlExecutableSchema } from './graphql/graphql-schema-generator';
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
import { getQueryBusSingleton } from './queries';
import { getMutationBusSingleton } from './mutations';

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

    static create(appModule: new() => IAppModule, container: Container, options?: IFrameworkOptions): Bridge {
        const newOptions = Object.assign({}, defaultServerOptions, options);

        const moduleDefinition = appModule[MetadataFieldsMap.Definition];
        let moduleInstances: IAppModule[];

        // process module imports
        if (moduleDefinition.imports) {
            moduleInstances = moduleDefinition.imports.map(m => new m(container));
        }

        // create app module
        const app = new appModule();

        if (!moduleInstances) {
            moduleInstances = [];
        }

        moduleInstances.push(app);

        // generate graphql schema
        const graphqlSchema: IExecutableSchemaDefinition = getGraphqlExecutableSchema(moduleInstances);

        return new Bridge(graphqlSchema, options);
    }

    constructor(private _executableSchema: IExecutableSchemaDefinition, private _options: IFrameworkOptions) {
        this._server = express();

        // middlewares
        this._server.use('*', cors());
        this._server.use(bodyParser.urlencoded({ extended: false, limit: _options.bodyParserLimit }));
        this._server.use(bodyParser.json({ limit: _options.bodyParserLimit }));

        this._server.use('/graphql', bodyParser.json(), graphqlExpress((req) => (
            {
              context: {
                req: req,
                mutationBus: getMutationBusSingleton(),
                queryBus: getQueryBusSingleton()
              },
              schema: _executableSchema
            }
        )));
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