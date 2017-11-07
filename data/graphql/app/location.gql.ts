import { DeleteLocationMutation } from '../../mutations/app/location/delete-location.mutation';
import { deleteLocationActivity } from '../../../activities/app/location/delete-location.activity';
import { UpdateLocationMutation } from '../../mutations/app/location/update-location.mutation';
import { LocationByIdQuery } from '../../queries/app/location/location-by-id.query';
import { LocationsQuery } from '../../queries/app/location/location.query';
import { CreateLocationMutation } from '../../mutations/app/location/create-location.mutation';

import { IMutationResponse } from '../../models/common';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import { IGraphqlContext } from '../graphql-context';
import * as logger from 'winston';

export const locationsGql: GraphqlDefinition = {
    name: 'locations',
    schema: {
        types: `
            type Location {
                _id: String
                name: String
                description: String
                alias: String
                businessunits: String
                latitude: String
                longitude: String
                operhours: String 
                street: String 
                city: String
                state: String 
                zip: String
            }
            
            type UpdateLocationResponse {
                success: Boolean
                entity: Location
                errors: [ErrorDetails]
            }

            type CreateLocationResponse {
                success: Boolean
                entity: Location
                errors: [ErrorDetails]
            }

            type DeleteLocationResponse {
                success: Boolean
                entity: Location
                errors: [ErrorDetails]
            }
        `,
        queries: `
            locations: [Location]
        `,
        mutations: `
            createLocation(
                name: String!,
                description: String,
                alias: String,
                businessunits: String,
                latitude: String,
                longitude: String,
                operhours: String,
                street: String,
                city: String,
                state: String,
                zip: String): CreateLocationResponse
            updateLocation(
                _id: String!, 
                name: String!,
                description: String,
                alias: String, 
                businessunits: String, 
                latitude: String, 
                longitude: String, 
                operhours: String, 
                street: String, 
                city: String, 
                state: String, 
                zip: String): UpdateLocationResponse
            deleteLocation(_id: String!): DeleteLocationResponse
        `,
    },

    resolvers: {
        Query: {

            locations(root: any, args, ctx: IGraphqlContext) {
                let query = new LocationsQuery(ctx.req.identity, ctx.req.appContext.LocationModel);
                return ctx.queryBus.run('list-locations', query, args);
            }
        },
        Mutation: {
            createLocation(root: any, args, ctx: IGraphqlContext) {
            let mutation = new CreateLocationMutation(ctx.req.identity, ctx.req.appContext.LocationModel);
            return ctx.mutationBus.run< IMutationResponse > ('create-location', ctx.req, mutation, args);
           },
            updateLocation(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateLocationMutation(ctx.req.identity, ctx.req.appContext.LocationModel);
                return ctx.mutationBus.run< IMutationResponse > ('update-location', ctx.req, mutation, args);
            },
            deleteLocation(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteLocationMutation(ctx.req.identity, ctx.req.appContext.LocationModel);
                return ctx.mutationBus.run< IMutationResponse > ('delete-location', ctx.req, mutation, args);
            }
        }
    }
};