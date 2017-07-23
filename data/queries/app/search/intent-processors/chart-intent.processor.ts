import { IKPI, IKPIDocument } from '../../../../models/app/kpis';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { GetChartQuery } from '../../charts';
import { IAppModels } from '../../../../models/app/app-models';
import { IIdentity } from '../../../../models/app/identity';
import * as Promise from 'bluebird';
import { ISearchResult } from '../search.query';

const SalesKPI: IKPIDocument = <any>{
    code: 'Revenue',
    name: 'Revenue'
};

const ExpensesKPI: IKPIDocument = <any>{
    code: 'Expenses',
    name: 'Expenses'
};

export class ChartIntentProcessor {

    /**
     * [ { confidence: 0.75,
        chartKey: 'give me',
        intent_type: 'ChartIntent',
        Collection: 'sales',
        Frequency: 'monthly',
        target: null,
        ChartType: 'column chart',
        DateRange: 'last month',
        Grouping: 'location' } ]
        */

    static run(identity: IIdentity, ctx: IAppModels, intent: any): Promise<ISearchResult[]> {
        const that = this;

        return new Promise<ISearchResult[]>((resolve, reject) => {
            let chartQuery = new GetChartQuery(identity, ctx);
            chartQuery.run({ chart: that._convertIntentToChart(intent) }).then((chart: string) => {
                resolve([{
                    section: 'chart',
                    data: chart
                }]);
            }).catch(e => reject(e));
        });
    }

    private static _convertIntentToChart(intent: any): IChart {
        return {
            title: `${intent.DateRange} ${intent.Collection}`,
            kpis: intent.Collection === 'sales' ? [SalesKPI] : [ExpensesKPI],
            dateRange: { predefined: intent.DateRange },
            filter: '',
            frequency: intent.Frequency,
            groupings: this._processGrouping(intent.Grouping),
            xAxisSource: '',
            chartDefinition: {
                chart: { type: intent.ChartType.split(' ')[0] }
            }
        };
    }

    private static _processGrouping(grouping: string): string[] {
        if (grouping === 'business unit') {
            return ['businessUnit'];
        } else {
            return [grouping];
        }
    }

}