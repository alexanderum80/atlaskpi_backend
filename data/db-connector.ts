// import { Mongoose } from 'mongoose';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { config } from '../config';
import * as winston from 'winston';

export default function makeDefaultConnection(): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    let dbUri = config.masterDb; // 'mongodb://localhost/kpibi';

    // if the connection is open, leave this function
    /**
     * Connection ready state
     * 0 = disconnected
     * 1 = connected
     * 2 = connecting
     * 3 = disconnecting
     * Each state change emits its associated event name.
     */

    if ([1, 2].indexOf(mongoose.connection.readyState) !== -1) {
      resolve(true);
      return;
    }

    mongoose.connect(dbUri);

    mongoose.connection.on('connected', () => {
        winston.debug('debug', 'Mongoose default connection open to ' + dbUri);
        resolve(true);
    });

    mongoose.connection.on('error', (err) => {
        winston.error('Mongoose default connection error', { error: err });
        reject(false);
    });

    mongoose.connection.on('disconnected', function () {
      winston.debug('debug', 'Mongoose default connection disconnected');
    });

    process.on('SIGINT', function() {
      mongoose.connection.close(() => {
        winston.debug('debug', 'Mongoose default connection disconnected through app termination');
        process.exit(0);
      });
    });
  });

}
