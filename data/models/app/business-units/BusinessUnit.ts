import { IdName, IIdName, IPagedQueryResult, IPaginationDetails, Paginator, IQueryResponse } from '../../common';
import { IBusinessUnit, IBusinessUnitDocument, IBusinessUnitModel } from './IBusinessUnit';
import { IMutationResponse, MutationResponse } from '../../';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';
import * as winston from 'winston';

let Schema = mongoose.Schema;

let INamedTypeSchema = new Schema({
    id: Number!,
    name: String!
});

let BusinessUnitSchema = new Schema({
    name: String!,
    industry: INamedTypeSchema!,
    subIndustry: INamedTypeSchema,
    shortName: String,
    active: Boolean!,

    phone: String,
    website: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    timezone: String,
    timeFormat: String,
    dateFormat: String,
    defaultCurrency: String,
    defaultLanguage: String,
    firstDayOfWeek: String,
});

// BusinessUnitSchema.methods.

// BusinessUnitSchema.statics.
BusinessUnitSchema.statics.createBusinessUnit = function(details: IBusinessUnit): Promise<IMutationResponse> {
    let that = this;

    return new Promise<IMutationResponse>((resolve, reject) => {
        let constraints = {
            name: { presence: { message: '^cannot be blank' }},
            industry: { presence: { message: '^cannot be blank' }},
        };

        let errors = (<any>validate)((<any>details), constraints, {fullMessages: false});
        if (errors) {
            resolve(MutationResponse.fromValidationErrors(errors));
            return;
        };

        that.create(details, (err, businessUnit: IBusinessUnit) => {
            if (err) {
                reject({ message: 'There was an error creating the businessUnit', error: err });
                return;
            }
            resolve({ entity: businessUnit });
        });
    });
  };

  BusinessUnitSchema.statics.allBusinessUnits = function(details: IPaginationDetails): Promise<IPagedQueryResult<IBusinessUnitDocument>> {
      let paginator = new Paginator<IBusinessUnitDocument>(this, ['name']);
      return paginator.getPage(details);
  };

  BusinessUnitSchema.statics.findBusinessUnitById = function(id: string): Promise<IQueryResponse<IBusinessUnitDocument>> {
        return new Promise<IQueryResponse<IBusinessUnitDocument>>((resolve, reject) => {
            (<IBusinessUnitModel>this).findById(id)
                .then((businessUnit) => {
                if (businessUnit) {
                    resolve({ errors: null, data: businessUnit });
                } else {
                    resolve({ errors: [ {field: 'businessUnit', errors: ['Not found'] } ], data: null });
                }
            }).catch(() => {
                resolve({ errors: [ {field: 'businessUnit', errors: ['Not Found'] } ], data: null });
            });
        });
  };

   BusinessUnitSchema.statics.updateBusinessUnit = function(id: string, details: IBusinessUnit): Promise<IMutationResponse> {
        let that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {

            let idError = (<any>validate)({id: id}, {id: { presence: { message: '^cannot be blank' } } });

            if (idError) {
                resolve(MutationResponse.fromValidationErrors(idError));
                return;
            }

            let constraints = {
                name : { presence: { message: '^cannot be blank' } },
                active: { presence: { message: '^cannot be blank' } }
            };

            let dataError = (<any>validate)(details, constraints, {fullMessages: false});

            if (dataError) {
                resolve(MutationResponse.fromValidationErrors(dataError));
                return;
            }

            (<IBusinessUnitModel>this).findById(id).then((businessUnit) => {
                if (!businessUnit) {
                    resolve({ errors: [ {field: 'businessUnit', errors: ['Not found'] } ], entity: null });
                  return;
                }

                Object.assign(businessUnit, details);

                businessUnit.save( (err, businessUnit: IBusinessUnit) => {
                    if (err) {
                        reject({ message: 'There was an error updating the user', error: err });
                        return;
                    }
                    resolve({ entity: businessUnit });
                });
            }).catch((err) => {
                resolve(MutationResponse.fromValidationErrors({ success: false, reason: err }));
            });
        });
    };

    BusinessUnitSchema.statics.removeBusinessUnitById = function(id: string): Promise<IMutationResponse> {
        let that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {

            let idError = (<any>validate)({ id: id },
            { id: { presence: { message: '^cannot be blank' } } });

            if (idError) {
                resolve(MutationResponse.fromValidationErrors(idError));
            }

            (<IBusinessUnitModel>this).findById(id).then((businessUnit) => {
                if (!businessUnit) {
                     resolve({ errors: [ {field: 'businessUnit', errors: ['Not found'] } ], entity: null });
                     return;
                }

                let deletedBusinessUnit = businessUnit;

                businessUnit.remove( (err, businessUnit: IBusinessUnit) => {
                    if (err) {
                        reject({ message: 'There was an error removing the businessUnit', error: err });
                        return;
                    }
                    resolve({ entity: deletedBusinessUnit });
                });
            });
        });
};

export function getBusinessUnitModel(m: mongoose.Connection): IBusinessUnitModel {
    return <IBusinessUnitModel>m.model('BusinessUnit', BusinessUnitSchema, 'businessUnits');
}