import { IDepartmentModel, IDepartmentDocument } from './IDepartment';
import * as mongoose from 'mongoose';
import * as logger from 'winston';


const DepartmentSchema = new mongoose.Schema({
    name: String,
    manager: String
   });

DepartmentSchema.statics.createNew = function(name: string, manager: string): Promise<IDepartmentDocument> {
    const that = <IDepartmentModel> this;

    return new Promise<IDepartmentDocument>((resolve, reject) => {
        if (!name) {
            return reject('Information not valid');
        }
        that.create({
            name: name,
            manager: manager
        }).then(department => {
            resolve(department);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the department');
        });
    });
};

DepartmentSchema.statics.updateDepartment = function(_id: string, name: string, manager: string): Promise<IDepartmentDocument> {
    const that = <IDepartmentModel> this;

    return new Promise<IDepartmentDocument>((resolve, reject) => {
        if (!name) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
           name: name,
           manager: manager
        }).then(department => {
            resolve(department);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the department');
        });
    });
};

DepartmentSchema.statics.deleteDepartment = function(_id: string): Promise<IDepartmentDocument> {
    const that = <IDepartmentModel> this;

    return new Promise<IDepartmentDocument>((resolve, reject) => {
            that.findByIdAndRemove (_id).then(department => {
                resolve(department);
            }).catch(err => {
                logger.error(err);
                reject('There was an error updating the department');
            });

        // });

    });
};

DepartmentSchema.statics.departments = function(): Promise<IDepartmentDocument[]> {
    const that = <IDepartmentModel> this;

    return new Promise<IDepartmentDocument[]>((resolve, reject) => {
        that.find({}).then(department => {
            resolve(department);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving departments');
        });
    });
};

DepartmentSchema.statics.departmentById = function(id: string): Promise<IDepartmentDocument> {
    const that = <IDepartmentModel> this;

    return new Promise<IDepartmentDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(department => {
            resolve(department);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving department');
        });
    });
};

export function getDepartmentModel(m: mongoose.Connection): IDepartmentModel {
    return <IDepartmentModel>m.model('Department', DepartmentSchema, 'departments');
}