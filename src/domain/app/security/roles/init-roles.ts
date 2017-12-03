import {
    allPermissions
} from './initial-roles';
import {
    Permissions,
    IPermissionInfo
} from '../permissions';
import {
    Roles
} from '../roles';
import {
    IRoleDocument
} from '../../../app';
import {
    difference
} from 'lodash';


export function initRoles(roles: Roles, permissions: Permissions, rolesAndPermissions: any, savedRoles: any[]): Promise < boolean > {
    let count = Object.keys(rolesAndPermissions).length;

    // just save the roles that do not exist already
    const roleNamesToAdd = Object.keys(rolesAndPermissions);
    const savedRoleNames = savedRoles.map(r => r.name);
    const roleNamesDiff = difference(roleNamesToAdd, savedRoleNames);

    if (!roleNamesDiff || roleNamesDiff.length === 0) {
        return Promise.resolve(true);
    }


    return new Promise < boolean > ((resolve, reject) => {
        setTimeout(() => {
            permissions.model.getOrCreate(allPermissions)
                .then(resp => {
                    if (resp) {
                        roleNamesDiff.forEach(name => {
                            let len, role: IRoleDocument;
                            len = roleNamesDiff.length;

                            role = new roles.model({
                                name: name
                            });
                            if (rolesAndPermissions[name]) {
                                rolesAndPermissions[name].forEach((perm: IPermissionInfo) => {
                                    resp.forEach((v) => {
                                        if ((v.action === perm.action) && (v.subject === perm.subject)) {
                                            role.permissions.push(v._id);
                                            role.save((err) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve(true);
                                                }
                                            });
                                        }
                                    });
                                });
                            }

                            if (name === 'owner') {
                                role.save((err) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(true);
                                });
                            }
                        });
                    }
                }).catch(err => reject(err));
        }, 20);

    });
}