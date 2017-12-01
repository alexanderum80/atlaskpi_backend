import { Entity } from './entity';

export interface Employee extends Entity {
    fullName: string;
    role: string;
    type: string; // full time (f), part time (p)
}