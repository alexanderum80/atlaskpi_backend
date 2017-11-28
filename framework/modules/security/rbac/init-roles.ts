import { WSAEINVALIDPROVIDER } from 'constants';
import * as Promise from 'bluebird';
import { IAppModels } from '../../data/models';
import { IPermissionInfo, IRoleDocument } from './models';
import * as _ from 'lodash';
import { initAllPermissions } from '../../data/models/master/accounts/initialRoles';

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
        setTimeout(() => {
        ctx.Permission.getOrCreate(initAllPermissions)
            .then(resp => {
                if (resp) {
                    roleNamesDiff.forEach(name => {
                        let len, role: IRoleDocument;
                        len = roleNamesDiff.length;

                        role = new ctx.Role({ name: name});
                        if (rolesAndPermissions[name]) {
                            _.forEach(rolesAndPermissions[name], (perm: IPermissionInfo) => {
                                _.forEach(resp, (v) => {
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
