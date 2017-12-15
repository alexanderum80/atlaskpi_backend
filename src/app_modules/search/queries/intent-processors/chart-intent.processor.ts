import * as Promise from 'bluebird';

import { IChart } from '../../../../domain/app/charts/chart';
import { IKPIDocument } from '../../../../domain/app/kpis/kpi';

const SalesKPI: IKPIDocument = <any>{
    _id: '59c3bd0c3da88e92a1703fd6',
    code: 'Revenue',
    name: 'Revenue'
};

const ExpensesKPI: IKPIDocument = <any>{
    _id: '59c3d0b33da88e92a1703fdd',
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

    static run(intent: any, chartQuery: GetChartQuery): Promise<ISearchResult[]> {
        const that = this;

        return new Promise<ISearchResult[]>((resolve, reject) => {
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
            dateRange: [{ predefined: intent.DateRange }],
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