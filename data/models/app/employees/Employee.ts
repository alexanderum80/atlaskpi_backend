import { Address, IAddress, IEmploymentInfo, EmploymentInfo } from '../../common';
import { IEmployeeModel, IEmployeeDocument } from './IEmployee';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as logger from 'winston';

let Schema = mongoose.Schema;

const EmployeeSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    primaryNumber: String,
    dob: Date,
    nationality: String,
    maritalStatus: String,
    address: Address,
    employmentInfo: [EmploymentInfo],
});

EmployeeSchema.statics.createNew = function(firstName: string, middleName: string, 
    lastName: string, email: string, primaryNumber: string, dob: string, nationality: string,
    maritalStatus: string, address: IAddress, employmentInfo: IEmploymentInfo[]): Promise<IEmployeeDocument> {

    const that = this;

    return new Promise<IEmployeeDocument>((resolve, reject) => {
        if (!firstName || !lastName || !middleName ) {
            return reject('Information not valid');
        }

        that.create({
            firstName: firstName,
            middleName: middleName,
            lastname: lastName,
            email: email,
            primaryNumber: primaryNumber,
            dob: dob,
            nationality: nationality,
            maritalStatus: maritalStatus,
            address: address,
            employmentInfo: employmentInfo
        }).then(employee => {
            resolve(employee);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the employee');
        });
    });
};

EmployeeSchema.statics.updateEmployee = function(_id: string, firstName: string, middleName: string, 
    lastName: string, email: string, primaryNumber: string, dob: string, nationality: string,
    maritalStatus: string, address: IAddress, employmentInfo: IEmploymentInfo[]): Promise<IEmployeeDocument> {
    const that = <IEmployeeModel> this;

    return new Promise<IEmployeeDocument>((resolve, reject) => {
        if (!firstName || !lastName || !middleName) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            email: email,
            primaryNumber: primaryNumber,
            dob: dob,
            nationality: nationality,
            maritalStatus: maritalStatus,
            address: address,
            employmentInfo: employmentInfo
        }).then(employee => {
            resolve(employee);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the employee');
        });
    });
};

EmployeeSchema.statics.deleteEmployee = function(_id: string): Promise<IEmployeeDocument> {
    const that = <IEmployeeModel> this;

    return new Promise<IEmployeeDocument>((resolve, reject) => {
        that.findByIdAndRemove (_id).then(employee => {
                resolve(employee);
            }).catch(err => {
                logger.error(err);
                reject('There was an error updating the employee');
            });

        // });

    });
};

EmployeeSchema.statics.employees = function(): Promise<IEmployeeDocument[]> {
    const that = <IEmployeeModel> this;

    return new Promise<IEmployeeDocument[]>((resolve, reject) => {
        that.find({}).then(employees => {
            resolve(employees);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving employees');
        });
    });
};

EmployeeSchema.statics.employeeById = function(id: string): Promise<IEmployeeDocument> {
    const that = <IEmployeeModel> this;

    return new Promise<IEmployeeDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(employee => {
            resolve(employee);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving employee');
        });
    });
};

export function getEmployeeModel(m: mongoose.Connection): IEmployeeModel {
    return <IEmployeeModel>m.model('Employee', EmployeeSchema, 'employees');
}