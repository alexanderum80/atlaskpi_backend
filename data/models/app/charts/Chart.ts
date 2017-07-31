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


export function resolveKpi(context, kpi: string): Promise<IKPIDocument> {
  if (typeof kpi !== 'string') {
    let err = 'kpi should be specified as string';
    return Promise.reject(err);
  }

  return new Promise<IKPIDocument>((resolve, reject) => {
    context.model('KPI').findOne({ _id: kpi }, (err, doc) => {
      if (err) {
        console.log('error resolving kpi: ' + kpi);
        return reject(err);
      }

      if (!doc) {
        console.log('kpi not found: ' + kpi);
        return resolve(doc);
      }

      console.log('kpi found: ' + doc);
      resolve(doc);
    });
  });
}

let Schema = mongoose.Schema;

let ChartDateRangeSchema = new Schema({
    predefined: String,
    custom: {
        from: Date,
        to: Date,
    }
});


let ChartSchema = new Schema({
    title: String,
    subtitle: String,
    group: String,
    kpis: [{ type: mongoose.Schema.Types.String, ref: 'KPI' }],
    dateRange: ChartDateRangeSchema,
    filter: Schema.Types.Mixed,
    frequency: String,
    groupings: [String],
    xFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    yFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    chartDefinition: Schema.Types.Mixed,
    xAxisSource: String,
});

    // ChartSchema.methods.

 ChartSchema.methods.hasKpi = function(kpi: any): boolean {
    this.kpis.forEach((k: IKPIDocument) => {
      if ((kpi instanceof String && k._id === kpi) ||
          (kpi instanceof Object && kpi._id === k._id)) {
          return true;
      }
    });
    return false;
  };

 ChartSchema.methods.addKpi = function (kpi: string): Promise<IKPIDocument> {
    const model = this;
    return new Promise<IKPIDocument>((resolve, reject) => {
      resolveKpi(model, kpi).then(doc => {
        if (!doc) {
          return resolve(doc);
        }
        if (model.hasKpi(doc)) {
          let err = 'kpi already exist on the chart';
          console.log(err);
          return reject(err);
        }

        model.kpis.push(doc._id);
        return resolve(doc);
      })
      .catch(err => reject(err));
    });
  };

  ChartSchema.statics.createChart = function(input: IChartInput): Promise<IMutationResponse> {
    const that = this;

    return new Promise<IMutationResponse>((resolve, reject) => {
        const requiredAndNotBlank =  { presence: { message: '^cannot be blank' } };

        let constraints = {
            title:  requiredAndNotBlank,
            kpis: requiredAndNotBlank,
            dateRange: requiredAndNotBlank,
            chartDefinition: requiredAndNotBlank,
            xAxisSource: requiredAndNotBlank
        };

        let errors = (<any>validate)((<any>input), constraints, {fullMessages: false});

        // validate if kpi exists before saving the model
        input.kpis.forEach(k => {
          resolveKpi(this, k).then(kpi => {
              if (!kpi) {
                return resolve({  success: false, errors: [ { field: 'kpis', errors: ['kpi not found'] } ]});
              }
          })
          .catch(err => { return resolve({  success: false, errors: [ { field: 'kpis', errors: ['kpi not found'] } ]}); } );
         });

         if (errors) {
            resolve(MutationResponse.fromValidationErrors(errors));
            return;
        }

        let newChart = {
            title: input.title,
            subtitle: input.subtitle,
            group: input.group,
            dateRange: input.dateRange,
            // filter: any;
            frequency: input.frequency,
            groupings: input.groupings,
            xFormat: input.xFormat,
            yFormat: input.yFormat,
            chartDefinition: JSON.parse(input.chartDefinition),
            xAxisSource: input.xAxisSource
        };

        that.create(newChart, (err, chart: IChartDocument) => {
            if (err) {
                reject({ message: 'There was an error creating the chart', error: err });
                return;
            }

            // adding kpis
            let kpiPromises = [];
            input.kpis.forEach(k => {
              kpiPromises.push(chart.addKpi(k));
            });

            Promise.all(kpiPromises).then(kpis => {
              chart.save();
              return resolve({ success: true, entity: chart });
            });
        });
    });
  };

  ChartSchema.statics.deleteChart = function(id: string): Promise<IMutationResponse> {
    const that = this;

    return new Promise<IMutationResponse>((resolve, reject) => {
        if (!id ) {
          return Promise.reject({ message: 'There was an error updating the user' });
        }

        that.findByIdAndRemove(id, (err, data) => {
            if (err) {
                const errResponse: IMutationResponse = {
                  success: false,
                  errors: [ { field: 'id', errors: ['There was an error deleting the chart']}]
                };

                resolve(errResponse);
                return;
            }

            return resolve({ success: true });
          });
        });
  };

export function getChartModel(m: mongoose.Connection): IChartModel {
    return <IChartModel>m.model('Chart', ChartSchema, 'charts');
}