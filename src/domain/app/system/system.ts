import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export interface ISystem {
    section: String;
    system: String;
    image: String;
}

export interface ISystemInput {
    section: String;
    system: String;
    image: String;
}

export interface ISystemDocument extends ISystem, mongoose.Document {
}


export interface ISystemModel extends mongoose.Model<ISystemDocument> { 
    createNew(systemInput: ISystemInput): Promise<ISystemDocument>;
    updateSystem(id: string, systemInput: ISystemInput): Promise<ISystemDocument>;
    listSystem(): Promise<ISystemDocument[]>;
    deleteSystem(id: string): Promise<ISystemDocument>;
}