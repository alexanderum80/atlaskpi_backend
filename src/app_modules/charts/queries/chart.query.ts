import { IChartMetadata } from './charts';
import { FrequencyTable } from '../../../domain/common';
import { getGroupingMetadata } from './';
import { KpiFactory } from '../../kpis/queries';
import { ChartFactory } from './charts/chart-factory';
import { Targets } from '../../../domain/app/targets';
import { Users } from '../../../domain/app/security/users';
import { Winston } from 'winston';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Charts } from '../../../domain';
import { GetChartInput } from '../charts.types';
import { GetChartActivity } from '../activities';
import { IChart, IDashboardDocument } from '../../../domain/app/index';
import { DateRangeHelper } from '../../date-ranges/queries/date-range.helper';

// TODO: I need kind of a big refactory here
@injectable()
@query({
    name: 'chart',
    activity: GetChartActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'input', type: GetChartInput },
    ],
    output: { type: String }
})
export class ChartQuery implements IQuery<String> {
    constructor(
        @inject('Charts') private _charts: Charts,
        @inject('Users') private _users: Users,
        @inject('Targets') private _targets: Targets,
        @inject('logger') private _logger: Winston
    ) {
        
    }

    run(data: { id: string, input: GetChartInput, /* TODO: I added this extra parameter here maually */ chart: any }): Promise<String> {
        this._logger.debug('running get chart query for id:' + data.id);

        let that = this;

        // in order for this query to make sense I need either a chart definition or an id
        if (!data.chart && !data.id && !data.input) {
            return Promise.reject('An id or a chart definition is needed');
        }

        let chartPromise = data.chart ?
                Promise.resolve(data.chart)
                : this._getChart(data.id);

        return new Promise<string>((resolve, reject) => {
            chartPromise.then(chart => {

                    if (!chart) {
                        return reject(null);
                    }

                let targetService = new TargetService(this._users.model, this._targets.model, this._charts.model);

                let uiChart = ChartFactory.getInstance(chart);
                let kpi = KpiFactory.getInstance(chart.kpis[0], that._ctx);
                let groupings = getGroupingMetadata(chart, data.input ? data.input.groupings : []);

                let frequency = FrequencyTable[(data.input && data.input.frequency) ? data.input.frequency : chart.frequency];
                let definitionParameters: IChartMetadata = {
                    filter: (data.input && data.input.filter)  ? data.input.filter : chart.filter,
                    frequency: frequency,
                    groupings: groupings,
                    comparison: (data.input && !_.isEmpty(data.input.comparison))  ? data.input.comparison : chart.comparison,
                    xAxisSource: (data.input && data.input.xAxisSource) ? data.input.xAxisSource : chart.xAxisSource
                };

                if (data.input && data.input.dateRange && !data.input.isFutureTarget) {
                    definitionParameters.dateRange = data.input.dateRange;
                }

                if (data.input && data.input.isDrillDown) {
                    definitionParameters.isDrillDown = data.input.isDrillDown;
                }

                if (data.input && data.input['isFutureTarget']) {
                    definitionParameters.isFutureTarget = data.input.isFutureTarget;
                }

                if (!chart.comparison || chart.comparison.length < 1) {
                    chart.availableComparison = DateRangeHelper.getComparisonItemsForDateRangeIdentifier(chart.dateRange[0].predefined || 'custom')
                                                                .map(item => item.key);
                }

                let checkDrillDown = (data.input && data.input.isDrillDown);

                if (data.id && that._user && !checkDrillDown) {
                    targetService.getTargets(data.id, that._user._id)
                        .then((resp) => {
                            if (definitionParameters.isFutureTarget &&
                                chart.frequency !== 'yearly') {
                                definitionParameters.dateRange = definitionParameters.dateRange ||
                                    [{ predefined: null,
                                        custom: TargetService.futureTargets(resp) }];
                            }

                            uiChart.getDefinition(kpi, definitionParameters, resp).then((definition) => {
                                logger.debug('chart definition received for id: ' + data.id);
                                chart.chartDefinition = definition;
                                resolve(JSON.stringify(chart));
                            }).catch(e => {
                                console.error(e);
                                reject(e);
                            });
                    });
                } else {
                    uiChart.getDefinition(kpi, definitionParameters, []).then((definition) => {
                        logger.debug('chart definition received for id: ' + data.id);
                        chart.chartDefinition = definition;
                        resolve(JSON.stringify(chart));
                    }).catch(e => {
                        console.error(e);
                        reject(e);
                    });
                }
            });
        });
    }

    private _getChart(id: string): Promise<IChart> {
        const that = this;

        return new Promise<IChart>((resolve, reject) => {
            this._ctx.Chart
                .findOne({ _id: id })
                .populate({
                    path: 'kpis',
                }).then(chartDocument => {
                    that._resolveDashboards(chartDocument).then((dashboards) => {
                        const chart: any = chartDocument.toObject();
                        chart.dashboards = dashboards;
                        chart.availableComparison = DateRangeHelper.getComparisonItemsForDateRangeString(chart.dateRange[0].predefined || 'custom')
                                                                    .map(item => item.key);
                        resolve(chart);
                        return;
                    });
                })
                .catch(e => reject(e));
        });
    }

    private _resolveDashboards(chart): Promise<IDashboardDocument[]> {
        const that = this;
        return new Promise<IDashboardDocument[]>((resolve, reject) => {
            that._ctx.Dashboard.find( { charts: { $in: [chart._id] }}).exec()
                .then((dashboards) => resolve(dashboards))
                .catch(err => reject(err));
        });
    }
}
