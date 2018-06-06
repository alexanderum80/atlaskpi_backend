import * as mongoose from 'mongoose';

import { IEntity, ISaleCustomer, ISaleEmployee, ISaleProduct } from '../sales/sale';

export interface ICOGSProduct extends ISaleProduct {
    unitCost: number;
    totalCost: number;
    profit: number;
}

export interface ICOGS extends IEntity {
    billId: string;
    billDate: Date;
    chargeId: string;
    chargeDate: Date;
    location: Location;
    customer: ISaleCustomer;
    employee: ISaleEmployee;
    category: IEntity;
    product: ICOGSProduct;
}

export interface ICOGSDocument extends ICOGS, mongoose.Document { }

export interface ICOGSModel extends mongoose.Model<ICOGSDocument> { }
