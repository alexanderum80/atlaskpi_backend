import { IChartModel } from '../../../models/app/charts';
import { QueryBase } from '../../query-base';
import { GetChartQuery } from './get-chart.query';
import { IAppModels } from '../../../models/app/app-models';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import { IChartDocument } from '../../../models/app/charts';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel } from '../../../';


export class ListChartsByGroupQuery {
   constructor(public identity: IIdentity, private _IChartModel: IChartModel) {
   }

    run(data: any): Promise<IChartDocument[]> {
        return this._IChartModel.listChartByGroup(data.group);
    }
}

