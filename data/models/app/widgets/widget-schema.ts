import { IWidgetModel, IWidgetDocument } from './IWidget';
import * as mongoose from 'mongoose';

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

export function getWidgetModel(m: mongoose.Connection): IWidgetModel {
    return <IWidgetModel>m.model('Widget', WidgetSchema, 'widgets');
}
