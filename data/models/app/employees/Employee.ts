import { IEmployeeInput } from './index';
import { Address, IAddress, IEmploymentInfo, EmploymentInfo } from '../../common';
import { IEmployeeModel, IEmployeeDocument, IEmployeeInput } from './IEmployee';
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

EmployeeSchema.statics.createNew = function(employeeInput: IEmployeeInput): Promise<IEmployeeDocument> {

    const that = this;

    return new Promise<IEmployeeDocument>((resolve, reject) => {
        if (!employeeInput.firstName || !employeeInput.lastName || !employeeInput.middleName ) {
            return reject('Information not valid');
        }

        that.create({
            firstName: employeeInput.firstName,
            middleName: employeeInput.middleName,
            lastname: employeeInput.lastName,
            email: employeeInput.email,
            primaryNumber: employeeInput.primaryNumber,
            dob: employeeInput.dob,
            nationality: employeeInput.nationality,
            maritalStatus: employeeInput.maritalStatus,
            address: employeeInput.address,
            employmentInfo: employeeInput.employmentInfo
        }).then(employee => {
            resolve(employee);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the employee');
        });
    });
};

EmployeeSchema.statics.updateEmployee = function(_id: string, employeeInput: IEmployeeInput): Promise<IEmployeeDocument> {
    const that = <IEmployeeModel> this;

    return new Promise<IEmployeeDocument>((resolve, reject) => {
        if (!employeeInput.firstName || !employeeInput.lastName || !employeeInput.middleName) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
            firstName: employeeInput.firstName,
            middleName: employeeInput.middleName,
            lastName: employeeInput.lastName,
            email: employeeInput.email,
            primaryNumber: employeeInput.primaryNumber,
            dob: employeeInput.dob,
            nationality: employeeInput.nationality,
            maritalStatus: employeeInput.maritalStatus,
            address: employeeInput.address,
            employmentInfo: employeeInput.employmentInfo
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