import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IPaginationDetails {
    page: number;
    itemsPerPage: number;
    sortBy: string;
    filter?: string;
}

export const PaginationDetailsDefault: IPaginationDetails = {
    page: 1,
    itemsPerPage: 25,
    sortBy: null
};

export interface IPaginationInfo {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
}

export interface IPagedQueryResult<T> {
    pagination: IPaginationInfo;
    data: T[];
}

/**
 * Paginator encapsulate the logic to execute mongodb queries and
 * return results in pages
 */
export class Paginator<T extends mongoose.Document> {

    private _data: T[];
    private _count: number;

    constructor(
        private _model: mongoose.Model<T>,
        private _filterPaths?: string[],
        private _projection?: any) { }

    getPage(paging: IPaginationDetails): Promise<IPagedQueryResult<T>> {

        if ((<any>paging).details) {
            paging = Object.assign({}, PaginationDetailsDefault, (<any>paging).details);
        } else {
             paging = Object.assign({}, PaginationDetailsDefault, paging);
        }
        let that = this;
        let filter = this.getFilter(paging.filter);
        let getDataPromise = this._getData(paging);
        let getCountPromise = this._getCount(filter);

        return Promise.all([getDataPromise, getCountPromise]).then(() => {
            return {
                pagination: {
                    itemsPerPage: paging.itemsPerPage,
                    currentPage: paging.page,
                    totalItems: that._count
                },
                data: that._data
            };
        });
    }

    getFilter(filter: string, caseSensitive?: boolean) {
        if (!this._filterPaths) {
            return {};
        }

        let exp = new RegExp(filter);
        let conditions = [];

        this._filterPaths.forEach((f)  => {
            let condition = {};
            condition[f] = { $regex: exp };

            if (!caseSensitive) {
                condition[f].$options = 'i';
            }

            conditions.push(condition);
        });

        return conditions.length > 0 ? { $or: conditions } : {};
    }

    private _getData(paging: IPaginationDetails): Promise<T[]> {
        let that = this;

        return new Promise<T[]>((resolve, reject) => {
            let filterObj = this.getFilter(paging.filter);
            let skip = (paging.page - 1) * paging.itemsPerPage;

            this._model.find(filterObj, this._projection || {})
                .skip(skip)
                .limit(paging.itemsPerPage)
                .sort(paging.sortBy)
                .then((res) => {
                    that._data = res;
                    resolve(res);
                });
        });
    }

    private _getCount(filter: any): Promise<number> {
        let that = this;

        return new Promise<number>((resolve, reject) => {
            this._model.count(filter).then((count: number) => {
                that._count = count;
                resolve(count);
            });
        });
    }
}
