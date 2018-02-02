import {
    Response
} from 'express';
import {
    IExtendedRequest
} from './extended-request';
import * as winston from 'winston';

export function logger(req: IExtendedRequest, res: Response, next) {

    let logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)({
                colorize: true
            }),
            new(winston.transports.File)({
                name: 'logs-file',
                filename: 'app-logs.log',
                level: 'debug'
            }),
            new(winston.transports.File)({
                name: 'errors-file',
                filename: 'app-errors.log',
                level: 'error'
            })
        ]
    });

    req.logger = logger;
    logger.debug('Winston logger added to the middlewares');

    next();
}