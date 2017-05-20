import { IAppModels } from '../models/app/app-models';
import { IBusinessUnit, IBusinessUnitDocument } from '../models/app/business-units';
import { getContext } from '../models';
import * as winston from 'winston';


const newBusinessUnits: IBusinessUnit[] = [
       {
         'name': 'B-Unit1',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42f96',
             'name': 'Food'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42f92',
             'name': 'FastFood'
         },
         'active': true
      },
      {
         'name': 'B-Unit2',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42f96',
             'name': 'Food'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42f95',
             'name': 'SeaFood'
         },
         'active': false
      },
     {
         'name': 'B-Unit3',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42f96',
             'name': 'Food'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42f98',
             'name': 'Chinese'
         },
         'active': false
      },
      {
         'name': 'B-Unit4',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42f9c',
             'name': 'Wine'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42f9b',
             'name': 'GrapeVine'
         },
         'active': true
      },
      {
         'name': 'B-Unit5',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42f9c',
             'name': 'Wine'
         },
         'subIndustry': {
             '_id': '2',
             'name': '58cc85ac2ef8ca2713c42f9e'
         },
         'active': true
      },
      {
         'name': 'B-Unit6',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42f9c',
             'name': 'Wine'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42fa1',
             'name': 'Restorant'
         },
         'active': true
      },
     {
         'name': 'B-Unit7',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42f9c',
             'name': 'Wine'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42fa4',
             'name': 'Liquor'
         },
         'active': false
      },
      {
         'name': 'B-Unit8',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42fab',
             'name': 'Retail'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42fa7',
             'name': 'Kiosk'
         },
         'active': false
      },
      {
         'name': 'B-Unit9',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42fab',
             'name': 'Retail'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42faa',
             'name': 'Distribiutor'
         },
         'active': true
      },
     {
         'name': 'B-Unit10',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42fab',
             'name': 'Retail'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42fad',
             'name': 'Pawnshop'
         },
         'active': true
      },
     {
         'name': 'B-Unit11',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42fab',
             'name': 'Retail'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42fb0',
             'name': 'Dolar'
         },
         'active': true
      },
      {
         'name': 'B-Unit12',
         'industry': {
             '_id': '58cc85ac2ef8ca2713c42fab',
             'name': 'Retail'
         },
         'subIndustry': {
             '_id': '58cc85ac2ef8ca2713c42fb3',
             'name': 'WallGreen'
         },
         'active': false
      }


];

export default function seedBusinessUnits(ctx: IAppModels) {
        ctx.BusinessUnit.find({}).then((bUnits) => {
              if (bUnits.length > 0) {
                  return;
              }

            winston.debug('Seeding business units for customer2');

            newBusinessUnits.forEach((businessUnit: IBusinessUnit) => {
                ctx.BusinessUnit.createBusinessUnit(businessUnit).then((response) => {
                    winston.info(`seeded businessUnit: ${response.entity.name}`);
                }, (err) => {
                    winston.error('Error creating Business Unit: ', err);
                });
            });
        });
};