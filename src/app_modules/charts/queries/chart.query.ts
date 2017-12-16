import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { Logger } from '../../../../di';
import { IChart, IChartInput } from '../../../domain/app/charts/chart';
import { Charts } from '../../../domain/app/charts/chart.model';
import { IDashboardDocument } from '../../../domain/app/dashboards/dashboard';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { Users } from '../../../domain/app/security/users/user.model';
import { Targets } from '../../../domain/app/targets/target.model';
import { FrequencyTable } from '../../../domain/common/frequency-enum';
import { input } from '../../../framework/decorators/input.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetService } from '../../../services/target.service';
import { DateRangeHelper } from '../../date-ranges/queries/date-range.helper';
import { KpiFactory } from '../../kpis/queries/kpi.factory';
import { GetChartActivity } from '../activities/get-chart.activity';
import { GetChartInput } from '../charts.types';
import { getGroupingMetadata } from './chart-grouping-map';
import { ChartFactory } from './charts/chart-factory';
import { IChartMetadata } from './charts/chart-metadata';


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
        @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
        @inject(ChartFactory.name) private _chartFactory: ChartFactory,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Charts.name) private _charts: Charts,
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(Users.name) private _users: Users,
        @inject(Targets.name) private _targets: Targets,
        @inject(TargetService.name) private _targetService: TargetService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    run(data: { id: string, input: IChartInput, /* TODO: I added this extra parameter here maually */ chart: any }): Promise<String> {
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

                let uiChart = that._chartFactory.getInstance(chart);
                let kpi = that._kpiFactory.getInstance(chart.kpis[0]);
                let groupings = getGroupingMetadata(chart, data.input ? data.input.groupings : []);

                let frequency = FrequencyTable[(data.input && data.input.frequency) ? data.input.frequency : chart.frequency];
                let definitionParameters: IChartMetadata = {
                    filter: (data.input && data.input.filter)  ? data.input.filter : chart.filter,
                    frequency: frequency,
                    groupings: groupings,
                    comparison: (data.input && !isEmpty(data.input.comparison))  ? data.input.comparison : chart.comparison,
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
                    chart.availableComparison = DateRangeHelper
                        .getComparisonItemsForDateRangeIdentifier(chart.dateRange[0].predefined || 'custom')
                        .map(item => item.key);
                }

                let checkDrillDown = (data.input && data.input.isDrillDown);

                if (data.id && that._user && !checkDrillDown) {
                    that._targetService.getTargets(data.id, that._user._id)
                        .then((resp) => {
                            if (definitionParameters.isFutureTarget &&
                                chart.frequency !== 'yearly') {
                                definitionParameters.dateRange = definitionParameters.dateRange ||
                                    [{ predefined: null,
                                        custom: TargetService.futureTargets(resp) }];
                            }

                            uiChart.getDefinition(kpi, definitionParameters, resp).then((definition) => {
                                that._logger.debug('chart definition received for id: ' + data.id);
                                chart.chartDefinition = definition;
                                resolve(JSON.stringify(chart));
                            }).catch(e => {
                                console.error(e);
                                reject(e);
                            });
                    });
                } else {
                    uiChart.getDefinition(kpi, definitionParameters, []).then((definition) => {
                        that._logger.debug('chart definition received for id: ' + data.id);
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
            this._charts.model
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
            that._dashboards.model.find( { charts: { $in: [chart._id] }}).exec()
                .then((dashboards) => resolve(dashboards))
                .catch(err => reject(err));
        });
    }
}
