import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export interface IChartRunRate {
    name: String;
    description: String;
    chart: String;
    startingFrom: String;
    periodPredict: String;
    title: String;
    frequency: String;
}

export interface IChartRunRateInput {
    name: String;
    description: String;
    chart: String;
    startingFrom: String;
    periodPredict: String;
    title: String;
    frequency: String;
}

export interface IChartRunRateDocument extends IChartRunRate, mongoose.Document {
}


export interface IChartRunRateModel extends mongoose.Model<IChartRunRateDocument> { 
    createNew(chartRunRateInput: IChartRunRateInput): Promise<IChartRunRateDocument>;
    updateChartRunRate(id: string, chartRunRateInput: IChartRunRateInput): Promise<IChartRunRateDocument>;
    listChartsRunRate(): Promise<IChartRunRateDocument[]>;
    deleteChartRunRate(id: string): Promise<IChartRunRateDocument>;
}