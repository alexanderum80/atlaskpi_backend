import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IAddress } from '../../common/address.model';
import { IEmploymentInfo } from '../../common/employment-info.model';

/*export enum EmploymentType {
    FULL_TIME,
    PART_TIME
}*/

export interface IEmployee {
    firstName: String;
    middleName: String;
    lastName: String;
    email: String;
    primaryNumber: String;
    dob: String;
    nationality: String;
    maritalStatus: String;
    address: IAddress;
    employmentInfo: IEmploymentInfo[];
}

export interface IEmployeeInput {
    firstName: String;
    middleName: String;
    lastName: String;
    email: String;
    primaryNumber: String;
    dob: String;
    nationality: String;
    maritalStatus: String;
    address: IAddress;
    employmentInfo: [IEmploymentInfo];
}

export interface IEmployeeDocument extends IEmployee, mongoose.Document {
}

export interface IEmployeeModel extends mongoose.Model<IEmployeeDocument> {
    createNew(employeeInput: IEmployeeInput): Promise<IEmployeeDocument>;
    updateEmployee(id: string, employeeInput: IEmployeeInput): Promise<IEmployeeDocument>;
    employees(): Promise<IEmployeeDocument[]>;
    employeeById(id: string): Promise<IEmployeeDocument>;
    deleteEmployee(id: string): Promise<IEmployeeDocument>;
}