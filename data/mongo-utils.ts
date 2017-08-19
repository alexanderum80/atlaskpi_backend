// import mongoose = require('mongoose');
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as winston from 'winston';

export default function connectToMongoDb(dbUri: string): Promise<mongoose.Connection> {
    winston.debug(`Conecting to server: ${dbUri}`);

    return new Promise<mongoose.Connection>((resolve, reject) => {
        const options = {
            server: {
                auto_reconnect: true,
                socketOptions: {
                    connectTimeoutMS: 3600000,
                    keepAlive: 3600000,
                    socketTimeoutMS: 3600000
                }
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