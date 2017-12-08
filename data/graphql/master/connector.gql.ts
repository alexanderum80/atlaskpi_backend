import { RemoveConnectorMutation } from '../../mutations/master/connectors/remove-connector.mutation';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import { IGraphqlContext } from '..';
import { ConnectorsQuery } from '../..';
import { IConnector } from '../../models';
import { IMutationResponse } from '../../models/common';

export const connectorGql: GraphqlDefinition = {
    name: 'connectors',
    schema: {
        types: `
            type Connector {
                _id: String
                name: String
                active: Boolean
                type: String
            }
            type ConnectorResult {
                success: Boolean
                entity: [Connector]
                errors: [ErrorDetails]
            }
        `,
        queries: `
            connectors(filter: String): [Connector]
        `,
        mutations: `
            removeConnector(id: String!): ConnectorResult
        `
    },
    resolvers: {
        Query: {
            connectors(root: any, args, ctx: IGraphqlContext) {
                const query = new ConnectorsQuery(ctx.req.identity, ctx.req.masterContext.Connector);
                return ctx.queryBus.run('get-connectors', query, args);
            }
        },
        Mutation: {
            removeConnector(root: any, args, ctx: IGraphqlContext) {
                const mutation = new RemoveConnectorMutation(ctx.req.identity, ctx.req.masterContext.Connector);
                return ctx.mutationBus.run<IMutationResponse>('remove-connector', ctx.req, mutation, args);
            }
        },
        ConnectorResult: {
            success(response: IMutationResponse) { return response.success; },
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        }
    }
};
