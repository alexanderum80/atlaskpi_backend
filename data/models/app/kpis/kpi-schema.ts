import { KPITypeTable } from './IKPI';
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
        input.code = input.name;
        let kpiType = KPITypeTable[input.type];
        input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);

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

        input.code = input.name;
        let kpiType = KPITypeTable[input.type];
        input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);

        if (input.filter) {}

        that.findOneAndUpdate({_id: id}, input, {new: true })
        .exec()
        .then((kpiDocument) => resolve(kpiDocument))
        .catch((err) => reject(err));
    });
};

KPISchema.statics.removeKPI = function(id: string): Promise<IMutationResponse> {
    let that = this;

    let document: IKPIDocument;
    let promises = [];

    return new Promise<IMutationResponse>((resolve, reject) => {

        let idError = (<any>validate)({ id: id },
         { id: { presence: { message: '^cannot be blank' } } });

        if (idError) {
            resolve(MutationResponse.fromValidationErrors(idError));
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
        });
    });

};

KPISchema.statics.getAllKPIs = function(details: IPaginationDetails): Promise<IPagedQueryResult<IKPIDocument>> {
    let paginator = new Paginator<IKPIDocument>(this, ['name']);
    return paginator.getPage(details);
};

export function getKPIModel(m: mongoose.Connection): IKPIModel {
    return <IKPIModel>m.model('KPI', KPISchema, 'kpis');
}
