import * as jsep from 'jsep';

import { GroupingMap } from '../../../app_modules/charts/queries/chart-grouping-map';
import { field } from '../../../framework/decorators/field.decorator';
import { IKPISimpleDefinition, KPITypeEnum } from './kpi';


interface ICallExpression extends jsep.IExpression {
    type: 'CallExpression';
    arguments: jsep.IExpression;
    callee: jsep.IIdentifier;
}

const ExpressionTreeTypes = {
    binary: 'BinaryExpression',
    call: 'CallExpression',
    identifier: 'Identifier',
    literal: 'Literal',
    member: 'MemberExpression'
};

export class KPIExpressionHelper {
    public static ComposeExpression(kpiType: KPITypeEnum, expression: string): string {

        switch (kpiType) {
            case KPITypeEnum.Simple:
                return KPIExpressionHelper._composeSimpleExpression(expression);

            default:
                return expression;
        }
    }

    public static DecomposeExpression(kpiType: KPITypeEnum, expression: string): IKPISimpleDefinition | any {
        switch (kpiType) {
            case KPITypeEnum.Simple:
                return KPIExpressionHelper._decomposeSimpleExpression(expression);

            // right now we are decomposing the google analytics definition the same way than the simple definition
            // DATASOURCE FORMULA IN EXPRESSION: FUNC (connectorTypeConnectorId.metric)
            //                               ex: sum(googleanalytics5a551cec278c503642b3d096.users)
            case KPITypeEnum.GoogleAnalytics:
                return KPIExpressionHelper._decomposeGoogleAnalyticsExpression(expression);
            default:
                return null;
        }
    }

    public static PrepareExpressionField(type: string, expression: string): string {
        switch (type) {
            case KPITypeEnum.Simple:
                return JSON.stringify(KPIExpressionHelper.DecomposeExpression(type, expression));

            default:
                return expression;

        }
    }

    private static _composeSimpleExpression(rawExpression: string): string {
        const simple: IKPISimpleDefinition = JSON.parse(rawExpression);

        if (!simple) return null;

        // AggregationFunction( collection . field )
        let exp = `${simple.function}(${simple.dataSource}.${simple.field})`;

        // if any mathematical opeartor: exp operator value
        if (simple.operator && simple.value) {
            exp += ` ${simple.operator} ${simple.value}`;
        }

        return exp;
    }

    private static _decomposeSimpleExpression(expression: string): IKPISimpleDefinition {
        expression =  KPIExpressionHelper._cleanExpression(expression);
        const tree: jsep.IExpression = jsep(expression);

        return KPIExpressionHelper._processExpression(<jsep.IExpression>tree);
    }

    private static _cleanExpression(expression: string) {
        return expression.replace(/[,$]/g, '');
    }

    private static _getSimpleKPIFromCallExp(callExp: ICallExpression): IKPISimpleDefinition {
        let dataSource;
        let func = callExp.callee.name;
        let field;

        const fullField = String(KPIExpressionHelper._processExpression(callExp.arguments[0]));

        if (!fullField) return null;

        // get collections
        const collections = Object.keys(GroupingMap);
        for (let i = 0; i < collections.length; i++) {
           if  (fullField.indexOf(collections[i]) === 0) {
               dataSource = collections[i];
               field = fullField.replace(`${collections[i]}.`, '');
               break;
           }
        }

        const simple: IKPISimpleDefinition = {
                                               dataSource: dataSource,
                                               function: func,
                                               field: field
                                             };
        return simple;
    }

    private static _getSimpleKPIFromBinExp(binExp: jsep.IBinaryExpression): IKPISimpleDefinition {
        let operator = binExp.operator;
        let value = KPIExpressionHelper._processExpression(binExp.right);
        const partialSimple = KPIExpressionHelper._processExpression(binExp.left);

        const result: IKPISimpleDefinition = {
                                               dataSource: partialSimple.dataSource,
                                               function: partialSimple.function,
                                               field: partialSimple.field,
                                               operator: operator,
                                               value: value
                                             };
        return result;
    }

    private static _processExpression(e: jsep.IExpression): any {
        switch (e.type) {
            case ExpressionTreeTypes.call:
                const callExp = (<ICallExpression>e);
                return KPIExpressionHelper._getSimpleKPIFromCallExp(callExp);
            case ExpressionTreeTypes.binary:
                const binExp = (<jsep.IBinaryExpression>e);
                return KPIExpressionHelper._getSimpleKPIFromBinExp(binExp);
            case ExpressionTreeTypes.member:
                return this._processMemberExpression(<jsep.IMemberExpression>e);
            case ExpressionTreeTypes.identifier:
                return (<jsep.IIdentifier>e).name;
            case ExpressionTreeTypes.literal:
                return +(<jsep.ILiteral>e).value;
        }
    }

    private static _processMemberExpression(e: jsep.IMemberExpression): any {
        return this._processExpression(e.object) + '.' + this._processExpression(e.property);
    }

    private static _decomposeGoogleAnalyticsExpression(expression: string): IKPISimpleDefinition {
        expression =  KPIExpressionHelper._cleanExpression(expression);
        const tree: jsep.IExpression = jsep(expression);

        return KPIExpressionHelper._processGoogleAnalyticsExpression(<jsep.IExpression>tree);
    }

    private static _processGoogleAnalyticsExpression(e: jsep.IExpression): any {
        switch (e.type) {
            case ExpressionTreeTypes.call:
                const callExp = (<ICallExpression>e);
                return KPIExpressionHelper._getGoogleAnalyticsKPIFromCallExp(callExp);
            case ExpressionTreeTypes.binary:
                const binExp = (<jsep.IBinaryExpression>e);
                return KPIExpressionHelper._getGoogleAnalyticsKPIFromBinExp(binExp);
            case ExpressionTreeTypes.member:
                return this._processMemberExpression(<jsep.IMemberExpression>e);
            case ExpressionTreeTypes.identifier:
                return (<jsep.IIdentifier>e).name;
            case ExpressionTreeTypes.literal:
                return +(<jsep.ILiteral>e).value;
        }
    }

    // DATASOURCE FORMULA IN EXPRESSION: FUNC (connectorTypeConnectorId.metric)
    //                               ex: sum(googleanalytics5a551cec278c503642b3d096.users)
    private static _getGoogleAnalyticsKPIFromCallExp(callExp: ICallExpression): IKPISimpleDefinition {
        let dataSource;
        let func = callExp.callee.name;
        let field;

        const fullField = String(KPIExpressionHelper._processExpression(callExp.arguments[0]));

        if (!fullField) return null;

        // lets ensure
        if (fullField.substr(0, 15) !== 'googleanalytics') return null;

        const fieldTokens = fullField.split('.');

        const simple: IKPISimpleDefinition = {
                                               dataSource: fieldTokens[0].slice(15),
                                               function: func,
                                               field: fieldTokens[1]
                                             };
        return simple;
    }

    private static _getGoogleAnalyticsKPIFromBinExp(binExp: jsep.IBinaryExpression): IKPISimpleDefinition {
        let operator = binExp.operator;
        let value = KPIExpressionHelper._processGoogleAnalyticsExpression(binExp.right);
        const partialSimple = KPIExpressionHelper._processExpression(binExp.left);

        const result: IKPISimpleDefinition = {
                                               dataSource: partialSimple.dataSource,
                                               function: partialSimple.function,
                                               field: partialSimple.field,
                                               operator: operator,
                                               value: value
                                             };
        return result;
    }

}