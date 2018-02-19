import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ICompany {
    externalId: string;
    name: string;
    timeZone: string;
}

export interface IBusiness {
    phoneNumber: string;
}

export interface ICustomer {
    city: string;
    country: string;
    name: string;
    phoneNumber: string;
    state: string;
}

export interface ITracking {
    phoneNumber: string;
}

export interface IRecording {
    duration: number;
}
export interface ISpeakerAgent {
    agent: number;
    customer: number;
}
export interface ICall {
    externalId: string;
    answered: string;
    business: IBusiness;
    customer: ICustomer;
    company: ICompany;
    direction: string;
    duration: string;
    startTime: Date;
    source: string;
    tracking: ITracking;
    voicemail: string;
    recording: IRecording;
    // more fields
    created_at: Date;
    device_type: string;
    first_call: string;
    prior_calls: number;
    lead_status: string;
    source_name: string;
    total_calls: number;
    referring_url: string;
    formatted_tracking_source: string;
    tags: any;
    speaker_percent: ISpeakerAgent;
    keywords: string;
    medium: string;
    landing_page_url: string;
    last_requested_url: string;
    referrer_domain: string;
}

export interface ICallDocument extends ICall, mongoose.Document {}

export interface ICallModel extends mongoose.Model<ICallDocument> {
    findCriteria(field: string, filter?: string): Promise<string[]>;
}