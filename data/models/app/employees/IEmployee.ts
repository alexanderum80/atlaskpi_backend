import { IAddress } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

/*export enum EmploymentType {
    FULL_TIME,
    PART_TIME
}*/

export interface IEmploymentInfo {
    location: String;
    bussinessUnit: String;
    departament: String;
    position: String;
    startDate: Date;
    typeOfEmployment: String;
    frequency: String;
    rate: String;
}

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
    employmentInfo: IEmploymentInfo;
}

export interface IEmployeeDocument extends IEmployee, mongoose.Document {
}

export interface IEmployeeModel extends mongoose.Model<IEmployeeDocument> { 
    createNew(firstName: string, middleName: string, lastName: string, email: string, primaryNumber: string, dob: string, nationality: string, 
        maritalStatus: string, address: IAddress, employmentInfo: IEmploymentInfo): Promise<IEmployeeDocument>;
    updateEmployee(_id: string, firstName: string, middleName: string, lastName: string, email: string, primaryNumber: string, dob: string, nationality: string,
        maritalStatus: string, address: IAddress, employmentInfo: IEmploymentInfo): Promise<IEmployeeDocument>;
    employees(): Promise<IEmployeeDocument[]>;
    employeeById(id: string): Promise<IEmployeeDocument>;
    deleteEmployee(id: string): Promise<IEmployeeDocument>;
}