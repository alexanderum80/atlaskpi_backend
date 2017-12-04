import { IUserModel } from '../../../models/app/users/index';
import { ISaleModel } from '../../../models/app/sales';
import { IExpenseModel } from '../../../models/app/expenses';
import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../../index';
import * as Promise from 'bluebird';
import { flatten } from 'lodash';

export class GetKpisCriteriaQuery extends QueryBase<any> {
    constructor(public identity: IIdentity,
                private _saleModel: ISaleModel,
                private _expenseModel: IExpenseModel,
                private _userModel: IUserModel) {
        super(identity);
    }

    run(data: {kpi: string, field: string}): Promise<any> {
        const that = this;
        const kpiMapper = {
            'Sales': this._saleModel,
            'Expenses': this._expenseModel
        };

        return new Promise<any>((resolve, reject) => {
            if (!data.kpi || !data.field) {
                reject({ message: 'Did not provide the fields', error: 'Did not provide the fields' });
                return;
            }
            const model = kpiMapper[data.kpi];

            if (model) {
                model.findCriteria(data.field).then(res => {
                    resolve({
                        criteriaValue: res
                    });
                    return;
                }).catch(err => {
                    reject({message: 'unable to get data', error: err});
                    return;
                });
            } else {
                reject({ message: 'no kpi provided', error: 'no kpi provided' });
                return;
            }
        });
    }
}
