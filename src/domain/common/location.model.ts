import { Entity } from './entity';

export interface IOperHours {
    day: String;
    from: String;
    to: String;
}

export const OperHours = {
    day: {type: String},
    from: {type: String},
    to: {type: String}
};