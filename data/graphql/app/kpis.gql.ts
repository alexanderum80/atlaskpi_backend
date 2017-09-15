import { IDateRange } from '../../models/common/date-range';
import { GetKpisQuery } from '../../queries/app/kpis/get-kpis.query';
import { CreateKPIMutation, UpdateKPIMutation, RemoveKPIMutation } from '../../mutations/app/kpis';
import { IQueryResponse } from '../../models/common/query-response';
import { IPaginationInfo } from '../../models/common/pagination';
import { Response } from '_debugger';
import { IMutationResponse, IPagedQueryResult } from '../../models/common';
import { IKPIDocument } from '../../models/app/kpis';
import { IGraphqlContext } from '../graphql-context';
import { GraphqlDefinition } from '../graphql-definition';
import { GetAllKPIsQuery } from '../../queries/app/kpis';
import * as logger from 'winston';

import { IKPI } from '../../models/app/kpis';

export const kpisGql: GraphqlDefinition = {
    name: 'kpis',
    schema: {
        types: `
            input KPIDetails {
                name: String!
                description: String
                formula: String!
                group: String
                emptyValueReplacement: String
            },
            type KPIResult {
                kpi: KPI
                errors: [ErrorDetails]
            }
            type KPI {
                _id: String
                code: String
                name: String
                baseKpi: String
                description: String
                group: String
                groupings: [String]
                dateRange: ChartDateRange
                filter: String
                frequency: String
                axisSelection: String
                emptyValueReplacement: String
                composition: String
            }
            type KPIPagedQueryResult {
                pagination: PaginationInfo
                data: [KPI]
            }
        `,
        queries: `
            kpis: [KPI]
            getAllKPIs(details: PaginationDetails): KPIPagedQueryResult
        `,
        mutations: `
            createKPI(data: KPIDetails): KPIResult
            updateKPI(id: String, data: KPIDetails): KPIResult
            removeKPI(id: String): KPIResult
        `,
    },

    resolvers: {
        Query: {
            kpis(root: any, args: any, ctx: IGraphqlContext) {
                let query = new GetKpisQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-kpis', query, args, ctx.req).catch(e => console.error(e));
            },
            getAllKPIs(root: any, args, ctx: IGraphqlContext) {
                let query = new GetAllKPIsQuery(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.queryBus.run('get-all-kpis', query, ctx.req);
            }
        },
        Mutation: {
            createKPI(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateKPIMutation(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.mutationBus.run<IMutationResponse>('create-kpi', ctx.req, mutation, args);
            },
            updateKPI(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateKPIMutation(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.mutationBus.run<IMutationResponse>('update-kpi', ctx.req, mutation, args);
            },
            removeKPI(root: any, args, ctx: IGraphqlContext) {
                let mutation = new RemoveKPIMutation(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.mutationBus.run<IMutationResponse>('remove-kpi', ctx.req, mutation, args);
            },
        },
        KPIPagedQueryResult: {
            pagination(res: IPagedQueryResult<IKPI>) { return res.pagination; },
            data(res: IPagedQueryResult<IKPI>) { return res.data; }
        },
        KPIResult: {
            kpi(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        DateRange: {
            from(dateRange: IDateRange ) { return dateRange.from; },
            to(dateRange: IDateRange) { return dateRange.to; }
        },
        KPI: {
            dateRange(entity: IKPIDocument) { return entity.dateRange; },
            filter(entity: IKPIDocument) { return JSON.stringify(entity.filter); }
        }
    }
};
