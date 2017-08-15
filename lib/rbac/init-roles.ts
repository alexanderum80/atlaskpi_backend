import { WSAEINVALIDPROVIDER } from 'constants';
import * as Promise from 'bluebird';
import { IAppModels } from '../../data/models';
import { IRoleDocument } from './models';
import * as _ from 'lodash';

export function initRoles(ctx: IAppModels, rolesAndPermissions: any, savedRoles: any[]): Promise<boolean> {
  let count = Object.keys(rolesAndPermissions).length
    , roles: IRoleDocument[] = [];

    // just save the roles that do not exist already
    const roleNamesToAdd = Object.keys(rolesAndPermissions);
    const savedRoleNames = savedRoles.map(r => r.name);
    const roleNamesDiff = _.difference(roleNamesToAdd, savedRoleNames);

    if (!roleNamesDiff || roleNamesDiff.length === 0) {
        return Promise.resolve(true);
    }


    return new Promise<boolean>((resolve, reject) => {
        roleNamesDiff.forEach(name => {
            let len, role: IRoleDocument;
            // Convert [action, subject] arrays to objects
            len = roleNamesDiff.length;

            for (let i = 0; i < len; i++) {
                if (Array.isArray(rolesAndPermissions[name][i])) {
                    rolesAndPermissions[name][i] = {
                        action: rolesAndPermissions[name][i][0],
                        subject: rolesAndPermissions[name][i][1]
                    };
                }
            }

            // Create role


            role = new ctx.Role({ name: name });
            roles.push(role);

            role.save(function (err, role) {
                if (err) return reject(err);
                // Create role's permissions if they do not exist
                ctx.Permission.findOrCreate(rolesAndPermissions[role.name], function (err) {
                    if (err) return reject(err);
                    // Add permissions to role
                    role.permissions = Array.prototype.slice.call(arguments, 1);
                    // Save role
                    role.save(function (err) {
                        if (err) return reject(err);
                        --count || resolve(true);
                    });
                });
            });
        });
    });
}
