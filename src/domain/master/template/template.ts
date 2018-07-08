import mongoose = require('mongoose');

export interface ITemplate {
    name: string;
    type: string;
    content: { [name: string]: string };
}

// declare interface to mix account and mongo docuemnt properties/methods
export interface ITemplateDocument extends ITemplate, mongoose.Document {
}

export interface ITemplateModel extends mongoose.Model<ITemplateDocument> {
}

