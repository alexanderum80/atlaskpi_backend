import { MapMarkersQuery } from '../../queries/app/maps/map-markers.query';
import { IQueryResponse } from '../../models/common';
import { IAccessLogDocument } from '../../models/app/access-log/IAccessLog';
import { FindAllAcessLogsQuery } from '../../queries/app/access-log';
import { IMutationResponse } from '../../models/common';
import { CreateAccessLogMutation } from '../../mutations/app/access-log';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../';

export const mapsGql: GraphqlDefinition = {
    name: 'access-log',
    schema: {
        types: `
            type MapMarker {
                name: String
                lat: Float
                lng: Float
                color: String
                value: Float
            }
        `,
        queries: `
            mapMarkers(type: String!): [MapMarker]
        `,
        mutations: ``,
    },
    resolvers: {
        Query: {
            mapMarkers(root: any, args, ctx: IGraphqlContext) {
                let query = new MapMarkersQuery(
                    ctx.req.identity,
                    ctx.req.appContext.Sale,
                    ctx.req.masterContext.ZipToMap);
                return ctx.queryBus.run('get-all-access-logs', query, args, ctx.req);
            }
        },
        Mutation: {}
    }
};