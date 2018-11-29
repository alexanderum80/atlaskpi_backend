import * as winston from 'winston';

export function configLogger() {
    // Setup winston
    (winston as any).level = process.env.LOG_LEVEL || 'error';
    winston.add(winston.transports.File, { filename: 'app.log' });
    winston.cli();
}