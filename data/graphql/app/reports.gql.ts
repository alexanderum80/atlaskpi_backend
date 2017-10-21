import { EndOfDayReportService } from '../../services/reports/end-of-day-report.service';
import { EndOfDayReportQuery } from '../../queries/app/reports/end-of-day-report.query';
import { GraphqlDefinition } from '../graphql-definition';
import { IGraphqlContext } from '../';

export const reportsGql: GraphqlDefinition = {
    name: 'access-log',
    schema: {
        types: `
            type EndOfDayReportWinner {
                name: String
                sales: Float
            }
            type EndOfDayReportWinnerMap {
                employees: [EndOfDayReportWinner]
                products: [EndOfDayReportWinner]
            }
            type EndOfDayReport {
                todaySales: Float
                monthSales: Float
                todayExpenses: Float
                winners: EndOfDayReportWinnerMap
            }
        `,
        queries: `
            endOfDayReport: EndOfDayReport
        `,
        mutations: ``,
    },
    resolvers: {
        Query: {
            endOfDayReport(root: any, args, ctx: IGraphqlContext) {
                const endOfDayReportservice = new EndOfDayReportService(
                    ctx.req.appContext.Sale,
                    ctx.req.appContext.Expense
                );
                let query = new EndOfDayReportQuery(ctx.req.identity, endOfDayReportservice);

                return ctx.queryBus.run('end-of-day-report', query, args, ctx.req);
            }
        },
        Mutation: {}
    }
};