import { searchPlugin } from '../global-search/global-search.plugin';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as validate from 'validate.js';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import {
    ComparisonDirectionArrowMap,
    IWidgetDocument,
    IWidgetInput,
    IWidgetModel,
    WidgetSizeMap,
    WidgetTypeMap,
    getComparisonDirectionArrow,
    ComparisonDirectionArrowEnum,
} from './widget';
import { tagsPlugin } from '../tags/tag.plugin';

const Schema = mongoose.Schema;

const ChartWidgetSchema = {
    chart: { type: String, ref: 'Chart' }
};

const ChartDateRangeSchema = {
    predefined: String,
    custom: {
        from: Date,
        to: Date,
    }
};

const NumericWidgetSchema = {
    kpi: String!,
    dateRange: ChartDateRangeSchema!,
    comparison: [String],
    comparisonArrowDirection: { type: String, enum: Object.keys(ComparisonDirectionArrowMap) },
    trending: String,
    format: String,
};

const WidgetSchema = new Schema({
    order: Number!,
    name: {
        type: String!,
        unique: true,
        required: true
    },
    description: String,
    type: { type: String!, enum: Object.keys(WidgetTypeMap) },
    size: { type: String!, enum: Object.keys(WidgetSizeMap) },
    color: String!,
    fontColor: String!,
    numericWidgetAttributes: NumericWidgetSchema,
    chartWidgetAttributes: ChartWidgetSchema,
    tags: String,
    // add-created-update
    createdBy: String,
    updatedBy: String,
    createdDate: Date,
    updatedDate: Date
});

// add tags capabilities
WidgetSchema.plugin(tagsPlugin);
WidgetSchema.plugin(searchPlugin);

WidgetSchema.statics.listWidgets = function(): Promise<IWidgetDocument[]> {
    const that = this;

    return new Promise<IWidgetDocument[]>((resolve, reject) => {
        that.find()
            .then(docs => resolve(docs))
            .catch(err => reject(err));
    });
};

WidgetSchema.statics.createWidget = function(input: IWidgetInput): Promise<IWidgetDocument> {
    const that = this;

    return new Promise<IWidgetDocument>((resolve, reject) => {
        const requiredAndNotBlank =  { presence: { message: '^cannot be blank' } };

        const constraints = {
            order:  requiredAndNotBlank,
            name: requiredAndNotBlank,
            type: requiredAndNotBlank,
            size: requiredAndNotBlank,
            color: requiredAndNotBlank,
            fontColor: requiredAndNotBlank
        };

        const errors = (<any>validate)(input, constraints, { fullMessages: false });

        if (errors) {
            reject(errors);
            return;
        }

        if (input.chartWidgetAttributes) {
            // validate chart attributes
            const chartAttributesConstraints = { chart: requiredAndNotBlank };
            const errors = (<any>validate)(input.chartWidgetAttributes, chartAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

        if (input.numericWidgetAttributes) {
            // validate chart attributes
            const numericAttributesConstraints = {
                kpi: requiredAndNotBlank,
                dateRange: requiredAndNotBlank,
            };

            const errors = (<any>validate)(input.numericWidgetAttributes, numericAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

        console.dir(input);

        const newWidget = {
            order: input.order,
            name: input.name,
            description: input.description,
            type: input.type,
            size: input.size,
            color: input.color,
            fontColor: input.fontColor,
            preview: input.preview,
            tags: input.tags,
            //add-created-update-by-date
            createdBy: input.createdBy,
            createdDate: input.createdDate,
            updatedBy: input.updatedBy,
            updatedDate: input.updatedDate
        };

        switch (input.type) {
            case 'numeric':
                if (input.numericWidgetAttributes.comparisonArrowDirection === '') {
                    input.numericWidgetAttributes.comparisonArrowDirection = getComparisonDirectionArrow(ComparisonDirectionArrowEnum.Undefined);
                }
                newWidget['numericWidgetAttributes'] = input.numericWidgetAttributes;
                break;
            case 'chart':
                newWidget['chartWidgetAttributes'] = input.chartWidgetAttributes;
                break;
        }

        that.create(newWidget)
            .then(widgetDocument => resolve(widgetDocument))
            .catch(err => reject(err));
    });
};

WidgetSchema.statics.updateWidget = function(id: string, input: IWidgetInput): Promise<IWidgetDocument> {
    const that = this;

    return new Promise<IWidgetDocument>((resolve, reject) => {
        if (!id ) {
            Promise.reject({ message: 'There was an error updating the widget' });
            return;
        }

        const requiredAndNotBlank =  { presence: { message: '^cannot be blank' } };

        const constraints = {
            order:  requiredAndNotBlank,
            name: requiredAndNotBlank,
            type: requiredAndNotBlank,
            size: requiredAndNotBlank,
            color: requiredAndNotBlank,
            fontColor: requiredAndNotBlank
        };

        const errors = (<any>validate)(input, constraints, { fullMessages: false });

        if (errors) {
            reject(errors);
            return;
        }

        if (input.chartWidgetAttributes) {
            // validate chart attributes
            const chartAttributesConstraints = { chart: requiredAndNotBlank };
            const errors = (<any>validate)(input.chartWidgetAttributes, chartAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

        if (input.numericWidgetAttributes) {
            // validate chart attributes
            const numericAttributesConstraints = {
                kpi: requiredAndNotBlank,
                dateRange: requiredAndNotBlank,
            };

            const errors = (<any>validate)(input.numericWidgetAttributes, numericAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

        console.dir(input);

        that.findByIdAndUpdate({_id: id}, input, { upsert: false, new: true }, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }

            if (result) {
                resolve(result);
                return;
            }

            reject('There was an error updating the widget');
        });
    });
};

WidgetSchema.statics.removeWidget = function(id: string): Promise<IWidgetDocument> {
    const that = this;

    return new Promise<IWidgetDocument>((resolve, reject) => {
        if (!id ) {
            Promise.reject({ message: 'There was an error removing the widget' });
            return;
        }

        that.findOne({ _id: id })
        .then((widget) => {
            if (!widget) {
                reject('Widget not found');
                return;
            }

            widget.remove((err, deleted) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(widget);
                return;
            });
        });
    });
};

// INDEXES

// WidgetSchema.index({ 'name': 1 });

@injectable()
export class Widgets extends ModelBase<IWidgetModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Widget', WidgetSchema, 'widgets');
    }
}
