import { inject, injectable } from 'inversify';
import { LoggerInstance } from 'winston';

import { IExtendedRequest } from '../../middlewares/extended-request';

@injectable()
export class Logger {
    private _logger: LoggerInstance;

    constructor(@inject('Request') req: IExtendedRequest) {
        this._logger = req.logger;
    }

    get(): LoggerInstance {
        return this._logger;
    }

    error(msg: string, meta?: any): LoggerInstance {
        return this._logger.error(msg, meta);
    }

    warn(msg: string, meta?: any): LoggerInstance {
        return this._logger.warn(msg, meta);
    }

    info(msg: string, meta?: any): LoggerInstance {
        return this._logger.info(msg, meta);
    }

    debug(msg: string, meta?: any): LoggerInstance {
        return this._logger.debug(msg, meta);
    }
}