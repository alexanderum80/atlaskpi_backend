import connectToMongoDb from '../mongo-utils';
import { getMasterContext, IIndustryModel } from '../models/master';
import * as winston from 'winston';


export default function seedIndustries(connectionString) {

    getMasterContext().then(ctx => {
        let industryModel = ctx.Industry;

        industryModel.find({}).then((industries) => {

            if (industries.length !== 0) {
                return;
            }

            winston.debug('Seeding Industries');

            industryModel.create({
                _id: '58cbdac39846c50eaadc7c11',
                name: 'Medical',
                subIndustries: [
                    {
                        _id: '58cbdac39846c50eaadc7c13',
                        name: 'Plastic Surgery'
                    },
                    {
                        _id: '58cbdac39846c50eaadc7c12',
                        name: 'Farmaceutical'
                    }
                ]
            });

            industryModel.create({
                _id: '58cbdac39846c50eaadc7c14',
                name: 'Retail',
                subIndustries: [
                    {
                        _id: '58cbdac39846c50eaadc7c16',
                        name: 'Distribuitor'
                    },
                    {
                        _id: '58cbdac39846c50eaadc7c15',
                        name: 'Furniture'
                    }
                ]
            });

        });
    });
};
