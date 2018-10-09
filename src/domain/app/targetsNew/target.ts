import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IChartDateRange } from '../../common/date-range';
import { IChartTop } from '../../common/top-n-record';

export enum TargetCompareToEnum {
    previous = 'previous',
    oneYearAgo = 'oneYearAgo',
    twoYearsAgo = 'twoYearsAgo',
    threeYearsAgo = 'threeYearsAgo',
}

export interface SourceNew {
    type: string;
    identifier: string;
}

export interface DateRangeNew {
    from?: string;
    to?: string;
}

export interface ReportOptionsNew {
    kpi: string;
    frequency?: string;
    groupings?: string[];
    timezone: string;
    dateRange: IChartDateRange;
    filter?: string[];
    top?: IChartTop;
    categorySource: string;
}

export interface DeliveryMethodNew {
    email: boolean;
    push: boolean;
}

export interface UsersNew {
    id: string;
    deliveryMethods: string[];
}

export interface NotificationConfigNew {
    notifyOnPercent: string;
    users: [UsersNew];
}

export interface ITargetMilestone {
    _id: string;
    task: string;
    dueDate: Date;
    status: string;
    responsible: string[];
}

export interface ITargetAppliesTo {
    field: string;
    value: string;
}

export interface ITargetNew {
    name: string;
    source: SourceNew;
    reportOptions: ReportOptionsNew;
    compareTo: TargetCompareToEnum;
    type: string;
    value: number;
    appliesTo?: ITargetAppliesTo;
    unit: string;
    notificationConfig: NotificationConfigNew;
    active?: boolean;
    targetValue?: number;
    timestamp?: Date;
    deleted: boolean;
    milestones: ITargetMilestone[];
    percentageCompletion?: number;
}

export interface IMilestone {
    task: string;
    dueDate: Date;
    status: string;
    responsible: [string];
}

export interface ITargetNewInput {
    name: string;
    source: SourceNew;
    reportOptions: ReportOptionsNew;
    compareTo: string;
    type: string;
    value: number;
    appliesTo?: ITargetAppliesTo;
    unit: string;
    active?: boolean;
    targetValue?: number;
    timestamp?: Date;
    notificationConfig: NotificationConfigNew;
    milestones: IMilestone[];
}

export interface ISourceNewInput {
    type: string;
    identifier: string;
}

export interface ITargetNewDocument extends ITargetNew, mongoose.Document {

}

export interface ITargetNewModel extends mongoose.Model<ITargetNewDocument> {
    createNew(name: ITargetNewInput): Promise<ITargetNewDocument>;
    updateTargetNew(id: string, name: ITargetNew): Promise<ITargetNewDocument>;
    targetsNew(): Promise<ITargetNewDocument[]>;
    targetNewById(id: string): Promise<ITargetNewDocument>;
    deleteTargetNew(id: string): Promise<ITargetNewDocument>;
    targetBySource(identifier: string): Promise<ITargetNewDocument[]>;
    targetByName(name: string): Promise<ITargetNewDocument>;
    findTargetByDate(date: string): Promise<ITargetNewDocument[]>;
    removeTargetFromChart(id: string): Promise<ITargetNewDocument>;
    removeTarget(id: string): Promise<ITargetNewDocument>;
    findAllTargets(): Promise<ITargetNewDocument[]>;
    findTargetById(id: string): Promise<ITargetNewDocument>;
    findTargetByName(name: string): Promise<ITargetNewDocument>;
    findTarget(id: string): Promise<ITargetNewDocument>;
    findUserVisibleTargets(chartId: string, userId: string): Promise<ITargetNewDocument[]>;
}
