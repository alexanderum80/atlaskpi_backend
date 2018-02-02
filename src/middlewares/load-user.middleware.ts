import { model } from 'mongoose';
import * as logger from 'winston';

import { config } from '../configuration/config';
import { IAppConfig } from '../configuration/config-models';
import { Permissions } from '../domain/app/security/permissions/permission.model';
import { Roles } from '../domain/app/security/roles/role.model';
import { Users } from '../domain/app/security/users/user.model';
import { IExtendedRequest } from './extended-request';
import { Response } from 'express';


export function loadUser(req: IExtendedRequest, res: Response, next) {

    // only load a user when this request have an identity
    if (!req.identity) {
        req.user = null;
        return next();
    }

    const container = req.Container.instance;
    const users = container.get < Users > (Users.name);
    const roles = container.get < Roles > (Roles.name);
    const permissions = container.get < Permissions > (Permissions.name);
    const config = container.get < IAppConfig > ('Config');

    let condition = {};
    let usernameField = config.usersService.usernameField;

    if (usernameField === 'email') {
        condition['emails'] = {
            $elemMatch: {
                address: req.identity.username
            }
        };
    } else {
        condition['username'] = req.identity.username;
    }

    let error = {
        error: 'Your token has expired or this user does not exist anymore'
    };

    users.model.findOne(condition)
        .populate({
            path: 'roles',
            model: 'Role',
            populate: {
                path: 'permissions',
                model: 'Permission'
            }
        })
        .then(user => {
            // just becuase there is not an error it doenst mean that findOne returned an user...
            // so we have to check if there is a user
            if (!user) {
                logger.error(`user not found`);
                return res.status(401).json(error).end();
            }

            // make sure the token still exist before accept this request
            let token = req.body.token || req.query.token || req.headers['x-access-token'];
            let tokenExist = user.tokens.find(t => t.token === token);

            if (!tokenExist) {
                logger.error(`User ${user.username} tried to login with a token that does not exist anymore`);
                return res.status(401).json(error).end();
            } else {
                logger.debug(`Request user: ${user.username}`);
                req.user = user;
                return next();
            }
        })
        .catch(err => {
            logger.error(err);
            return res.status(401).json(error).end();
        });
}