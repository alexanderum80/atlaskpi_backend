import { KPIFilterHelper } from './kpi-filter.helper';
import { KPITypeMap } from './IKPI';
import { KPIExpressionHelper } from './kpi-expression.helper';
import { IPagedQueryResult, PaginationDetailsDefault, Paginator } from '../../common/pagination';
import {
    IMutationResponse,
    IPaginationDetails,
    IPaginationInfo,
    IQueryResponse,
    MutationResponse
} from '../../common';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import validate = require('validate.js');
// import validate from 'validate.js';
import { IKPI, IKPIDocument, IKPIModel } from '.';
import { IChartDocument } from '../charts';
import { isObject, isEmpty } from 'lodash';


let Schema = mongoose.Schema;

let ChartDateRangeSchema = {
    predefined: String,
    custom: {
        from: Date,
        to: Date,
    }
};

let KPISchema = new Schema({
    code: String,
    name: String!,
    baseKpi: String,
    description: String,
    group: String,
    groupings: [String],
    dateRange: ChartDateRangeSchema,
    filter: Schema.Types.Mixed,
    frequency: String,
    axisSelection: String,
    emptyValueReplacement: String,
    expression: String,
    type: String,
});

function hasCriteria(filter: any) {
    for (const i in filter) {
        if (!isObject(filter[i])) {
            return filter[i];
        }
        return hasCriteria(filter[i]);
    }
}

KPISchema.statics.createKPI = function(input: IKPI): Promise<IKPIDocument> {
    const that = this;

    return new Promise<IKPIDocument>((resolve, reject) => {
        let constraints = {
            name: { presence: { message: '^cannot be blank' }},
            expression: { presence: { message: '^cannot be blank' } },
            type: { presence: { message: '^cannot be blank' } }
        };

        let errors = (<any>validate)((<any>input), constraints, {fullMessages: false});
        if (errors) {
            reject(errors);
            return;
        }

        const data = (typeof input.filter === 'string') ? JSON.parse(input.filter) : JSON.parse(JSON.stringify(input.filter));
        const isRegex = data.find(d => d.operator === 'regex');

        input.code = input.name;
        let kpiType = KPITypeMap[input.type];
        input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);
        input.filter = KPIFilterHelper.ComposeFilter(kpiType, input.filter);

        if (isRegex && !hasCriteria(input.filter)) {
            reject({ message: 'Invalid regex expression', error: 'invalid regex expression'});
            return;
        }

        that.create(input, (err, kpi: IKPIDocument) => {
            if (err) {
                reject({ message: 'There was an error creating the kpi', error: err });
                return;
            }
            resolve(kpi);
        });
    });
};


KPISchema.statics.updateKPI = function(id: string, input: IKPI): Promise<IKPIDocument> {
    const that = this;

    return new Promise<IKPIDocument>((resolve, reject) => {
        let constraints = {
            name: { presence: { message: '^cannot be blank' }},
            expression: { presence: { message: '^cannot be blank' } },
            type: { presence: { message: '^cannot be blank' } }
        };

        let errors = (<any>validate)((<any>input), constraints, {fullMessages: false});
        if (errors) {
            reject(errors);
            return;
        }

        const data = (typeof input.filter === 'string') ? JSON.parse(input.filter) : JSON.parse(JSON.stringify(input.filter));
        const isRegex = data.find(d => d.operator === 'regex');

        input.code = input.name;
        let kpiType = KPITypeMap[input.type];
        input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);
        input.filter = KPIFilterHelper.ComposeFilter(kpiType, input.filter);

        if (isRegex && !hasCriteria(input.filter)) {
            reject({ message: 'Invalid regex expression', error: 'invalid regex expression'});
            return;
        }

        that.findOneAndUpdate({_id: id}, input, {new: true })
        .exec()
        .then((kpiDocument) => resolve(kpiDocument))
        .catch((err) => reject(err));
    });
};

KPISchema.statics.removeKPI = function(id: string, chartExist?: IChartDocument[]): Promise<IMutationResponse> {
    let that = this;

    let document: IKPIDocument;
    let promises = [];

    return new Promise<IMutationResponse>((resolve, reject) => {

        let idError = (<any>validate)({ id: id },
         { id: { presence: { message: '^cannot be blank' } } });

        if (idError) {
            resolve(MutationResponse.fromValidationErrors(idError));
        }

        if (chartExist && chartExist.length) {
            reject({ success: false, entity: chartExist, errors: [ { field: 'kpis', errors: ['KPIs is being used by '] } ] });
            return;
        }

        (<IKPIModel>this).findById(id).then((kpi) => {
            let constraints = {
                document: { presence: { message: '^not found' }}
            };

            let errors = (<any>validate)({id: id, document: kpi}, constraints, {fullMessages: false});
            if (errors) {
                resolve(MutationResponse.fromValidationErrors(errors));
            }

            let deletedKPI = kpi;

            kpi.remove( (err, kpi: IKPI) => {
                if (err) {
                    reject({ message: 'There was an error removing the kpi', error: err });
                    return;
                }
                resolve({ entity: deletedKPI });
            });
        }).catch(err => resolve(err));
    });

};

KPISchema.statics.getAllKPIs = function(details: IPaginationDetails): Promise<IPagedQueryResult<IKPIDocument>> {
    let paginator = new Paginator<IKPIDocument>(this, ['name']);
    return paginator.getPage(details);
};

export function getKPIModel(m: mongoose.Connection): IKPIModel {
    return <IKPIModel>m.model('KPI', KPISchema, 'kpis');
}
