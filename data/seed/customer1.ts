import { IAppModels } from '../models/app/app-models';
import { AccountCreatedNotification } from '../../services/notifications/users';
import { getContext, ICreateUserDetails, IUserDocument } from '../models';
import * as winston from 'winston';
import { config } from '../../config';

const newUsers: ICreateUserDetails[] = [{
        firstName: 'Mario',
        lastName: 'Quero',
        middleName: '',
        email: 'mario@email.com',
        username: 'marito',
        password: 'password'
    }, {
        firstName: 'Orlando',
        lastName: 'Quero',
        middleName: 'M',
        email: 'orlando@gmail.com',
        username: 'orlando',
        // password: 'pass123'
    }, {
        firstName: 'Adileidy',
        lastName: 'Quero',
        middleName: 'M',
        email: 'orlaqp@yahoo.com',
        username: 'adi',
        password: '123456'
    }
];

export default function seedCustomer2(ctx: IAppModels) {
        ctx.User.find({}).then((users) => {
            if (users.length > 0) {
                return;
            }

            let index = 0;
            let roles = ['admin', 'manager', 'supervisor'];

            winston.debug('Seeding users for customer2');

            newUsers.forEach((user: ICreateUserDetails) => {
                let notifier = new AccountCreatedNotification(config);
                ctx.User.createUser(user, notifier).then((response) => {
                    (<IUserDocument>response.entity).addRole(roles[index]);
                    index++;
                }, (err) => {
                    winston.error('Error creating user mario: ', err);
                });
            });
    });
};