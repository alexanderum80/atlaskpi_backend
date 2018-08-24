import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export interface SourceNew {
    type: string;
    identifier: string;
}

export interface DateRangeNew {
    from?: string;
    to?: string;
}

export interface ReportOptionsNew {
    frequency?: string;
    groupings?: string;
    timezone: string;
    dateRange: DateRangeNew;
    filter?: string[];
}

export interface deliveyMethodNew {
    email: boolean;
    push: boolean;
}

export interface UsersNew {
    id: string;
    deliveyMethod: [string];
}

export interface NotificationConfigNew {
    notifiOnPercente: string;
    users: [UsersNew];
}

export interface ITargetNew {
    name: string;
    source: SourceNew;
    kpi: string;
    reportOptions: ReportOptionsNew;
    compareTo: string;
    recurrent: string;
    type: string;
    value: string;
    unit: string;
    notificationConfig: NotificationConfigNew;
    owner: string;
    active?: boolean;
    selected?: boolean;
}

export interface ITargetNewInput {
    name: string;
    source: SourceNew;
    kpi: string;
    reportOptions: ReportOptionsNew;
    compareTo: string;
    recurrent: string;
    type: string;
    value: number;
    unit: string;
    notificationConfig: NotificationConfigNew;
    owner: string;
    active?: boolean;
    selected?: boolean;
}

export interface ISourceNewInput {
    type: string;
    identifier: string;
}
  
export interface ITargetNewDocument extends ITargetNew, mongoose.Document {

}

export interface ITargetNewModel extends mongoose.Model<ITargetNewDocument> {
    createNew(name: ITargetNewInput): Promise<ITargetNewDocument>;
    updateTargetNew(id: string, name: ITargetNewInput): Promise<ITargetNewDocument>;
    targetsNew(): Promise<ITargetNewDocument[]>;
    targetNewById(id: string): Promise<ITargetNewDocument>;
    deleteTargetNew(id: string): Promise<ITargetNewDocument>;
    targetBySource(identifier: string): Promise<ITargetNewDocument[]>;
    targetByName(name: string): Promise<ITargetNewDocument>;
}
