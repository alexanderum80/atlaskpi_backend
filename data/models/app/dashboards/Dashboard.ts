import { IDashboardModel } from './IDashboard';
import { IChartDocument } from '../charts';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

function resolveChart(context, chartId, done) {
  if (typeof chartId === 'string') {
    context.model('Chart').findOne({ _id: chartId }, function (err, chart) {
      console.log('chart found: ' + chart);
      if (err) return done(err);
      if (!chart) return done(new Error('Unknown chart: ' + chartId));
      done(null, chart);
    });
  }
  else {
    done(null, chartId);
  }
}

let Schema = mongoose.Schema;

let DashboardSchema = new Schema({
    name: String,
    group: String,
    charts: [{ type: Schema.Types.String, ref: 'Chart' }]
});

// DashboardSchema.methods.

DashboardSchema.methods.hasChart = function (chartId, done) {
    const obj = this;
    resolveChart(this, chartId, function (err, chart) {
      if (err) return done(err);
      let hasChart = false;
      obj.charts.forEach(c => {
        if ((c && c._id !== undefined && c._id === chartId) ||
            String(c) === String(chartId)) {
           hasChart = true;
        }
      });
    done(null, hasChart);
  });
};

DashboardSchema.methods.addChart = function (chartId, done) {
    const obj = this;
    resolveChart(this, chartId, function (err, chart) {
      if (err) return done(err);
      obj.hasChart(chart, function (err, has) {
        if (err) return done(err);
        if (has) return done(null, obj);
        obj.charts.push(chart);
        obj.save(function (err, obj) {
          done(err, obj);
        });
      });
  });
};

DashboardSchema.methods.removeChart = function (chartId, done) {
    const obj = this;
    obj.hasChart(chartId, function (err, has) {
      if (err) return done(err);
      if (!has) return done(null);
      obj.charts.pull(chartId);
      obj.save(function (err, obj) {
        done(err, obj);
      });
    });
};

// DashboardSchema.statics.

export function getDashboardModel(m: mongoose.Connection): IDashboardModel {
    return <IDashboardModel>m.model('Dashboard', DashboardSchema, 'dashboards');
}