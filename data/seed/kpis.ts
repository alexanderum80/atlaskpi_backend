
import { IKPIDetails, IKPIDocument } from '../models/app/kpis';
import { getContext } from '../models';
import * as winston from 'winston';


const newKPIs = [
       {
           'name': 'KPI Number 1',
           'description': 'This is the KPI Number 1 Description, is only data to be displayed',
           'formula': 'E = mc2',
       },
       {
           'name': 'KPI Number 2',
           'description': 'This is the KPI Number 2 Description, is only data to be displayed',
           'formula': 'V = D/T',
       },
       {
           'name': 'KPI Number 3',
           'description': 'This is the KPI Number 3 Description, is only data to be displayed',
           'formula': 'a = V/T',
       },
       {
           'name': 'KPI Number 4',
           'description': 'This is the KPI Number 4 Description, is only data to be displayed',
           'formula': 'P = F/A',
       },
       {
           'name': 'KPI Number 5',
           'description': 'This is the KPI Number 5 Description, is only data to be displayed',
           'formula': 'P = CH*2+F(p)',
       },
       {
           'name': 'KPI Number 6',
           'description': 'This is the KPI Number 6 Description, is only data to be displayed',
           'formula': 'Q = ab(7+c)',
       },
       {
           'name': 'KPI Number 7',
           'description': 'This is the KPI Number 7 Description, is only data to be displayed',
           'formula': 'MB = 2*5(mc)',
       }
];

export default function seedKPIs() {
    getContext('mongodb://localhost/customer2').then((ctx) => {

        ctx.KPI.find({}).then((kpis) => {
              if (kpis.length > 0) {
                  return;
              }

            winston.debug('Seeding kpis for customer2');

            newKPIs.forEach((kpi) => {
                ctx.KPI.createKPI(<any>kpi).then((response) => {
                    winston.info('KPI Created: ', kpi.name);
                }, (err) => {
                    winston.error('Error creating KPI: ', err);
                });
            });
        });
    });
};