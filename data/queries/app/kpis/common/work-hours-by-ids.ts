import { IWorkLogModel } from '../../../../models/app/work-log/IWorkLog';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match: { }
    },
    {
        frequency: true,
        $project: { _id: 0, date: 1, hours: { $divide: [ '$workTime', 3600] } }
    },
    {
        frequency: true,
        $group: { _id: null, value: { $sum: '$hours' } }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];

export interface IWorkHoursByIdKpi extends IKpiBase {
    setExternalids(ids: any[]): void;
}

export class WorkHoursByIds extends KpiBase {

    externalIds: string[];

    constructor(logs: IWorkLogModel) {
        super(logs, aggregate);
    }

    setExternalids(ids: any[]) {
        this.externalIds = ids;
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        // inject a criteria to the $match stage
        if (this.externalIds) {
            let query = this.findStage('dateRange', '$match').$match;
            query['externalId'] = { '$in': this.externalIds };
        };

        return this.executeQuery('date', dateRange, frequency);
    }

    getDataToSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.getData(dateRange, frequency);
    }

}
