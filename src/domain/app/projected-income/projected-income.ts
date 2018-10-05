import * as mongoose from 'mongoose';

export interface IProjectedIncomeDocument extends mongoose.Document { }

export interface IProjectedIncomeModel extends mongoose.Model<IProjectedIncomeDocument> { }