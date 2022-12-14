// import * as mongoose from 'mongoose';
// import * as Promise from 'bluebird';

// export interface INotificationData {
//     targetName: string;
//     targetAmount: string;
//     targetMet: string;
//     targetDate: string;
//     dashboardName: string;
//     chartName: string;
//     businessUnitName: string;
// }

// export interface INotify {
//     users: string[];
//     notification?: Date;
// }

// export interface ITarget {
//     name: string;
//     datepicker: string;
//     active: boolean;
//     vary: string;
//     amount: number;
//     amountBy: string;
//     period: string;
//     notify: INotify;
//     visible: string[];
//     owner: string;
//     chart?: string[];
//     delete?: boolean;
//     stackName?: string;
//     nonStackName?: string;
//     target?: number;
//     targetMet?: number;
//     timestamp?: Date;
//     percentageCompletion?: any;
// }

// export interface ITargetDocument extends ITarget, mongoose.Document {}

// export interface ITargetModel extends mongoose.Model<ITargetDocument> {
//     findTarget(id: string): Promise<ITargetDocument>;
//     findTargetById(id: string): Promise<ITargetDocument>;
//     findTargetByName(name: string): Promise<ITargetDocument>;
//     findTargetByDate(date: string): Promise<ITargetDocument[]>;
//     findAllTargets(): Promise<ITargetDocument[]>;
//     findUserVisibleTargets(chartId: string, userId: string): Promise<ITargetDocument[]>;
//     createTarget(data: ITarget): Promise<ITargetDocument>;
//     updateTarget(id: string, data: ITarget): Promise<ITargetDocument>;
//     removeTarget(id: string): Promise<ITargetDocument>;
//     removeTargetFromChart(id: string): Promise<ITargetDocument>;
// }