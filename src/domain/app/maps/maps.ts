import { ISearchableModel } from '../global-search/global-search';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import { IChartDateRange } from '../../common/date-range';
import { MapAttributesInput } from '../../../app_modules/maps/map.types';

export interface IMap {
    // _id: string;
    title: string;
    subtitle?: string;
    group?: string;
    dateRange: IChartDateRange;
    groupings: string[];
    dashboards: string[];
    size: string;
    kpi: string;
}

export interface IMapInput {
    title: string;
    subtitle?: string;
    group?: string;
    dateRange: IChartDateRange;
    groupings: string[];
    dashboards: string[];
    size: string;
    kpi: string;
}

export interface IGetMapInput {
    dateRange: IChartDateRange;
    groupings: string[];
    size: string;
    kpi: string;
}

export interface IMapDocument extends IMap, mongoose.Document {
}

export interface IMapModel extends mongoose.Model<IMapDocument>, ISearchableModel {
    /**
     * Create a Map
     * @param { MapAttributesInput } input - and input object with the details of the map
     * @returns {Promise<IMapDocument>}
     */
    createMap(input: MapAttributesInput): Promise<IMapDocument>;
    /**
     * Update a Map
     * @param { string } id - and input object with the details of the map
     * @param { MapAttributesInput } input - and input object with the details of the map
     * @returns {Promise<IMapDocument>}
     */
    updateMap(id: string, input: MapAttributesInput): Promise<String>;

    listMapByGroup(group: string): Promise<IMapDocument[]>;

    getMapsGroup(): Promise<IMapDocument[]>;

}
