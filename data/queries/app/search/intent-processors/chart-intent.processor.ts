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

        return new Promise<ISearchResult[]>((resolve, reject) => {
            let chartQuery = new GetChartQuery(identity, ctx);
            chartQuery.run();
        });
    }

    private static _convertIntentToChart(intent: any): IChart {
        return {
            title: `${intent.DateRange} ${intent.Collection}`,
            kpis: intent.Collection === 'sales' ? [SalesKPI] : [ExpensesKPI],
            dateRange: { custom: intent.DateRange },
            filter: '',
            frequency: '',
            groupings: [''],
            xAxisSource: '',
            chartDefinition: ''
        };
    }

}