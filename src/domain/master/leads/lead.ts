import mongoose = require('mongoose');


export interface ILead {
    company: string;
    email: string;
    fullName: string;
}

// declare interface to mix account and mongo docuemnt properties/methods
export interface ILeadDocument extends ILead, mongoose.Document {
}

export interface ILeadModel extends mongoose.Model<ILeadDocument> {
}
