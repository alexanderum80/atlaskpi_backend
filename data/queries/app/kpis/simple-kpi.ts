import { IKPI } from '../../../models/app/kpis';
import { IAppModels } from './../../../models/app/app-models';
import { KPITypeEnum, IKPISimpleDefinition, IKPIDocument } from './../../../models/app/kpis/IKPI';
import { KPIExpressionHelper } from '../../../models/app/kpis/kpi-expression.helper';
import { IExpenseModel } from '../../../models/app/expenses';
import * as Promise from 'bluebird';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase } from './kpi-base';
import { FrequencyEnum } from '../../../models/common/frequency-enum';
import { IDateRange } from '../../../models/common/date-range';
import * as changeCase from 'change-case';

import * as _ from 'lodash';

const CollectionModelTableMapping = {
    sales: 'Sale',
    expenses: 'Expense'
};

export class SimpleKPI extends KpiBase implements IKpiBase {

    public static CreateFromExpression(models: IAppModels, kpi: IKPIDocument): SimpleKPI {
        const simpleKPIDefinition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, kpi.expression);
        const model = models[CollectionModelTableMapping[simpleKPIDefinition.dataSource]];
        const aggregateSkeleton: AggregateStage[] = [
            {
                filter: true,
                $match: { }
            },
            {
                frequency: true,
                $project: {
                    '_id': 0
                }
            },
            {
                frequency: true,
                $group: {
                    _id: { }
                }
            },
            {
                $sort: {
                    frequency: 1
                }
            }
        ];
        return new SimpleKPI(model, aggregateSkeleton, simpleKPIDefinition, kpi);
    }

    constructor(model: any, baseAggregate: any, definition: IKPISimpleDefinition, kpi: IKPI) {
        super(model, baseAggregate);

        this.kpi = kpi;

        this._injectProjectField(definition.field);
        this._injectAccumulatorFunctionAndFild(definition.function, definition.field);
    }

    getData(dateRange: IDateRange, options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

    private _injectProjectField(fieldName: string) {
        const  projectStage = this.findStage('frequency', '$project');

        const fieldTokens = fieldName.split('.');

        projectStage.$project[fieldTokens[0]] = 1;
    }

    private _injectAccumulatorFunctionAndFild(funcName: string, filedName: string) {
        const groupStage = this.findStage('frequency', '$group');

        const value = this._getValueObject(funcName, filedName);

        groupStage.$group.value = value;
    }

    private _getValueObject(funcName: string, fieldName: string) {
        switch (funcName) {
            case 'count':
                return { $sum: 1 };

            default:
                const func = '$' + funcName;
                const field = '$' + fieldName;
                const value = { };
                value[func] = field;
                return value;
        }
    }



}