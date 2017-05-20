import { ListAllBusinessUnitsQuery, FindBusinessUnitByIdQuery } from '../../queries/app/business-units';
import { CreateBusinessUnitMutation, UpdateBusinessUnitByIdMutation, RemoveBusinessUnitByIdMutation } from '../../mutations/app/business-units';
import { Response } from '_debugger';
import { IMutationResponse, IPagedQueryResult, IPaginationDetails, IQueryResponse } from '../../models/common';

import { IGraphqlContext } from '../graphql-context';
import { GraphqlDefinition } from '../graphql-definition';
import { GetAllKPIsQuery } from '../../queries/app/kpis';
import * as logger from 'winston';

import { IBusinessUnit, IBusinessUnitDocument, IBusinessUnitModel } from '../../models/app/business-units';

export const businessUnitsGql: GraphqlDefinition = {
    name: 'businessUnits',
    schema: {
        types: `
            input NamedTypeDetails {
                _id: String
                name: String!
            }
            input BusinessUnitDetails {
                name: String!
                industry: NamedTypeDetails
                subIndustry: NamedTypeDetails
                shortName: String
                active: Boolean
                phone: String
                website: String
                address1: String
                address2: String
                city: String
                state: String
                zip: String
                timezone: String
                timeFormat: String
                dateFormat: String
                defaultCurrency: String
                defaultLanguage: String
                firstDayOfWeek: String
            }
            type NamedType {
                _id: String
                name: String
            }
            type BusinessUnit {
                _id: String
                name: String
                shortName: String
                active: Boolean
                phone: String
                website: String
                address1: String
                address2: String
                city: String
                state: String
                zip: String
                timezone: String
                timeFormat: String
                dateFormat: String
                defaultCurrency: String
                defaultLanguage: String
                firstDayOfWeek: String
                industry: NamedType
                subIndustry: NamedType
            }
            type BusinessUnitActionResponse {
                businessUnit: BusinessUnit
                errors: [ErrorDetails]
            }
            type BusinessUnitsPagedQueryResponse {
                pagination: PaginationInfo
                data: [BusinessUnit]
            }   
            type BusinessUnitResult {
                businessUnit: BusinessUnit
                errors: [ErrorDetails]
            }  
            `,
        queries: `
            businessUnits(details: PaginationDetails): BusinessUnitsPagedQueryResponse
            businessUnit(id: String!): BusinessUnitResult
            `,
        mutations: `
            createBusinessUnit(details: BusinessUnitDetails): BusinessUnitActionResponse
            updateBusinessUnit(id: String!, details: BusinessUnitDetails): BusinessUnitActionResponse
            removeBusinessUnit(id: String!): BusinessUnitActionResponse
        `,
    },
    resolvers: {
        Query: {
            businessUnits(root: any, args, ctx: IGraphqlContext) {
                let query = new ListAllBusinessUnitsQuery(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.queryBus.run('list-all-business-units', query, args);
            },
            businessUnit(root: any, args, ctx: IGraphqlContext) {
                let query = new FindBusinessUnitByIdQuery(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.queryBus.run('find-business-unit-by-id', query, args);
            }
        },
        Mutation: {
            createBusinessUnit(root: any, args, ctx: IGraphqlContext) {
                let mutation = new CreateBusinessUnitMutation(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.mutationBus.run<IMutationResponse>('create-business-unit', ctx.req, mutation, args);
            },
            updateBusinessUnit(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateBusinessUnitByIdMutation(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.mutationBus.run<IMutationResponse>('update-business-unit-by-id', ctx.req, mutation, args);
            },
            removeBusinessUnit(root: any, args, ctx: IGraphqlContext) {
                let mutation = new RemoveBusinessUnitByIdMutation(ctx.req.identity, ctx.req.appContext.BusinessUnit);
                return ctx.mutationBus.run<IMutationResponse>('remove-business-unit-by-id', ctx.req, mutation, args);
            }
        },
        BusinessUnitActionResponse: {
            businessUnit(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        BusinessUnitsPagedQueryResponse: {
            pagination(response: IPagedQueryResult<IBusinessUnit>) { return response.pagination; },
            data(response: IPagedQueryResult<IBusinessUnit>) { return response.data; }
        },
        BusinessUnitResult: {
            businessUnit(response: IQueryResponse<IBusinessUnitDocument>) { return response.data; },
            errors(response: IQueryResponse<IBusinessUnitDocument>) { return response.errors; }
        },
        BusinessUnit: {
            industry(businessUnit: IBusinessUnitDocument) { return businessUnit.industry; },
            subIndustry(businessUnit: IBusinessUnitDocument) { return businessUnit.subIndustry; }
        }
    }
};
