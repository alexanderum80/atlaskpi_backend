import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as validate from 'validate.js';

import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IChartDocument, IChartInput, IChartModel } from './chart';
import { tagsPlugin } from '../tags/tag.plugin';
import { ChartType } from '../../../app_modules/charts/queries/charts/chart-type';

let Schema = mongoose.Schema;

const customDateRangeSchema = {
    from: Date,
    to: Date
};

let ChartDateRangeSchema = {
    predefined: String,
    custom: customDateRangeSchema
};

const TopSchema = {
    predefined: String,
    custom: Number
};

let ChartSchema = new Schema({
    title: { type: String, unique: true, required: true },
    subtitle: String,
    group: String,
    kpis: [{
        type: mongoose.Schema.Types.String,
        ref: 'KPI',
        required: true
    }],
    dateRange: [ChartDateRangeSchema],
    filter: Schema.Types.Mixed,
    frequency: String,
    groupings: [String],
    sortingCriteria: String,
    sortingOrder: String,
    xFormat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChartFormat'
    },
    yFormat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChartFormat'
    },
    chartDefinition: { type: Schema.Types.Mixed, required: true },
    xAxisSource: String,
    comparison: [String],
    top: TopSchema
});

// add tags capabilities
ChartSchema.plugin(tagsPlugin);

ChartSchema.methods.isStacked = function(): boolean {
    return ((this.chartDefinition.chart.type === ChartType.Column) &&
        Array.isArray(this.groupings) &&
        this.xAxisSource && (this.groupings[0] === this.xAxisSource)) ||
        (Array.isArray(this.groupings) &&
        this.groupings.length && !this.frequency && !this.xAxisSource);
}

ChartSchema.statics.createChart = function(input: IChartInput): Promise < IChartDocument > {
    const that = this;

    return new Promise < IChartDocument > ((resolve, reject) => {
        const requiredAndNotBlank = {
            presence: {
                message: '^cannot be blank'
            }
        };

        let constraints = {
            title: requiredAndNotBlank,
            kpis: requiredAndNotBlank,
            dateRange: requiredAndNotBlank,
            chartDefinition: requiredAndNotBlank,
        };

        let errors = ( < any > validate)(( < any > input), constraints, {
            fullMessages: false
        });

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
            groupings: input.groupings,
            sortingCriteria: input.sortingCriteria,
            sortingOrder: input.sortingOrder,
            xFormat: input.xFormat,
            yFormat: input.yFormat,
            chartDefinition: JSON.parse(input.chartDefinition),
            xAxisSource: input.xAxisSource,
            comparison: input.comparison,
            top: input.top
        };

        that.create(newChart)
            .then((chart) => resolve(chart))
            .catch((err) => reject(err));
    });
};


ChartSchema.statics.updateChart = function(id: string, input: IChartInput): Promise < IChartDocument > {
    const that = this;

    return new Promise < IChartDocument > ((resolve, reject) => {
        if (!id) {
            return Promise.reject({
                message: 'There was an error updating the user'
            });
        }

        const requiredAndNotBlank = {
            presence: {
                message: '^cannot be blank'
            }
        };

        let constraints = {
            title: requiredAndNotBlank,
            kpis: requiredAndNotBlank,
            dateRange: requiredAndNotBlank,
            chartDefinition: requiredAndNotBlank,
        };

        let errors = ( < any > validate)(( < any > input), constraints, {
            fullMessages: false
        });

        if (errors) {
            return reject(errors);
        }

        const updatedChart = {
            title: input.title,
            subtitle: input.subtitle,
            group: input.group,
            dateRange: input.dateRange,
            frequency: input.frequency,
            groupings: input.groupings,
            sortingCriteria: input.sortingCriteria,
            sortingOrder: input.sortingOrder,
            kpis: input.kpis,
            xFormat: input.xFormat,
            yFormat: input.yFormat,
            chartDefinition: JSON.parse(input.chartDefinition),
            xAxisSource: input.xAxisSource,
            comparison: input.comparison,
            top: input.top
        };

        that.findOneAndUpdate({
                _id: id
            }, updatedChart, {
                new: true
            })
            .exec()
            .then((chart) => resolve(chart))
            .catch((err) => reject(err));
    });
};

@injectable()
export class Charts extends ModelBase < IChartModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Chart', ChartSchema, 'charts');
    }
}