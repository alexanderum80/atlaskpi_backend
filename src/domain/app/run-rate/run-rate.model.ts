import { Address } from '../../common/address.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IChartRunRateDocument, IChartRunRateInput, IChartRunRateModel, IChartRunRate } from './run-rate';


let Schema = mongoose.Schema;

const ChartRunRateSchema = new  Schema({
        name: String,
        description: String,
        chart: String,
        startingFrom: String,
        periodPredict: String,
        title: String,
        frequency: String
    });

ChartRunRateSchema.statics.createNew = function(chartRunRateInput: IChartRunRateInput): Promise<IChartRunRateDocument> {

    const that = this;

    return new Promise<IChartRunRateDocument>((resolve, reject) => {
        if (!chartRunRateInput.name|| !chartRunRateInput.chart || !chartRunRateInput.startingFrom 
            || !chartRunRateInput.periodPredict || !chartRunRateInput.title || !chartRunRateInput.frequency) {
            return reject('Information not valid');
        }

        that.create({
            name: chartRunRateInput.name,
            description: chartRunRateInput.description,
            chart: chartRunRateInput.chart,
            startingFrom: chartRunRateInput.startingFrom,
            periodPredict: chartRunRateInput.periodPredict,
            title: chartRunRateInput.title,
            frequency: chartRunRateInput.frequency
        }).then(runrate => {
            resolve(runrate);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the run rate');
        });
    });
};

ChartRunRateSchema.statics.updateChartRunRate = function(_id: string, chartRunRateInput: IChartRunRateInput): Promise<IChartRunRateDocument> {
    const that = <IChartRunRateModel> this;

    return new Promise<IChartRunRateDocument>((resolve, reject) => {
        if (!chartRunRateInput.name|| !chartRunRateInput.chart || !chartRunRateInput.startingFrom 
            || !chartRunRateInput.periodPredict || !chartRunRateInput.title || !chartRunRateInput.frequency) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
            name: chartRunRateInput.name,
            description: chartRunRateInput.description,
            chart: chartRunRateInput.chart,
            startingFrom: chartRunRateInput.startingFrom,
            periodPredict: chartRunRateInput.periodPredict,
            title: chartRunRateInput.title,
            frequency: chartRunRateInput.frequency
        }).then(runRate => {
            resolve(runRate);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the run rate');
        });
    });
};

ChartRunRateSchema.statics.deleteChartRunRate = function(_id: string): Promise<IChartRunRateDocument> {
    const that = <IChartRunRateModel> this;

    return new Promise<IChartRunRateDocument>((resolve, reject) => {
        that.findByIdAndRemove (_id).then(runRate => {
                resolve(runRate);
            }).catch(err => {
                logger.error(err);
                reject('There was an error removing the run rate');
            });
    });
};

ChartRunRateSchema.statics.ListChartsRunRateQuery = function(): Promise<IChartRunRateDocument[]> {
    const that = <IChartRunRateModel> this;

    return new Promise<IChartRunRateDocument[]>((resolve, reject) => {
        that.find({}).then(runRate => {
            resolve(runRate);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving run rate');
        });
    });
};

ChartRunRateSchema.statics.chartRunRateById = function(id: string): Promise<IChartRunRateDocument> {
    const that = <IChartRunRateModel> this;

    return new Promise<IChartRunRateDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(runRate => {
            resolve(runRate);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving run rate');
        });
    });
};

@injectable()
export class ChartRunRates extends ModelBase < IChartRunRateModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'ChartRunRates', ChartRunRateSchema ,'chartRunRate');
    }
}


