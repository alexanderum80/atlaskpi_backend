import { IWidgetModel, IWidgetDocument, IWidgetInput, WidgetTypeMap, WidgetSizeMap, ComparisonDirectionArrowMap } from './IWidget';
import * as mongoose from 'mongoose';
import * as validate from 'validate.js';

const Schema = mongoose.Schema;

const ChartWidgetSchema = {
    chart: {type: String, ref: 'Chart'}
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
        unique: true
    },
    description: String,
    type: { type: String!, enum: Object.keys(WidgetTypeMap) },
    size: { type: String!, enum: Object.keys(WidgetSizeMap) },
    color: String!,
    numericWidgetAttributes: NumericWidgetSchema,
    chartWidgetAttributes: ChartWidgetSchema
});

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

        that.create(input)
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
                console.log(result);
                resolve(result);
                return;
            }

            console.log('error updating widget');
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

export function getWidgetModel(m: mongoose.Connection): IWidgetModel {
    return <IWidgetModel>m.model('Widget', WidgetSchema, 'widgets');
}