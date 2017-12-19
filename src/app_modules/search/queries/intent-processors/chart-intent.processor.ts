import {
    ISearchResult
} from '../search.query';
import * as Promise from 'bluebird';
import {
    injectable,
    inject
} from 'inversify';

import {
    IChart
} from '../../../../domain/app/charts/chart';
import {
    IKPIDocument
} from '../../../../domain/app/kpis/kpi';
import {
    ChartsService
} from '../../../../services/charts.service';

const SalesKPI: IKPIDocument = < any > {
    _id: '59c3bd0c3da88e92a1703fd6',
    code: 'Revenue',
    name: 'Revenue'
};

const ExpensesKPI: IKPIDocument = < any > {
    _id: '59c3d0b33da88e92a1703fdd',
    code: 'Expenses',
    name: 'Expenses'
};

@injectable()
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

    constructor(@inject(ChartsService.name) private _chartService: ChartsService) {}

    run(intent: any): Promise < ISearchResult[] > {
        const that = this;

        return new Promise < ISearchResult[] > ((resolve, reject) => {
            const chart = that._convertIntentToChart(intent);
            that._chartService.getChart(chart).then(chart => {
                resolve([{
                    section: 'chart',
                    data: JSON.stringify(chart)
                }]);
            }).catch(e => reject(e));
        });

        // chartQuery.run({ chart: that._convertIntentToChart(intent) }).then((chart: string) => {

        // })
    }

    private _convertIntentToChart(intent: any): IChart {
        return {
            title: `${intent.DateRange} ${intent.Collection}`,
            kpis: intent.Collection === 'sales' ? [SalesKPI] : [ExpensesKPI],
            dateRange: [{
                predefined: intent.DateRange
            }],
            filter: '',
            frequency: intent.Frequency,
            groupings: this._processGrouping(intent.Grouping),
            xAxisSource: '',
            chartDefinition: {
                chart: {
                    type: intent.ChartType.split(' ')[0]
                }
            }
        };
    }

    private _processGrouping(grouping: string): string[] {
        if (grouping === 'business unit') {
            return ['businessUnit'];
        } else {
            return [grouping];
        }
    }

}