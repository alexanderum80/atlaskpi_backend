import { IWidgetModel, IWidgetDocument, IWidgetInput } from './IWidget';
import * as mongoose from 'mongoose';
import * as validate from 'validate.js';

const Schema = mongoose.Schema;

const ChartWidgetSchema = {
    chart: String!
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
    bestValue: String,
    trending: String
};

const WidgetSchema = new Schema({
    order: Number!,
    name: String!,
    description: String,
    type: String!,
    size: String!,
    color: String!,
    format: String,
    chartAttributes: ChartWidgetSchema,
    numericAttributes: NumericWidgetSchema
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

        if (input.chartAttributes) {
            // validate chart attributes
            const chartAttributesConstraints = { chart: requiredAndNotBlank };
            const errors = (<any>validate)(input.chartAttributes, chartAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

        if (input.numericAttributes) {
            // validate chart attributes
            const numericAttributesConstraints = {
                kpi: requiredAndNotBlank,
                dateRange: requiredAndNotBlank,
            };

            const errors = (<any>validate)(input.numericAttributes, numericAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

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

        if (input.chartAttributes) {
            // validate chart attributes
            const chartAttributesConstraints = { chart: requiredAndNotBlank };
            const errors = (<any>validate)(input.chartAttributes, chartAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

        if (input.numericAttributes) {
            // validate chart attributes
            const numericAttributesConstraints = {
                kpi: requiredAndNotBlank,
                dateRange: requiredAndNotBlank,
            };

            const errors = (<any>validate)(input.numericAttributes, numericAttributesConstraints, { fullMessages: false });

            if (errors) {
                reject(errors);
                return;
            }
        }

        that.findOneAndUpdate({_id: id}, input, { new: true })
            .exec()
            .then(widgetDocument => resolve(widgetDocument))
            .catch(err => reject(err));
    });
};

export function getWidgetModel(m: mongoose.Connection): IWidgetModel {
    return <IWidgetModel>m.model('Widget', WidgetSchema, 'widgets');
}
