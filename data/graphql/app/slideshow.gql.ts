import { SlideshowsByGroupChartQuery } from '../../queries/app/slideshow/slideshows-by-group.query';
import { DeleteSlideshowMutation } from '../../mutations/app/slideshow/delete-slideshow.mutation';
import { UpdateSlideshowMutation } from '../../mutations/app/slideshow/update-slideshow.mutation';
import { SlideshowByIdQuery } from '../../queries/app/slideshow/slideshow-by-id.query';
import { SlideshowsQuery } from '../../queries/app/slideshow/list-slideshow.query';
import { IMutationResponse } from '../../models/common';
import { CreateSlideshowMutation } from '../../mutations/app/slideshow/create-slideshow.mutation';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../graphql-context';
import { ExtendedRequest } from '../../../middlewares';
import * as logger from 'winston';

export const slideshowGql: GraphqlDefinition = {
    name: 'Slideshow',
    schema: {
        types: `
          type Slideshow {
              _id: String
              name: String
              description: String
              charts: [String]
          }
          type SlideshowResponse {
               success: Boolean
               entity: Slideshow
               errors: [ErrorDetails]
          }
          input SlideshowInput {
              name: String
              description: String
              charts: [String]
          }
        `,
        queries: `
        slideshows: [Slideshow]
        slideshowById(_id: String!): Slideshow
        slideShowsByGroupChart(group: String!): [Slideshow]
        `,
        mutations: `
         createSlideshow(input: SlideshowInput!): SlideshowResponse
         updateSlideshow(_id: String!, input: SlideshowInput!): SlideshowResponse
         deleteSlideshow(_id: String): SlideshowResponse
        `,
    },

    resolvers: {
        Query: {
             slideshows(root: any, args, ctx: IGraphqlContext) {
                let query = new SlideshowsQuery(ctx.req.identity, ctx.req.appContext.SlideshowModel);
                return ctx.queryBus.run('list-slideshow', query, args);
              },
             slideshowById(root: any, args, ctx: IGraphqlContext) {
                let query = new SlideshowByIdQuery(ctx.req.identity, ctx.req.appContext.SlideshowModel);
                return ctx.queryBus.run('slideshow-by-id', query, args);
            },
            slideShowsByGroupChart(root: any, args, ctx: IGraphqlContext) {
                let query = new SlideshowsByGroupChartQuery(ctx.req.identity, ctx.req.appContext.SlideshowModel);
                return ctx.queryBus.run('slideshow-by-group', query, args);
            }
        },
        Mutation: {
            createSlideshow(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateSlideshowMutation(ctx.req.identity, ctx.req.appContext.SlideshowModel);
                return ctx.mutationBus.run<IMutationResponse>('create-slideshow', ctx.req, mutation, args);
            },
            updateSlideshow(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateSlideshowMutation(ctx.req.identity, ctx.req.appContext.SlideshowModel);
                return ctx.mutationBus.run<IMutationResponse>('update-slideshow', ctx.req, mutation, args);
            },
            deleteSlideshow(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteSlideshowMutation(ctx.req.identity, ctx.req.appContext.SlideshowModel);
                return ctx.mutationBus.run<IMutationResponse>('delete-slideshow', ctx.req, mutation, args);
            }
        },
        SlideshowResponse: {
            success(response: IMutationResponse) { return response.success; },
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        }
    }
};