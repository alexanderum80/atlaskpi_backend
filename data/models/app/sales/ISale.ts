import { IIdName } from '../../common';
import * as mongoose from 'mongoose';

export interface IEntity {
    externalId: string | number;
    name: string;
}

export interface ILocation {
    identifier: string;
    name: string;
    city: string;
    state: string;
    zip: string;

    type: string;
    size: string;
}

export interface ICustomer extends IEntity {
        city: string;
        state: string;
        zip: string;
        gender: string;
}


export interface IEmployee extends IEntity {
    firstName: string;
    middleName: string;
    lastName: string;
    role: string;
    type: string; // full time (f), part time (p)
    workedTime: number; // in seconds
}

export interface IProduct extends IEntity {
    cost: number;
    price: number;
    tax: number;
    tax2: number;
    from: Date;
    to: Date;
}

export interface ICategory extends IEntity {
    service: boolean;
}

export interface ISales extends IIdName {
    location: ILocation;
    customer: ICustomer;
    employee: IEmployee;
    product: IProduct;
    category: ICategory;

    timestamp: Date;
    concept: string;
    document: {
        type: string, // invoice, bill, charge, etc
        identifier: string
    };

    payment: {
        method: string; // cash, credit, check
        type: string;   // visa, master card
        amount: number;
    };
}


export interface ISaleDocument extends ISales, mongoose.Document { }

export interface ISaleModel extends mongoose.Model<ISaleDocument> { }