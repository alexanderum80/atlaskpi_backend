import { IIdentity } from '../models/app/identity';
import * as Promise from 'bluebird';

export interface IQuery<T> {

     /**
     * Identity of the user requesting the mutation
     */
    identity: IIdentity;
     /**
     * Specifies if an attempt to execute this mutation should be logged
     */
    log?: boolean;

    /**
     * Specifies if the changes on this mutation should be audit and saved
     * to the database so the changes can audited at a later time
     */
    audit?: boolean;

     /**
     * Executes the logic for this activity
     */
    run(data: any): Promise<T>;
}