import { Entity } from './entity';

export interface Product extends Entity {
    itemCode: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    tax2: number;
    amount: number;
    paid: number;
    discount: number;
    from: Date;
    to: Date;
}