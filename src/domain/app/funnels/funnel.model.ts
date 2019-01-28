import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import { tagsPlugin } from '../tags/tag.plugin';
import { searchPlugin } from '../global-search/global-search.plugin';
import { IFunnelDocument, IFunnel, IFunnelModel } from './funnel';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';

const customDateRangeSchema = {
    from: Date,
    to: Date
};

const ChartDateRangeSchema = {
    predefined: String,
    custom: customDateRangeSchema
};

const FunnelStageSchema = {
    _id: { type: String, required: true },
    order: Number,
    name: String,
    kpi: String,
    dateRange: ChartDateRangeSchema,
    fieldsToProject: [String],
    compareToStage: String,
    foreground: String,
    background: String,
};

const FunnelSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    stages: [FunnelStageSchema],
    createdBy: String,
    updatedBy: String,
    createdDate: Date,
    updatedDate: Date
});

FunnelSchema.plugin(tagsPlugin);
FunnelSchema.plugin(searchPlugin);

FunnelSchema.statics.createFunnel = async function(input: IFunnel): Promise<IFunnelDocument> {
    const model = (<IFunnelModel>this);

    if (!input)  throw new Error('no input dada provided');

    try {
        const document = await model.create(input);
        return document;
    } catch (err) {
        console.log(err);
        throw new Error('Error creating funnel');
    }
};


FunnelSchema.statics.updateFunnel = async function(id: string, input: IFunnel): Promise<IFunnelDocument> {
    const model = (<IFunnelModel>this);

    if (!id) throw new Error('no id specified for update');
    if (!input) throw new Error('nothing to update');

    try {
        const document = await model.findByIdAndUpdate(id, input);
        return document;
    } catch (err) {
        console.log(err);
        throw new Error('could not upudate the funnel');
    }

};


FunnelSchema.statics.deleteFunnel = async function(id: string): Promise<IFunnelDocument> {
    const model = (<IFunnelModel>this);

    if (!id) throw new Error('no id specified for update');

    try {
        const document = await model.findOne({_id: id});
        if (!document) throw new Error('funnel not found');
        await document.remove();
        return document;
    } catch (err) {
        console.log(err);
        throw new Error('could not remove the funnel');
    }
};


FunnelSchema.statics.listFunnels = async function(): Promise<IFunnelDocument[]> {
    const model = (<IFunnelModel>this);

    try {
        return await model.find({});
    } catch (err) {
        console.log(err);
        throw new Error('could not get the list of funnels');
    }
};


@injectable()
export class Funnels extends ModelBase<IFunnelModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Funnels', FunnelSchema, 'funnels');
    }
}





