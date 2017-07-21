import { FrequencyTable, IChartDateRange, IDateRange, parsePredifinedDate } from '../../../models/common';
import { KpiFactory } from './kpi.factory';
import { IAppModels } from '../../../models/app/app-models';
import { IKPI, IKPIDocument } from '../../../models/app/kpis';
import { IGetDataOptions, IKpiBase } from './kpi-base';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

type KpiOperators = {
    '-', '+', '*', '/'
};

interface BinaryKpiExpression {
    left: any;
    operator: KpiOperators;
    right: any;
}

export const ExpressionTypesMap = {
    binary: 'binaryExpression'
};

export class CompositeKpi implements IKpiBase {

    constructor(private _kpi: IKPIDocument, private ctx: IAppModels) { }

    getData(): Promise<any> {
        const that = this;
        let promises = this._kpi.composition.map(e => that._processExpression(e));

        return Promise.all(promises);
    }

    private _processExpression(exp: any): Promise<any> {
        const expression = Object.keys(exp)[0];

        switch (expression) {
            case ExpressionTypesMap.binary:
                return this._processBinaryExpression(exp);
            default:
                return;
        }
    }

    private _processBinaryExpression(exp: BinaryKpiExpression): Promise<any> {
        // validate the expression is valid first
        if (!exp.left || !exp.operator || !exp.right) {
            throw new Error('Malformed binary kpi expression');
        }

        const that = this;
        let leftKpiData = this._getKpiData(exp.left);
        let rightKpiData = this._getKpiData(exp.right);

        return Promise.all([leftKpiData, rightKpiData]).then(results => {
            that._applyBinaryOperator(results[0], results[1]);
        });
    }

    private _getKpiData(kpiDocument: IKPIDocument): Promise<any> {
        const kpi = KpiFactory.getInstance(kpiDocument, this.ctx);
        const dateRange: IDateRange = this._processChartDateRange(kpiDocument.dateRange);
        const options: IGetDataOptions = {
            filter: kpiDocument.filter,
            frequency: FrequencyTable[kpiDocument.frequency],
            groupings: kpiDocument.groupings
        };

        return kpi.getData(dateRange, options);
    }

    private _processChartDateRange(chartDateRange: IChartDateRange): IDateRange {
        return chartDateRange.custom && chartDateRange.custom.from ?
            { from: new Date(chartDateRange.custom.from), to: new Date(chartDateRange.custom.to) }
            : parsePredifinedDate(chartDateRange.predefined);
    }

    private _applyBinaryOperator(left, right): any {
        // I need to make sure that both sets have the same data
        // algorhitm: Start running one collection
        const that = this;
        const leftIsArray = _.isArray(left);
        const rightIsArray = _.isArray(right);

        if (leftIsArray && rightIsArray) {
            let result = [];
            // get the keys for the first element
            const keysToTest = Object.keys(left[0]);
            // remove the value key because it is not needed for comparison
            _.remove(keysToTest, k => k === 'value');
            // clone array on the right so we can remove elements from this array
            let rightCloned = _.clone(right);
            // start on the left collection
            (<Array<any>>left).forEach(l => {
                const rightSide = that._popWithSameGroupings(rightCloned, l, keysToTest);
                let newDataItem = _.clone(l);

                newDataItem.value = rightSide ? rightSide[0].value : 0;
                result.push(newDataItem);
            });
            // now continue with whatever is left on the right cloned collection
            (<Array<any>>rightCloned).forEach(r => {
                const leftSide = that._popWithSameGroupings(left, r, keysToTest);
                let newDataItem = _.clone(r);

                newDataItem.value = leftSide ? leftSide[0].value : 0;
                result.push(newDataItem);
            });
        }
    }

    private _popWithSameGroupings(collection: any[], ele: any, keys: string[]) {
        return _.remove(collection, (e) => {
            let found = true;
            // build the comparison object with all the jeys for this object
            keys.forEach(k => {
                // if at least one value is different then I can finish the comparison here
                if (e[k] !== ele[k]) {
                    found = false;
                    return;
                }
            });

            return found;
        });
    }

}