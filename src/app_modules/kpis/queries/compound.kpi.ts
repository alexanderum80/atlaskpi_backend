import { from } from 'apollo-link/lib';
import * as jsep from 'jsep';
import { clone, isArray, remove } from 'lodash';
import * as math from 'mathjs';

import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { IChartDateRange, IDateRange, parsePredefinedDate } from '../../../domain/common/date-range';
import { FrequencyTable } from '../../../domain/common/frequency-enum';
import { IGetDataOptions, IKpiBase } from './kpi-base';
import { KpiFactory } from './kpi.factory';


type KpiOperators = {
    '-', '+', '*', '/'
};

export const ExpressionTreeTypes = {
    binary: 'BinaryExpression',
    identifier: 'Identifier',
    literal: 'Literal',
    CallExpression: 'CallExpression'
};

export class CompositeKpi implements IKpiBase {

    private _dateRange: IDateRange[];
    private _getDataOptions: IGetDataOptions;

    constructor(
        private _kpi: IKPIDocument,
        private _kpiFactory: KpiFactory,
        private _kpis: KPIs,
        private _tz: string) { }

    // constructor(private _kpi: IKPIDocument, private ctx: IAppModels) { }

    getData(dateRange: IDateRange[], options?: IGetDataOptions): Promise<any> {
        this._dateRange = dateRange;
        this._getDataOptions = options;

        const exp: jsep.IExpression = jsep(this._kpi.expression);
        return this._processExpression(exp);
    }

    // getData(): Promise<any> {
    //     const exp: jsep.IExpression = jsep(this._kpi.expression);
    //     return this._processExpression(exp);
    // }

    getTargetData(): Promise<any> {
        const exp: jsep.IExpression = jsep(this._kpi.expression);
        return this._processExpression(exp);
    }

    private _processExpression(exp: jsep.IExpression): Promise<any> {
        switch (exp.type) {
            case ExpressionTreeTypes.binary:
                return this._processBinaryExpression(<jsep.IBinaryExpression>exp);
            case ExpressionTreeTypes.identifier:
                return this._getKpiData((<jsep.IIdentifier>exp).name.replace('kpi', ''));
            case ExpressionTreeTypes.literal:
                return Promise.resolve(+(<jsep.ILiteral>exp).value);
            // case ExpressionTreeTypes.CallExpression:
            //     return this._getCallExpressionData(exp);
        }
    }

    private _processBinaryExpression(exp: jsep.IBinaryExpression): Promise<any> {
        const that = this;
        // get type for operands
        const leftValue = this._processExpression(exp.left);
        const rightValue = this._processExpression(exp.right);

        return new Promise<any>((resolve, reject) => {
            Promise.all([leftValue, rightValue]).then(results => {
                const result = that._applyBinaryOperator(results[0], exp.operator, results[1]);
                resolve(result);
            }).catch(e => reject(e));
        });
    }

    private async _getKpiData(id: string): Promise<any> {
        try {
            const kpiDocument = await this._kpis.model.findOne({ _id: id });
            const kpi = await this._kpiFactory.getInstance(kpiDocument);
            let getDateRange: IDateRange;

            if (this._dateRange && this._dateRange.length > 0) {
                getDateRange = this._dateRange[0];
            } else {
                getDateRange = this._processChartDateRange(kpiDocument.dateRange);
            }

            if (!getDateRange) {
                console.error('Compound kpi without a date range cannot be proccessed');
                return;
            }

            const dateRange = Array.isArray(getDateRange) ? getDateRange : [getDateRange];

            let options: IGetDataOptions;

            if (this._getDataOptions) {
                options = this._getDataOptions;
            } else {
                options = {
                    filter: kpiDocument.filter,
                    frequency: FrequencyTable[kpiDocument.frequency],
                    groupings: null
                };
            }

            return await kpi.getData(dateRange, options);
        } catch (e) {
            console.error('Error getting kpi data', e);
        }
    }

    private _getCallExpressionData(exp) {
        // call expression should be one of the following aggregate functions
        // SUM, MAX, MIN, AVG, COUNT
    }

    private _processChartDateRange(chartDateRange: IChartDateRange): IDateRange {
        return chartDateRange.custom && chartDateRange.custom.from ?
            { from: new Date(chartDateRange.custom.from), to: new Date(chartDateRange.custom.to) }
            : parsePredefinedDate(chartDateRange.predefined, this._tz);
    }

    private _applyBinaryOperator(left, operator, right): any {
        // I need to make sure that both sets have the same data
        // algorhitm: Start running one collection
        const that = this;
        const leftIsArray = isArray(left);
        const rightIsArray = isArray(right);

        if (leftIsArray && rightIsArray) {
            return this._mergeList(left, operator, right);
        } else if (leftIsArray && !rightIsArray) {
            return this._applyLiteralToList(left, operator, +right);
        } else if (!leftIsArray && rightIsArray) {
            return this._applyLiteralToList(right, operator, +left);
        } else if (!leftIsArray && !rightIsArray) {
            return that._doCalculation(left, operator, right);
        }
    }

    private _mergeList(leftList, operator, rightList) {
        const that = this;
        let result = [];

        // check if leftList/rightList is null or undefined
        if (!leftList || !rightList) {
            return;
        }

        // check if leftList and rightList has empty array
        if (!leftList.length && !rightList.length) {
            return;
        }

        // get the keys for the first element
        const keysToTest: any[] = leftList.length ?
            Object.keys(leftList[0]._id) :
            (
                rightList.length ?
                Object.keys(rightList[0]._id) :
                []
            );

        // start on the left collection
        (<Array<any>>leftList).forEach(l => {
            const rightSide = that._popWithSameGroupings(rightList, l, keysToTest);
            const rightValue = rightSide.length > 0 ? rightSide[0].value : 0;
            let newDataItem = clone(l);

            newDataItem.value = that._doCalculation(l.value, operator, rightValue);
            result.push(newDataItem);
        });
        // now continue with whatever is left on the right cloned collection
        (<Array<any>>rightList).forEach(r => {
            const leftSide = that._popWithSameGroupings(leftList, r, keysToTest);
            const leftValue = leftSide.length > 0 ? leftSide[0].value : 0;
            let newDataItem = clone(r);

            newDataItem.value = that._doCalculation(leftValue, operator, r.value);
            result.push(newDataItem);
        });

        return result;
    }

    private _popWithSameGroupings(collection: any[], ele: any, keys: string[]) {
        return remove(collection, (e) => {
            let found = true;
            // build the comparison object with all the jeys for this object
            keys.forEach(key => {
                // if at least one value is different then I can finish the comparison here
                if (e._id[key] !== ele._id[key]) {
                    found = false;
                    return;
                }
            });

            return found;
        });
    }

    private _doCalculation(left, operator, right) {
        return math.eval(`${left || 0} ${operator} ${right || 0}`);
    }

    private _applyLiteralToList(list: any[], operator: string, value: number) {
        const that = this;
        list.forEach(item => item.value = that._doCalculation(item.value, operator, value));
        return list;
    }

}