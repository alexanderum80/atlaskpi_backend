import * as mongoose from 'mongoose';

import { IIdName } from '../../common/id-name';

interface IMainReferral extends IIdName {
    main: string;
}

export interface IEntity {
    externalId: string | number;
    name: string;
}

export interface IProjectedIncomeLocation extends IEntity {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
}

export interface IProjectedIncomeCustomer extends IEntity {
        city: string;
        state: string;
        zip: string;
        gender: string;
        dob: Date;
        address: string;
        fullname: string;
}

// Collection Name: projectedIncome
export interface IProjectedIncome extends IEntity {

    // Date fields
    date: Date;
    scheduleDate: Date;

    hours: number;

    // Money
    anesthesiaFee: number;
    facilityFee: number;
    inventoryFee: number;
    outsideFee: number;
    incomePreDiscount: number;
    discount: number;
    income: number;
    prePayments: number;

    appointmentType: string;
    resourceName: string;

    procedure: IIdName;

    location: IProjectedIncomeLocation;
    customer: IProjectedIncomeCustomer;
    provider: IIdName;
    coordinator: IIdName;
    referral: IMainReferral;
}

export interface IProjectedIncomeDocument extends IProjectedIncome, mongoose.Document { }

export interface IProjectedIncomeModel extends mongoose.Model<IProjectedIncomeDocument> {
    batchInsert(data: any[]): Promise<string[]>;
    batchRemove(ids: string[]): Promise<string[]>;
}
