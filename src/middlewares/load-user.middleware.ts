import { Request, Response } from 'express';
import { IExtendedRequest } from './extended-request';
import * as logger from 'winston';
import * as Promise from 'bluebird';
import { config } from '../configuration';

export function loadUser(req: IExtendedRequest, res: Response, next) {

    // only load a user when this request have an identity
    if (!req.identity) {
        return next();
    }

    let condition = {};
    let usernameField = config.usersService.usernameField;

    if (usernameField === 'email') {
        condition['emails'] = { $elemMatch: { address: req.identity.username  } };
    } else {
        condition['username'] = req.identity.username;
    }

    let error = { error: 'Your token has expired or this user does not exist anymore' };

    req.appContext.KPI.findOne({}, (err, res) => {
        const k = res;
    });

    req.appContext.User.findOne(condition)
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
            (<any>req).user = user;
            return next();
        }
        })
        .catch(err => {
            logger.error(err);
            return res.status(401).json(error).end();
        });
}