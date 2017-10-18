import { Entity } from './entity';

export interface BaseModel extends Entity {
    source: string; // ex: quickbooks, nextech, etc
    status: {
        sync: number,
        tries: number,
        syncedOn: Date
    }
}