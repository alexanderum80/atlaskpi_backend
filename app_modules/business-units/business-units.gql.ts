import {
    IGraphqlContext
} from '../common';

import {
    IMutationResponse,
    GraphqlDefinition
} from '../common';

import {
    BusinessUnitsQuery,
    BusinessUnitByIdQuery
} from './queries';

import {
    CreateBusinessUnitMutation,
    DeleteBusinessUnitMutation,
    UpdateBusinessUnitMutation
} from './mutations';

export const businessUnitsGql: GraphqlDefinition = {
    name: 'business-unit',
    schema: {
        types: `
            type BusinessUnit {
                _id: String
                name: String
                serviceType: String
            }

            type UpdateBusinessUnitResponse {
                success: Boolean
                entity: BusinessUnit
                errors: [ErrorDetails]
            }

            type CreateBusinessUnitResponse {
                success: Boolean
                entity: BusinessUnit
                errors: [ErrorDetails]
            }

            type DeleteBusinessUnitResponse {
                success: Boolean
                entity: BusinessUnit
                errors: [ErrorDetails]
            }
        `,
        queries: `
            businessUnits: [BusinessUnit]
            businessUnitById(id: String!): BusinessUnit
            `,
        mutations: `
            createBusinessUnit(name: String!, serviceType: String): CreateBusinessUnitResponse
            updateBusinessUnit(_id: String!, name: String!, serviceType: String): UpdateBusinessUnitResponse
            deleteBusinessUnit(_id: String!): DeleteBusinessUnitResponse
            `,
    },

    resolvers: {
        Query: {

           businessUnits(root: any, args, ctx: IGraphqlContext) {
                let query = new BusinessUnitsQuery(ctx.req.identity, ctx.req.appContext.BusinessUnitModel);
                return ctx.queryBus.run('list-business-units', query, args);
            },
           businessUnitById(root: any, args, ctx: IGraphqlContext) {
                let query = new BusinessUnitByIdQuery(ctx.req.identity, ctx.req.appContext.BusinessUnitModel);
                return ctx.queryBus.run('business-unit-by-id', query, args);
            }
        },
        Mutation: {
            createBusinessUnit(root: any, args, ctx: IGraphqlContext) {
            let mutation = new CreateBusinessUnitMutation(ctx.req.identity, ctx.req.appContext.BusinessUnitModel);
            return ctx.mutationBus.run < IMutationResponse > ('create-business-unit', ctx.req, mutation, args);
                      },
            updateBusinessUnit(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateBusinessUnitMutation(ctx.req.identity, ctx.req.appContext.BusinessUnitModel);
                return ctx.mutationBus.run < IMutationResponse > ('update-business-unit', ctx.req, mutation, args);
            },
            deleteBusinessUnit(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteBusinessUnitMutation(ctx.req.identity, ctx.req.appContext.BusinessUnitModel);
                return ctx.mutationBus.run < IMutationResponse > ('delete-business-unit', ctx.req, mutation, args);
            },
        },
    }
};