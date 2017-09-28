import { getGroupingMetadata } from '../charts/chart-grouping-map';
import { FrequencyTable, IChartDateRange, IDateRange, parsePredifinedDate } from '../../../models/common';
import { KpiFactory } from './kpi.factory';
import { IAppModels } from '../../../models/app/app-models';
import { IKPI, IKPIDocument } from '../../../models/app/kpis';
import { IGetDataOptions, IKpiBase } from './kpi-base';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as math from 'mathjs';
import * as jsep from 'jsep';

type KpiOperators = {
    '-', '+', '*', '/'
};

export const ExpressionTreeTypes = {
    binary: 'BinaryExpression',
    identifier: 'Identifier',
    literal: 'Literal'
};

export class CompositeKpi implements IKpiBase {

    constructor(private _kpi: IKPIDocument, private ctx: IAppModels) { }

    getData(): Promise<any> {
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

    private _getKpiData(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.ctx.KPI.findOne({ _id: id }).then(kpiDocument => {
                const kpi = KpiFactory.getInstance(kpiDocument, this.ctx);
                const dateRange: IDateRange = this._processChartDateRange(kpiDocument.dateRange);
                const options: IGetDataOptions = {
                    filter: kpiDocument.filter,
                    frequency: FrequencyTable[kpiDocument.frequency],
                    groupings: getGroupingMetadata(null, kpiDocument.groupings)
                };

                kpi.getData(dateRange[0], options)
                    .then(res => resolve(res))
                    .catch(e => reject(e));
            });
        });
    }

    private _processChartDateRange(chartDateRange: IChartDateRange): IDateRange {
        return chartDateRange.custom && chartDateRange.custom.from ?
            { from: new Date(chartDateRange.custom.from), to: new Date(chartDateRange.custom.to) }
            : parsePredifinedDate(chartDateRange.predefined);
    }

    private _applyBinaryOperator(left, operator, right): any {
        // I need to make sure that both sets have the same data
        // algorhitm: Start running one collection
        const that = this;
        const leftIsArray = _.isArray(left);
        const rightIsArray = _.isArray(right);

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
        // get the keys for the first element
        const keysToTest = Object.keys(leftList[0]._id);
        // start on the left collection
        (<Array<any>>leftList).forEach(l => {
            const rightSide = that._popWithSameGroupings(rightList, l, keysToTest);
            const rightValue = rightSide.length > 0 ? rightSide[0].value : 0;
            let newDataItem = _.clone(l);

            newDataItem.value = that._doCalculation(l.value, operator, rightValue);
            result.push(newDataItem);
        });
        // now continue with whatever is left on the right cloned collection
        (<Array<any>>rightList).forEach(r => {
            const leftSide = that._popWithSameGroupings(leftList, r, keysToTest);
            const leftValue = leftSide.length > 0 ? leftSide[0].value : 0;
            let newDataItem = _.clone(r);

            newDataItem.value = that._doCalculation(leftValue, operator, r.value);
            result.push(newDataItem);
        });

        return result;
    }

    private _popWithSameGroupings(collection: any[], ele: any, keys: string[]) {
        return _.remove(collection, (e) => {
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