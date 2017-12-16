import { GraphqlDefinition } from '../graphql-definition';
import { ISocialWidget } from './../../models/app/social-widgets/social-widget-base';
import { ListSocialWidgetsQuery } from './../../queries/app/social-widgets/list-social-widgets.query';
import { SocialWidgetsService } from './../../services/social-widgets/social-widgets.service';
import { IGraphqlContext } from './../graphql-context';

export const socialWidgetsGql: GraphqlDefinition = {
    name: 'social-widgets',
    schema: {
        types: `
            type SocialWidgetHistoricalData {
                value: Int,
                period: String
            }

            type SocialWidget {
                connectorId: String,
                name: String,
                value: Int,
                valueDescription: String,
                historicalData: SocialWidgetHistoricalData,
                type: String,
            }
        `,
        queries: `
            listSocialWidgets(startDate: String): [SocialWidget]
        `,
        mutations: `
        `,
    },
    resolvers: {
        Query: {
            listSocialWidgets(root: any, args, ctx: IGraphqlContext) {
                const socialWidgetsService = new SocialWidgetsService(ctx.req.identity,
                                                                      ctx.req.appContext,
                                                                      ctx.req.masterContext);
                const query = new ListSocialWidgetsQuery(ctx.req.identity, socialWidgetsService);
                return ctx.queryBus.run('list-social-widgets', query, args, ctx.req);
            },
         },
        Mutation: { },
        SocialWidget: {
            historicalData(entity: ISocialWidget) { return entity.historicalData; },
        }
    }
};