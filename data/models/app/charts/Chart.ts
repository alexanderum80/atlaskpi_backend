import { IDashboardDocument } from '../dashboards';
import { IAppModels } from '../app-models';
import { IKPIDocument } from '../kpis';
import { IChartInput } from './';
import { DateRange } from '../../common';
import { IChart, IChartModel, IChartDocument } from './IChart';
import { IMutationResponse, MutationResponse } from '../../';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';
import * as winston from 'winston';
import * as _ from 'lodash';


let Schema = mongoose.Schema;

const customDateRangeSchema = {
    from: Date,
    to: Date
};

let ChartDateRangeSchema = {
    predefined: String,
    custom: customDateRangeSchema
};

let ChartSchema = new Schema({
    title: String,
    subtitle: String,
    group: String,
    kpis: [{ type: mongoose.Schema.Types.String, ref: 'KPI' }],
    dateRange: [ChartDateRangeSchema],
    filter: Schema.Types.Mixed,
    frequency: String,
    groupings: [String],
    xFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    yFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    chartDefinition: Schema.Types.Mixed,
    xAxisSource: String,
    comparison: [String]
});

    // ChartSchema.methods.

  ChartSchema.statics.createChart = function(input: IChartInput): Promise<IChartDocument> {
    const that = this;

    return new Promise<IChartDocument>((resolve, reject) => {
        const requiredAndNotBlank =  { presence: { message: '^cannot be blank' } };

        let constraints = {
            title:  requiredAndNotBlank,
            kpis: requiredAndNotBlank,
            dateRange: requiredAndNotBlank,
            chartDefinition: requiredAndNotBlank,
        };

        let errors = (<any>validate)((<any>input), constraints, {fullMessages: false});

        if (errors) {
            reject(errors);
            return;
        }

        let newChart = {
            title: input.title,
            subtitle: input.subtitle,
            group: input.group,
            dateRange: input.dateRange,
            kpis: input.kpis,
            // filter: any;
            frequency: input.frequency,
            groupings: input.groupings[0] ? input.groupings : [],
            xFormat: input.xFormat,
            yFormat: input.yFormat,
            chartDefinition: JSON.parse(input.chartDefinition),
            xAxisSource: input.xAxisSource,
            comparison: input.comparison
        };

        that.create(newChart)
        .then((chart) => resolve(chart))
        .catch((err) => reject(err));
    });
  };


  ChartSchema.statics.updateChart = function(id: string, input: IChartInput): Promise<IChartDocument> {
     const that = this;

     return new Promise<IChartDocument>((resolve, reject) => {
        if (!id ) {
          return Promise.reject({ message: 'There was an error updating the user' });
        }

        const requiredAndNotBlank =  { presence: { message: '^cannot be blank' } };

        let constraints = {
            title:  requiredAndNotBlank,
            kpis: requiredAndNotBlank,
            dateRange: requiredAndNotBlank,
            chartDefinition: requiredAndNotBlank,
        };

        let errors = (<any>validate)((<any>input), constraints, {fullMessages: false});

        if (errors) {
           return reject(errors);
        }

        const updatedChart = {
            title: input.title,
            subtitle: input.subtitle,
            group: input.group,
            dateRange: input.dateRange,
            frequency: input.frequency,
            groupings: input.groupings[0] ? input.groupings : [],
            kpis: input.kpis,
            xFormat: input.xFormat,
            yFormat: input.yFormat,
            chartDefinition: JSON.parse(input.chartDefinition),
            xAxisSource: input.xAxisSource,
            comparison: input.comparison
        };

        that.findOneAndUpdate({_id: id}, updatedChart, { new: true })
        .exec()
        .then((chart) => resolve(chart))
        .catch((err) => reject(err));
     });
  };

export function getChartModel(m: mongoose.Connection): IChartModel {
    return <IChartModel>m.model('Chart', ChartSchema, 'charts');
}

