import { getContext } from '../models';
import { initRoles } from '../../lib/rbac';
import * as winston from 'winston';

export default function seedRoles(connectionString) {
    getContext(connectionString).then((ctx) => {

        ctx.Role.find({}).then((roles) => {
              if (roles.length > 0) {
                  return;
              }

              winston.debug('Seeding roles for customer2');

                initRoles(ctx, {
                  admin: [
                    ['create', 'Post'],
                    ['read', 'Post'],
                    ['update', 'Post'],
                    ['delete', 'Post']
                  ],
                  semiAdmin: [
                    // we can also specify permissions as an object
                    { action: 'read', subject: 'Post' }
                  ],
                  manager: [
                    ['create', 'Post'],
                  ],
                  supervisor: [
                    ['create', 'Post'],
                  ],
                  externalUser: [
                    ['create', 'Post'],
                  ],
                  viewer: [
                    ['create', 'Post'],
                  ]
                }, function (err, admin, readonly) {
                  console.log(admin);
                  console.log(readonly);
                });
        });
    });
};