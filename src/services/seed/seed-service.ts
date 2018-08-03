import { IAppConfig } from './../../configuration/config-models';
import { inject } from 'inversify';
import { Db, MongoClient } from 'mongodb';

export interface ISeedService {
    run(targetDb: string, includeDemoData: boolean): Promise<boolean>;
}

export class NewSeedService implements ISeedService {
    private sourceDb = 'newdemo';

    constructor(
        @inject('Config') private _config: IAppConfig
    ) { }

    async run(targetDb: string, includeDemoData: boolean): Promise<boolean> {
        try {
            this.sourceDb = this._config.seedDbName;
            const dbUri =
                this._config.newAccountDbUriFormat.replace('{{database}}', targetDb);
            const client = await this.connect(dbUri);
            const result = await this.copyData(client, targetDb, includeDemoData);

            client.close();
            return result;
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

    private copyData(
        client: MongoClient,
        targetDbName: string,
        addDemoData: boolean): Promise<boolean> {
        const self = this;
        const basicCollections = [
         //   'permissions',
         //   'roles',
            'virtualSources'
        ];
        const definitionCollections = ['charts', 'dashboards', 'kpis', 'widgets'];
        const demoDataCollections = [
            'appointments',
            'business-unit',
            'calls',
            'cogs',
            'departments',
            'employees',
            'expenses',
            'financialActivities',
            'inventory',
            'locations',
            'payments',
            'sales',
            'slideshows',
            'socialNetworks',
            'tags',
            'targets',
            'workLogs'
        ];

        let collectionNames = [...basicCollections];

        if (addDemoData) {
            collectionNames =
                collectionNames.concat(definitionCollections).concat(demoDataCollections);
        }

        const sourceDb = client.db(this.sourceDb);
        const targetDb = client.db(targetDbName);
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
}