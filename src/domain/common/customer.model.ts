import { Entity } from './entity';

export interface Customer extends Entity {
        city: string;
        state: string;
        zip: string;
        gender: string;
}