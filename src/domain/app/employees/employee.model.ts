import { EmploymentInfo } from '../../common/employment-info.model';
import { Address } from '../../common/address.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import { isEmpty } from 'lodash';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IEmployeeDocument, IEmployeeInput, IEmployeeModel } from './employee';
import { tagsPlugin } from '../tags/tag.plugin';


let Schema = mongoose.Schema;

const EmployeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
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

// add tags capabilities
EmployeeSchema.plugin(tagsPlugin);

EmployeeSchema.statics.createNew = function(employeeInput: IEmployeeInput): Promise<IEmployeeDocument> {

    const that = this;

    return new Promise<IEmployeeDocument>((resolve, reject) => {
        if (!employeeInput.firstName || !employeeInput.lastName) {
            return reject('Information not valid');
        }

        that.create(
            {
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
        }
    ).then(employee => {
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
        if (!employeeInput.firstName || !employeeInput.lastName) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id,
            {
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
        }
    ).then(employee => {
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
                reject('There was an error removing the employee');
            });
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

function dropFirstNameIndex(employeeModel: IEmployeeModel): void {
    if (employeeModel && employeeModel.collection) {
        let obj = {
            indexExist: false,
            indexName: ''
        };
        // indexes are objects, i.e. [key: string]: array[]
        employeeModel.collection.getIndexes().then(indexes => {
            // check if indexes exists
            if (!isEmpty(indexes)) {
                // ['firstName_1']
                const keys: string[] = Object.keys(indexes);
                const schemaField: RegExp = /firstName/;

                keys.forEach((field: string) => {
                    if (schemaField.test(field)) {
                        obj.indexExist = true;
                        obj.indexName = field;
                    }
                });

                // drop firstName index if it exists
                if (obj.indexExist && obj.indexName) {
                    employeeModel.collection.dropIndex(obj.indexName);
                }
            }
        }).catch(err => {
            logger.error(err);
        });
    }
}

@injectable()
export class Employees extends ModelBase<IEmployeeModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        const employeeModel = this.initializeModel(appConnection.get, 'Employee', EmployeeSchema, 'employees');
        dropFirstNameIndex(employeeModel);
    }
}
