import { DateRangeHelper, IDateRangeItem } from './date-range.helper';
import { IIdentity } from '../../../models/app/identity';
import { IAppModels } from './../../../models/app/app-models';
import { IDataSource } from './../../../models/app/data-sources/IData-source';
import { QueryBase } from '../../query-base';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import * as mongoose from 'mongoose';
import { readMongooseSchema } from '../../../../lib/utils';
import { flatten } from '../../../../lib/utils';
import * as _ from 'lodash';

export class GetDateRangesQuery extends QueryBase<IDateRangeItem[]> {

    constructor(public identity: IIdentity) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: any): Promise<IDateRangeItem[]> {
        const dateRanges = DateRangeHelper.GetDateRangeItems();
        return Promise.resolve(dateRanges);
    }
}
