import { KpiService } from '../../services/kpis/kpi.service';
import { GetKpisCriteriaQuery } from '../../queries/app/kpis/get-kpi-criteria.query';
import { KPIExpressionHelper } from '../../models/app/kpis/kpi-expression.helper';
import { KPIFilterHelper } from './../../models/app/kpis/kpi-filter.helper';
import { KPIGroupingsHelper } from '../../models/app/kpis/kpi-groupings.helper';
import { DataSourcesHelper } from '../../queries/app/data-sources/datasource.helper';
import { GetKpiQuery } from './../../queries/app/kpis/get-kpi.query';
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
let kpiService = null;

export const kpisGql: GraphqlDefinition = {
    name: 'kpis',
    schema: {
        types: `
            input KPIAttributesInput {
                code: String
                name: String!
                group: String
                description: String
                dateRange: ChartDateRangeInput
                frequency: String
                groupings: [String]
                type: String
                expression: String
                filter: String
            },
            type KPIMutationResponse {
                entity: KPI
                errors: [ErrorDetails]
                success: Boolean
            }
            type KPIRemoveResponse {
                entity: [ChartEntityResponse]
                errors: [ErrorDetails]
                success: Boolean
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
                expression: String
                type: String
                availableGroupings: [String]
            }
            type KPIPagedQueryResult {
                pagination: PaginationInfo
                data: [KPI]
            }
            type KPICriteriaResult {
                criteriaValue: [String]
                errors: [ErrorDetails]
            }
        `,
        queries: `
            kpis: [KPI]
            getAllKPIs(details: PaginationDetails): KPIPagedQueryResult
            kpi(id: String): KPI
            kpiCriteria(kpi: String, field: String): KPICriteriaResult
        `,
        mutations: `
            createKPI(input: KPIAttributesInput): KPIMutationResponse
            updateKPI(id: String, input: KPIAttributesInput): KPIMutationResponse
            removeKPI(id: String): KPIRemoveResponse
        `,
    },

    resolvers: {
        Query: {
            kpis(root: any, args, ctx: IGraphqlContext) {
                kpiService = new KpiService(ctx.req.appContext.Sale, ctx.req.appContext.Expense);
                let query = new GetKpisQuery(ctx.req.identity, ctx.req.appContext);
                return ctx.queryBus.run('get-kpis', query, args, ctx.req).catch(e => console.error(e));
            },
            getAllKPIs(root: any, args, ctx: IGraphqlContext) {
                let query = new GetAllKPIsQuery(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.queryBus.run('get-all-kpis', query, ctx.req);
            },
            kpi(root: any, args, ctx: IGraphqlContext) {
                let query = new GetKpiQuery(ctx.req.identity, ctx.req.appContext.KPI);
                return ctx.queryBus.run('get-kpi', query, args, ctx.req);
            },
            kpiCriteria(root: any, args, ctx: IGraphqlContext) {
                let query = new GetKpisCriteriaQuery(ctx.req.identity, ctx.req.appContext.Sale,
                                                     ctx.req.appContext.Expense, ctx.req.appContext.Inventory);
                return ctx.queryBus.run('get-kpi-criteria', query, args, ctx.req);
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
                let mutation = new RemoveKPIMutation(ctx.req.identity, ctx.req.appContext.KPI, ctx.req.appContext.Chart);
                return ctx.mutationBus.run<IMutationResponse>('remove-kpi', ctx.req, mutation, args);
            },
        },
        KPIPagedQueryResult: {
            pagination(res: IPagedQueryResult<IKPI>) { return res.pagination; },
            data(res: IPagedQueryResult<IKPI>) { return res.data; }
        },
        KPIMutationResponse: {
            entity(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        KPIRemoveResponse: {
            success(response: IMutationResponse) {
                return response.success; },
            entity(response: IMutationResponse) {
                return response.entity; },
            errors(response: IMutationResponse) {
                return response.errors; }
        },
        DateRange: {
            from(dateRange: IDateRange ) { return dateRange.from; },
            to(dateRange: IDateRange) { return dateRange.to; }
        },
        KPI: {
            dateRange(entity: IKPIDocument) { return entity.dateRange; },
            expression(entity: IKPIDocument) { return KPIExpressionHelper.PrepareExpressionField(entity.type, entity.expression); },
            filter(entity: IKPIDocument) { return JSON.stringify(KPIFilterHelper.PrepareFilterField(entity.type, entity.filter)); },
            availableGroupings(entity: IKPIDocument) { return KPIGroupingsHelper.GetAvailableGroupings(entity, kpiService); }
        }
    }
};
