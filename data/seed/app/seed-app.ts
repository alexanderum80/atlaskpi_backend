import { IAppModels } from '../../models/app/app-models';
import * as mongoose from  'mongoose';
import { getContext } from '../../models';
import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

export function seedApp(connection: string | IAppModels, databaseName?: string): Promise<boolean> {
    let dataFiles = [
        { model: 'KPI', filename: 'kpis.json' },
        { model: 'Chart', filename: 'charts.json' },
        { model: 'Dashboard', filename: 'dashboards.json' }
    ];

    let connectionPromise: Promise<IAppModels>;

    return new Promise<boolean>((resolve, reject) => {
        if (_.isString(connection)) {
            connectionPromise = getContext(connection);
        } else {
            connectionPromise = Promise.resolve(connection);
        }

        connectionPromise.then((ctx) => {

            let promises: Promise<any>[] = [];

            for (let i = 0; i < dataFiles.length; i++) {
                // make sure the collection is empty
                let data = dataFiles[i];
                let model = ctx[data.model];

                const insertManyPromise = new Promise<boolean>((resolve, reject) => {
                    model.count({}).exec().then((count) => {
                        console.log('Count for ' + data.model + ' = ' + count);

                        if (!count || count === 0) {
                            console.log(`seeding ${data.model}`);
                            let file = fs.readFile(path.join(__dirname, data.filename), { encoding: 'utf-8' }, (err, data) => {
                                if (err)
                                    console.log(err);

                                let dataArray = JSON.parse(data);

                                (<mongoose.Model<any>>model).insertMany(dataArray, (err, doc) => {
                                    if (err)
                                        reject(err);
                                    else
                                        resolve(true);
                                });
                            });
                        }
                    });
                });

                promises.push(insertManyPromise);
            }

            Promise.all(promises)
                .then(() => {
                    resolve(true);
                    // closeContext(ctx);
                })
                .catch((err) => {
                    reject(err);
                    // closeContext(ctx);
                });
        });

    });

}

function closeContext(ctx: IAppModels) {
    ctx.Connection.close();
}

