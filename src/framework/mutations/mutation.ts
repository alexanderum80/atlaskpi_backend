import { IValidationResult } from './validation-result';
import * as Promise from 'bluebird';

/**
 * Describes a mutation for an specific type
 */
export interface IMutation<T> {

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
     * Method called only when authorization is succesful to validate 
     * if the input data for the activity is valid
     */
    validate?(data: any): Promise<IValidationResult>;

     /**
     * Executes the logic for this activity
     */
    run(data: any): Promise<T>;
}

