import { CustomList } from './../domain/app/custom-list/custom-list.model';
import { camelCase } from 'change-case';
import { IDateRange } from '../domain/common/date-range';
import { IVirtualSourceDocument, IVirtualSource } from '../domain/app/virtual-sources/virtual-source';
import { DataSourceField, DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import {VirtualSources, mapDataSourceFields} from '../domain/app/virtual-sources/virtual-source.model';
import { sortBy, concat, isBoolean } from 'lodash';
import { Logger } from '../domain/app/logger';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import * as Bluebird from 'bluebird';
import { isObject, isEmpty, toInteger, toNumber } from 'lodash';
import {KPIExpressionFieldInput} from '../app_modules/kpis/kpis.types';
import {getFieldsWithData, getGenericModel, getAggregateResult} from '../domain/common/fields-with-data';
import { ICriteriaSearchable } from '../app_modules/shared/criteria.plugin';
import * as mongoose from 'mongoose';
import { AppConnection } from '../domain/app/app.connection';
import * as moment from 'moment';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { Connectors } from '../domain/master/connectors/connector.model';
import { CurrentUser } from '../domain/app/current-user';
import { ICustomListResponse, ICustomListInput } from '../domain/app/custom-list/custom-list';

const GOOGLE_ANALYTICS = 'GoogleAnalytics';

export interface IFieldAvailabilityOptions {
    dateRangeFilter?: { $gte: Date, $lt: Date };
    filters?: any;
    excludeSourceField?: boolean;
}

@injectable()
export class CustomListService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(AppConnection.name) private _appConnection: AppConnection,
        @inject(CustomList.name) private _customList: CustomList,
        @inject(CurrentUser.name) private _user: CurrentUser
        ) { }

    async getCustomList(id?: string): Promise<ICustomListResponse[]> {
        const user = this._user.get().id;
        return await this._customList.model.getCustomList(user, id);
    }

    async customListByName(name: string): Promise<ICustomListResponse> {
        try {
            const user = this._user.get().id;
            return await this._customList.model.getCustomListByName(user, name);
        }
        catch (err) {
            console.log(err);
        }
    }

    async addCustomList(input: ICustomListInput): Promise<ICustomListResponse> {
        const user = this._user.get().id;
        input['user'] = user;
        return await this._customList.model.addCustomList(input);
    }

    async updateCustomList(input: ICustomListInput): Promise<ICustomListResponse> {
        const user = this._user.get().id;
        input['user'] = user;
        return await this._customList.model.updateCustomList(input);
    }
}