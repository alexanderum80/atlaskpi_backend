import { Request, Response } from 'express';
import { ExtendedRequest } from './extended-request';
import * as logger from 'winston';
import { config } from '../config';

export function loadUser(req: ExtendedRequest, res: Response, next) {

    // only load a user when this request have an identity
    if (!req.identity) {
        next();
        return;
    }

    let condition = {};
    let usernameField = config.usersService.usernameField;

    if (usernameField === 'email') {
        condition['emails.address'] = req.identity.username;
    } else {
        condition['username'] = req.identity.username;
    }

    req.appContext.User.findOne(condition, function(err, user) {
        let error = { error: 'Your token has expired or this user does not exist anymore' };

        // just becuase there is not an error it doenst mean that findOne returned an user...
        // so we have to check if there is a user
        if (err || !user) {
            logger.error(err);
            res.status(401).json(error);
            res.end();
        } else {
            // make sure the token still exist bafore accept this request
            let token = req.body.token || req.query.token || req.headers['x-access-token'];
            let tokenExist = user.tokens.find(t => t.token === token);

            if (!tokenExist) {
                logger.error(`User ${user.username} tried to login with a token that does not exist anymore`);
                res.status(401).json(error);
                res.end();
            } else {
                logger.debug(`Request user: ${user.username}`);
                req.user = user;
                next();
            }
        }
    });
}