import { IDocumentExist, KPITypeEnum } from './kpi';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import mongoose = require('mongoose');
import validate = require('validate.js');

import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IKPI, IKPIDocument, IKPIModel, KPITypeMap } from './kpi';
import { KPIExpressionHelper } from './kpi-expression.helper';
import { KPIFilterHelper } from './kpi-filter.helper';
import { IMutationResponse, MutationResponse } from '../../../framework/mutations/mutation-response';
import { Paginator, IPaginationDetails, IPagedQueryResult } from '../../../framework/queries/pagination';
import { tagsPlugin } from '../tags/tag.plugin';

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
    name: { type: String, unique: true, required: true },
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
    type: { type: String, required: true },
});

// add tags capabilities
KPISchema.plugin(tagsPlugin);

// KPISchema.pre('save', function(done) {
//     console.log('******** pre save **********');
//     done();
// });

// KPISchema.pre('save', function(done) {
//     console.log('pre save kpi');
//     done();
// });

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

        let kpiType = KPITypeMap[input.type];

        if (kpiType === KPITypeEnum.Simple || KPITypeEnum.ExternalSource) {
            input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);
        }

        if (input.filter) {
            input.filter = KPIFilterHelper.ComposeFilter(kpiType, input.filter);
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
        // let constraints = {
        //     name: { presence: { message: '^cannot be blank' }},
        //     expression: { presence: { message: '^cannot be blank' } },
        //     type: { presence: { message: '^cannot be blank' } }
        // };

        // let errors = (<any>validate)((<any>input), constraints, {fullMessages: false});
        // if (errors) {
        //     reject(errors);
        //     return;
        // }

        input.code = input.name;
        let kpiType = KPITypeMap[input.type];
        input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);
        input.filter = KPIFilterHelper.ComposeFilter(kpiType, input.filter);

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
        }).catch(err => resolve(err));
    });

};

KPISchema.statics.getAllKPIs = function(details: IPaginationDetails): Promise<IPagedQueryResult<IKPIDocument>> {
    let paginator = new Paginator<IKPIDocument>(this, ['name']);
    return paginator.getPage(details);
};

@injectable()
export class KPIs extends ModelBase<IKPIModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'KPI', KPISchema, 'kpis');
    }
}

