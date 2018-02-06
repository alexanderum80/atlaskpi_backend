import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export interface ISelfBoardingWinzard {
    status: String;
    statePoint: String;
}

export interface ISelfBoardingWinzardInput {
    status: String;
    statePoint: String;
}

export interface ISelfBoardingWinzardDocument extends ISelfBoardingWinzard, mongoose.Document {
}


export interface ISelfBoardingWinzardModel extends mongoose.Model<ISelfBoardingWinzardDocument> { 
    createNew(selfBoardingWinzardInput: ISelfBoardingWinzardInput): Promise<ISelfBoardingWinzardDocument>;
    updateSelfBoardingWinzard(id: string, selfBoardingWinzardInput: ISelfBoardingWinzardInput): Promise<ISelfBoardingWinzardDocument>;
    listSelfBoardingWinzard(): Promise<ISelfBoardingWinzardDocument[]>;
    deleteSelfBoardingWinzard(id: string): Promise<ISelfBoardingWinzardDocument>;
}