import { IUserDocument } from '../../../models/app/users/index';
import { TargetService } from '../../../services/targets/target.service';
import { QueryBase } from '../../query-base';
import { IChartMetadata } from './charts/chart-metadata';
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IChart, IChartDocument, IGetChartInput } from '../../../models/app/charts';
import { IAppModels } from '../../../models/app/app-models';
import { IDashboardDocument, IDashboardModel } from '../../../models/app/dashboards';

import { ChartFactory } from './charts/chart-factory';
import { KpiFactory } from '../kpis/kpi.factory';
import { getGroupingMetadata } from './chart-grouping-map';
import * as logger from 'winston';
import * as moment from 'moment';
import * as _ from 'lodash';

export class GetChartQuery extends QueryBase<string> {

    constructor(public identity: IIdentity, private _ctx: IAppModels, private _user?: IUserDocument) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: { chart?: IChart, id?: string, input?: IGetChartInput }): Promise<string> {
        logger.debug('running get chart query for id:' + data.id);

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

                let targetService = new TargetService(this._ctx.User, this._ctx.Target, this._ctx.Chart);

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

                if (data.input && data.input.hasOwnProperty('isFutureTarget')) {
                    definitionParameters.isFutureTarget = data.input.isFutureTarget;
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
