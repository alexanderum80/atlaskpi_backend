import { DateRange } from '../../common';
import { IChart, IChartModel, IChartDocument } from './IChart';
import { IMutationResponse, MutationResponse } from '../../';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';
import * as winston from 'winston';


export function resolveKpi(context, kpi, done) {
  if (typeof kpi === 'string') {
    context.model('KPI').findOne({ name: kpi }, function (err, kpi) {
      console.log('kpi found: ' + kpi);
      if (err) return done(err);
      if (!kpi) return done(new Error('Unknown kpi: ' + kpi));
      done(null, kpi);
    });
  }
  else {
    done(null, kpi);
  }
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
    _id: String,
    title: String,
    subtitle: String,
    group: String,
    kpis: [{ type: mongoose.Schema.Types.String, ref: 'KPI' }],
    dataRange: ChartDateRangeSchema,
    frequency: String,
    groupings: [String],
    xFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    yFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    chartDefinition: Schema.Types.Mixed
});

    // ChartSchema.methods.
 ChartSchema.methods.hasKpi = function (kpi, done) {
    let obj = this;
    this.resolveRole(this, kpi, function (err, kpi) {
      if (err) return done(err);
      let hasKpi = false;
       obj.kpis.forEach(function (existing) {
        if ((existing._id && existing._id.equals(kpi._id)) ||
          (existing.toString() === kpi.id)) {
          hasKpi = true;
        }
      });
      done(null, hasKpi);
    });
  };

 ChartSchema.methods.addKpi = function (kpi, done) {
    let obj = this;
    this.resolveKpi(this, kpi, function (err, kpi) {
      if (err) return done(err);
      obj.hasKpi(kpi, function (err, has) {
        if (err) return done(err);
        if (has) return done(null, obj);
        obj.kpis = [kpi._id].concat(obj.kpis);
        obj.save(done);
      });
    });
  };

// TODO: I need to revive this later that is why I did not remove it

  // ChartSchema.statics.
//   ChartSchema.statics.createChart = function(details: IChartDetails): Promise<IMutationResponse> {
//     let that = this;

//     return new Promise<IMutationResponse>((resolve, reject) => {
//         let constraints = {
//             name: { presence: { message: '^cannot be blank' }},
//             frecuency: { presence: { message: '^cannot be blank' }},
//         };

//         let errors = (<any>validate)((<any>details), constraints, {fullMessages: false});
//         if (errors) {
//             resolve(MutationResponse.fromValidationErrors(errors));
//             return;
//         };

//         let newChart = {
//             name: details.name,
//             dataRange: details.dataRange,
//             description: details.description,
//             frequency: details.frequency,
//             group: details.group,
//             kpis: [],
//             format: details.chartFormat
//         };

//         that.create(newChart, (err, chart: IChartDocument) => {
//             if (err) {
//                 reject({ message: 'There was an error creating the chart', error: err });
//                 return;
//             }

//             // adding kpis
//             if (details.kpis && details.kpis.length > 0) {
//                 chart.kpis = null;
//                 details.kpis.forEach((kpi) => {
//                     chart.addKpi(kpi, (err, role) => {
//                         if (err) {
//                             winston.error('Error adding role: ', err);
//                         }
//                     });
//                 });
//             };

//             resolve({ entity: chart });
//         });
//     });
//   };

export function getChartModel(m: mongoose.Connection): IChartModel {
    return <IChartModel>m.model('Chart', ChartSchema, 'charts');
}