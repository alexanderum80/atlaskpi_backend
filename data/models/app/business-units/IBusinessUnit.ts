import { IPagedQueryResult, IPaginationDetails, IQueryResponse } from '../../common';
import { IMutationResponse } from '../../';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface INamedType {
    _id?: string;
    name: string;
}

export interface IBusinessUnit {
    name: string;
    industry: INamedType;
    subIndustry?: INamedType;
    shortName?: string;
    active?: boolean;

    phone?: string;
    website?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    timezone?: string;
    timeFormat?: string;
    dateFormat?: string;
    defaultCurrency?: string;
    defaultLanguage?: string;
    firstDayOfWeek?: string;
}

export interface IBusinessUnitDocument extends IBusinessUnit, mongoose.Document {

}

export interface IBusinessUnitModel extends mongoose.Model<IBusinessUnitDocument> {
    /**
     * Create a KPI providing all its elements
     */
    createBusinessUnit(details: IBusinessUnit): Promise<IMutationResponse>;
    /**
     * Retrieves all business units, paginated if pr providing all its elements
     */
    allBusinessUnits(details: IPaginationDetails): Promise<IPagedQueryResult<IBusinessUnitDocument>>;
    /**
     * Finds the business unit with the specified id
     * @param {string} id - the id to look for
     * @return {Promise<IBusinessUnitDocument>}
     */
    findBusinessUnitById(id: string): Promise<IQueryResponse<IBusinessUnitDocument>>;
     /**
     * Updates a businessUnit.
     * @param { String } id - id of the entity
     * @param {IBusinessUnitDetails} details - info information
     * @returns {Promise<IMutationResponse>}
     */
    updateBusinessUnit(id: string, details: IBusinessUnit): Promise<IMutationResponse>;
    /**
     * Removes a business unit.
     * @param { String } id - id of the entity
     * @returns {Promise<IMutationResponse>}
     */
    removeBusinessUnitById(id: string): Promise<IMutationResponse>;

}