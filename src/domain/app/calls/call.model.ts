import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { ICallModel } from './call';
import { ModelBase } from '../../../type-mongo/model-base';
import * as mongoose from 'mongoose';
import { inject, injectable } from 'inversify';
import { AppConnection } from '../app.connection';
import * as Promise from 'bluebird';

const Schema = mongoose.Schema;

const CompanySchema = {
    externalId: String,
    name: String,
    timeZone: String,
};

const BusinessSchema = {
    phoneNumber: String,
};

const CustomerSchema = {
    city: String,
    country: String,
    name: String,
    phoneNumber: String,
    state: String
};

const TrackingSchema = {
    phoneNumber: String
};

const RecordingSchema = {
    duration: Number
};

const SpeakerAgentSchema = {
    agent: Number,
    customer: Number
};

export const CallSchema = new Schema({
    externalId: String,
    answered: String,
    business: BusinessSchema,
    customer: CustomerSchema,
    company: CompanySchema,
    direction: String,
    duration: Number,
    startTime: Date,
    source: String,
    tracking: TrackingSchema,
    voicemail: String,
    recording: RecordingSchema,
    created_at: Date,
    device_type: String,
    first_call: String,
    prior_calls: Number,
    lead_status: String,
    source_name: String,
    total_calls: Number,
    referring_url: String,
    formatted_tracking_source: String,
    tags: Schema.Types.Mixed,
    speaker_percent: SpeakerAgentSchema,
    keywords: String,
    medium: String,
    landing_page_url: String,
    last_requested_url: String,
    referrer_domain: String
});

CallSchema.plugin(criteriaPlugin);

@injectable()
export class Calls extends ModelBase<ICallModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Call', CallSchema, 'calls');
    }
}