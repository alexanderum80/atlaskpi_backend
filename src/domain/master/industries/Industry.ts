import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ISubIndustry {
    name: string;
}

export interface IIndustry {
    name: string;
    subIndustries?: ISubIndustry[];
}

export interface IIndustryDocument extends IIndustry, mongoose.Document {
}

export interface IIndustryModel extends mongoose.Model<IIndustryDocument> {
    industries(): Promise<IIndustryDocument[]>;
    findAll(): Promise<IIndustryDocument[]>;
}
