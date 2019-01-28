import { IAppConfig } from './../../configuration/config-models';
import { Db, MongoClient } from 'mongodb';
import { Logger } from '../../domain/app/logger';
import * as Bluebird from 'bluebird';
import { IAccountDocument } from '../../domain/master/accounts/Account';

export interface ISeedService {
    run(includeDemoData: boolean): Promise<boolean>;
}

export enum IMigrationType {
    raw = 'raw',
    command = 'command'
}

export interface IMigration {
    order: number;
    name: string;
    payload: any;
    type: IMigrationType;
}

export class NewSeedService implements ISeedService {
    private sourceDb = 'newdemo';

    constructor(
       private _config: IAppConfig,
       private _logger: Logger,
       private _newAccount: IAccountDocument,
    ) { }

    async run(includeDemoData: boolean): Promise<boolean> {
        const targetDbName = this._newAccount.database.name;
        try {
            this.sourceDb = this._config.seedDbName;
            const dbUri =
                this._config.newAccountDbUriFormat.replace('{{database}}', targetDbName);
            const client = await this.connect(dbUri);

            const targetDb = client.db(targetDbName);

            const copied = await this.copyData(client, targetDb, includeDemoData);

            const migrated = await this._runMigrations(targetDb);

            client.close();
            return copied && migrated;

            // ------> MongoDB Atlas doesn't allow to run eval, we need to refactor this to use
            // db.runCommand() https://docs.mongodb.com/manual/reference/method/db.runCommand/

            // const migrationsCollection = this._newAccount.db.collection('migrations');

            // const migrations =
            //     await migrationsCollection
            //             .find()
            //             .sort({ order: 1})
            //             .toArray();

            // const migrationResult =
            //     await Bluebird.map(
            //                 migrations,
            //                 async(m) => this.runMigration(targetDb, m),
            //                 { concurrency: 1}
            //     );
        } catch (e) {
            console.error('There was an error seeding new account', e);
            throw e;
        }
    }

    private connect(dbUri: string): Promise<MongoClient> {
        return new Promise<MongoClient>((resolve, reject) => {
            MongoClient.connect(
                dbUri,
                { useNewUrlParser: true } as any,
                (err: Error, client: MongoClient) => {
                    if (err) reject(err);
                    else resolve(client);
                });
        });
    }

    private async copyData(
        client: MongoClient,
        targetDb: Db,
        addDemoData: boolean): Promise<boolean> {
        const self = this;
        const basicCollections = [
         //   'permissions',
         //   'roles',
            'virtualSources'
        ];
        const definitionCollections = ['charts', 'dashboards', 'kpis', 'widgets', 'maps'];
        const demoDataCollections = [
            'appointments',
            'calls',
            'cogs',
            'expenses',
            'financialActivities',
            'inventory',
            'payments',
            'sales',
            'slideshows',
            'socialNetworks',
            'tags',
            'workLogs'
        ];

        let collectionNames = [...basicCollections];

        if (addDemoData) {
            collectionNames =
                collectionNames.concat(definitionCollections).concat(demoDataCollections);
        }

        const sourceDb = client.db(this.sourceDb);

        const promises: Promise<boolean>[] = [];

        collectionNames.forEach((collection) => {
            promises.push(self.copyCollection(sourceDb, targetDb, collection));
        });

        return Promise.all(promises)
            .then(() => true)
            .catch(() => false);
    }

    private copyCollection(sourceDb: Db, targetDb: Db, collectionName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            sourceDb.collection(collectionName)
            .find({})
            .forEach((doc) => {
                targetDb.collection(collectionName)
                .insert(doc, { ordered: false } as any, (err) => {
                    if (err) {
                        console.error('There was an error inserting an document', err);
                        return reject(err);
                    }
                });
            }, () => {
                console.log('Done with: ' + collectionName);
                resolve(true);
            });
        });
    }


    private async _runMigrations(targetDb: Db): Promise<boolean> {

        const db = targetDb;

        const now = new Date(Date.now());
        const user = await db.collection('users').findOne({});
        const userId = user._id.toString();

        const promises = [];

        // -> add Owner and metadata to dashboards
        promises.push(
            db.collection('dashboards').update({}, {
                $set: {
                    createdDate: now,
                    updatedDate: now,
                    owner: userId,
                    updatedBy: userId,
                }
                }, {
                multi: true
            })
        );

        // ->

        const userObjectCollections = ['kpis', 'charts', 'widgets', 'maps'];

        for (const col of userObjectCollections) {
            promises.push(
                db.collection(col).update({}, {
                    $set: {
                        createdDate: now,
                        updatedDate: now,
                        createdBy: userId,
                        updatedBy: userId,
                    }
                }, {
                multi: true
                })
            );
        }

        return Promise.all(promises).then(() => true).catch(err => false);
    }

    // private async runMigration(targetDb: Db, m: IMigration): Promise <boolean> {
    //     console.log('running migration: ' + m.name);

    //     try {
    //         const res = await (<any>targetDb).eval(m.payload.code);
    //         return true;
    //     } catch (e) {
    //         console.error('There was an error running migration: ' + m.name, e);
    //         return false;
    //     }
    // }


}