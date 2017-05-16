import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IProduct {
    extenalIdentifier: string;
    name: string;
    description: string;
    category: string;
    sku: string;
    barcode: string;
    cost: number;
    price: number;
    tax: number;
    vendor: string;
    unitOfMeasure: string;
    condition: string;
    brand: string;
    height: number;
    width: number;
    length: number;
    make: string;
    mod: string;
    materials: string;
}

export interface IProductDocument extends IProduct, mongoose.Document {

}

export interface IProductModel extends mongoose.Model<IProductDocument> { }