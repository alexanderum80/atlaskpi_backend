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

function resolveDashboard(context, dashboard: any): Promise<IDashboardDocument> {
  if (typeof dashboard !== 'string') {
    let err = 'dashboard should be specified as string';
    return Promise.reject(err);
  }

  return new Promise<IDashboardDocument>((resolve, reject) => {
    context.model('Dashboard').findOne({ _id: dashboard }, (err, doc) => {
      if (err) {
        console.log('error resolving dashboard: ' + dashboard);
        return reject(err);
      }

      if (!doc) {
        console.log('dashboard not found: ' + dashboard);
        return resolve(doc);
      }

      console.log('dashboard found: ' + doc);
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

  ChartSchema.methods.detachFromAllDashboards = function(): Promise<boolean> {
    const that = this;
    return new Promise<boolean>((resolve, reject) => {
      this.model('Dashboard')
        .find()
        .populate('charts')
        .then((dashboards: IDashboardDocument[]) => {
          if (!dashboards) {
            console.log('no dashboards found');
            return resolve(true);
          }

          let detached = false;

          dashboards.forEach(dashboard => {
            dashboard.removeChart(that._id, (err, dashboard) => {
              if (!err && dashboard) {
                detached = true;
              }
            });
          });
          if (detached) {
              return Promise.resolve(true);
          } else {
              return Promise.resolve(false);
          }
      });
    });
  };

  ChartSchema.methods.attachToDashboard = function (dashboard: string): Promise<IChartDocument> {
    const model = this;
    return new Promise<IChartDocument>((resolve, reject) => {
      resolveDashboard(model, dashboard).then((doc: IDashboardDocument) => {
        if (!doc) {
          return resolve(null);
        }

        doc.addChart(model._id, (err, chart) => {
          if (err) {
            let error = 'chart already exist on the dashboard';
            console.log(error);
            return reject(error);
          }
          return resolve(chart);
        });
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
            let promises = [];
            input.kpis.forEach(k => {
              promises.push(chart.addKpi(k));
            });

            if (input.dashboard) {
                promises.push(chart.attachToDashboard(input.dashboard));
            }

            Promise.all(promises).then(() => {
                 return chart.save().then(() => resolve({ success: true, entity: chart }));
            })
            .catch(err => reject(err));
        });
    });
  };

  ChartSchema.statics.deleteChart = function(id: string): Promise<IMutationResponse> {
    const that = this;

    return new Promise<IMutationResponse>((resolve, reject) => {
        if (!id ) {
          return Promise.reject({ message: 'There was an error updating the user' });
        }

        return that.findOne({ _id: id}, (err, chart: IChartDocument) => {
            if (err) {
                const errResponse: IMutationResponse = {
                  success: false,
                  errors: [ { field: 'id', errors: ['There was an error deleting the chart']}]
              };

              return resolve(errResponse);
            }

             chart.detachFromAllDashboards().then(() => {
              return chart.remove().then(() => resolve({ success: true }));
            });
          });
        });
  };

  ChartSchema.statics.updateChart = function(id: string, input: IChartInput): Promise<IMutationResponse> {
     const that = this;

     return new Promise<IMutationResponse>((resolve, reject) => {
        if (!id ) {
          return Promise.reject({ message: 'There was an error updating the user' });
        }

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

        const updatedChart = {
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

        that.findByIdAndUpdate(id, updatedChart, (err, entity) => {
            if (err) {
                const errResponse: IMutationResponse = {
                  success: false,
                  errors: [ { field: 'id', errors: ['There was an error updating the chart']}]
                };

                return resolve(errResponse);
            }

            return resolve({ success: true, entity: entity });
          });
        });
  };

export function getChartModel(m: mongoose.Connection): IChartModel {
    return <IChartModel>m.model('Chart', ChartSchema, 'charts');
}

