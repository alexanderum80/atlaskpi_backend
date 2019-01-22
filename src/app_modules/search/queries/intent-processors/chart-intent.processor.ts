import { SearchResult } from '../../search.types';
import { inject, injectable } from 'inversify';

import { IChart } from '../../../../domain/app/charts/chart';
import { IKPIDocument, KPITypeEnum } from '../../../../domain/app/kpis/kpi';
import { ChartsService } from '../../../../services/charts.service';
import { ISearchResult } from '../search.query';

const SalesKPI: IKPIDocument = < any > {
    _id: '59c3bd0c3da88e92a1703fd6',
    code: 'Revenue',
    name: 'Revenue',
    type: KPITypeEnum.Simple,
    expression: 'sum(Sales.product.amount)'
};

const ExpensesKPI: IKPIDocument = < any > {
    _id: '59c3d0b33da88e92a1703fdd',
    code: 'Expenses',
    name: 'Expenses',
    type: KPITypeEnum.Simple,
    expression: 'sum(expenses.expense.amount)'
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

   async run(intent: any): Promise < SearchResult[] > {
        const chartData = this._convertIntentToChart(intent);
        const chart = await this._chartService.getChart(chartData);

        return [{
            section: 'chart',
            items: [{
                name: '',
                data: JSON.stringify(chart)
            }]
        }];
    }

    private _convertIntentToChart(intent: any): IChart {
        const chartType = intent.ChartType.split(' ')[0];
        return {
            title: `${intent.DateRange} ${intent.Collection}`,
            kpis: intent.Collection === 'sales'
                ? [{ type: chartType, kpi: SalesKPI }]
                : [{ type: chartType, kpi: ExpensesKPI}],
            dateRange: [{
                predefined: intent.DateRange
            }],
            filter: '',
            frequency: intent.Frequency,
            groupings: this._processGrouping(intent.Grouping),
            xAxisSource: '',
            chartDefinition: {
                chart: {
                    type: chartType
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