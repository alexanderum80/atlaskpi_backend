// import { Mongoose } from 'mongoose';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import * as winston from 'winston';
import { IAppConfig } from '../configuration/config-models';

export function makeDefaultConnection(config: IAppConfig): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    let dbUri = config.masterDb; // 'mongodb://localhost/kpibi';
    const options = {
        useMongoClient: true
    };

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

    mongoose.connect(dbUri, options);

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


export function connectToMongoDb(dbUri: string): Promise<mongoose.Connection> {
    winston.debug(`Conecting to server: ${dbUri}`);

    return new Promise<mongoose.Connection>((resolve, reject) => {
        const options = {
            server: {
                auto_reconnect: true,
                socketOptions: {
                    connectTimeoutMS: 3600000,
                    keepAlive: 3600000,
                    socketTimeoutMS: 3600000
                },
                useMongoClient: true
            }
        };

        let conn = mongoose.createConnection(dbUri, options);

        conn.on('connected', () => {
            winston.debug('Mongoose custom connection open to ' + dbUri);
            resolve(conn);
        });

        conn.on('error', (err) => {
            winston.error('Mongoose custom connection error: ' + err);
            reject(err);
        });

        conn.on('disconnected', function () {
            winston.debug('Mongoose custom connection disconnected');
        });

        process.on('SIGINT', function() {
            conn.close(() => {
                winston.debug('Mongoose custom connection disconnected through app termination');
                process.exit(0);
            });
        });
    });
}

export function documentNotExist(model: mongoose.Model<mongoose.Document>, condition: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        model.findOne(condition, (err, res) => {
            if (err) {
                reject(err);
            } else if (!res) {
                resolve(true);
            }

            reject(false);
        });
    });
}

export function readMongooseSchema(schema: mongoose.Schema) {
    let result = {};
    let keys: string[];
    let schemaObj = {};
    const objConstructor = schema.constructor.name;

    if (objConstructor === 'Schema') {
        schemaObj = schema.obj;
    } else if (objConstructor === 'Array') {
        // schemaObj = schema[0].obj;
        schemaObj = schema[0];
    } else {
        schemaObj = schema;
    }

    keys = Object.keys(schemaObj);

    if (keys.indexOf('unique') !== -1) {
        return schemaObj['type'].name;
    }

    keys.forEach(k => {
        const constructorName = schemaObj[k].constructor.name;
        const functionName = schemaObj[k].name;

        result[k] = ['Object', 'Array', 'Schema'].indexOf(constructorName) !== -1
            ? readMongooseSchema(schemaObj[k])
            : functionName;
    });

    return result;
}
