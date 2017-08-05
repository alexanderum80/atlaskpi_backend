import { IDashboardModel } from './IDashboard';
import { IChartDocument } from '../charts';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';


function resolveChart(context, chartId: any): Promise<IChartDocument> {
  if (typeof chartId !== 'string') {
    let err = 'chart should be specified as string';
    return Promise.reject(err);
  }

  return new Promise<IChartDocument>((resolve, reject) => {
    context.model('Chart').findOne({ _id: chartId }, (err, doc) => {
      if (err) {
        console.log('error resolving chart: ' + chartId);
        return reject(err);
      }

      if (!doc) {
        console.log('chart not found: ' + chartId);
        return resolve(doc);
      }

      console.log('chart found: ' + doc);
      resolve(doc);
    });
  });
}

let Schema = mongoose.Schema;

let DashboardSchema = new Schema({
    name: String,
    group: String,
    charts: [{ type: Schema.Types.String, ref: 'Chart' }]
});

// DashboardSchema.methods.

DashboardSchema.methods.hasChart = function(chart: any): boolean {
    this.charts.forEach((c: IChartDocument) => {
      if ((chart instanceof String && c._id === chart) ||
          (chart instanceof Object && c._id === chart._id)) {
          return true;
      }
    });
    return false;
  };

DashboardSchema.methods.addChart = function (chartId: string): Promise<IChartDocument> {
    const model = this;
    return new Promise<IChartDocument>((resolve, reject) => {
      resolveChart(model, chartId).then(doc => {
        if (!doc) {
          return resolve(doc);
        }

        if (model.hasChart(doc)) {
          let err = 'chart already exist on the dashboard';
          console.log(err);
          return reject(err);
        }

        model.charts.push(doc._id);
        return resolve(doc);
      })
      .catch(err => reject(err));
    });
 };

DashboardSchema.methods.removeChart = function(chartId: string): Promise<boolean> {
    const model = this;
    return new Promise<boolean>((resolve, reject) => {
      resolveChart(model, chartId).then(doc => {
        if (!doc) {
          return resolve(false);
        }

        if (model.hasChart(doc)) {
          model.charts.pull(doc._id);
          model.save();
          return resolve(true);
        } else {
          const err = 'chart not found on dashbaord';
          return reject(err);
        }
      })
      .catch(err => reject(err));
    });
};

// DashboardSchema.statics.

export function getDashboardModel(m: mongoose.Connection): IDashboardModel {
    return <IDashboardModel>m.model('Dashboard', DashboardSchema, 'dashboards');
}