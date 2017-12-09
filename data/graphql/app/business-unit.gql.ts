import {
    DeleteBusinessUnitMutation
} from '../../mutations/app/business-unit/delete-business-unit.mutation';
import {
    deleteBusinessUnitActivity
} from '../../../activities/app/business-unit/delete-business-unit.activity';
import {
    UpdateBusinessUnitMutation
} from '../../mutations/app/business-unit/update-business-unit.mutation';
import {
    BusinessUnitByIdQuery
} from '../../queries/app/business-unit/business-unit-by-id.query';
import {
    BusinessUnitsQuery
} from '../../queries/app/business-unit/business-units.query';
import {
    IMutationResponse
} from '../../models/common';
import {
    CreateBusinessUnitMutation
} from '../../mutations/app/business-unit/create-business-unit.mutation';
import {
    GraphqlDefinition
} from '../graphql-definition';
import {
    ExtendedRequest
} from '../../../middlewares';
import {
    IGraphqlContext
} from '../graphql-context';

import * as logger from 'winston';

export const businessUnitGql: GraphqlDefinition = {
    name: 'business-unit',
    schema: {
        types: `
            input CreateBusinessUnitInput {
                name: String!
                serviceType: String
            }
            input UpdateBusinessUnitInput {
                _id: String!
                name: String!
                serviceType: String
            }
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
            createBusinessUnit(input: CreateBusinessUnitInput!): CreateBusinessUnitResponse
            updateBusinessUnit(input: UpdateBusinessUnitInput!): UpdateBusinessUnitResponse
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