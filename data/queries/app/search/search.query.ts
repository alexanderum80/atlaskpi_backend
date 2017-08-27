import { QueryBase } from '../../query-base';
import { ChartIntentProcessor } from './intent-processors';
import { GetChartQuery } from '../charts';
import * as _ from 'lodash';
import { AdaptEngine, IntentsMap } from './adap-engine';
import {
    SearchResultItem
} from './search-item';
import {
    IQuery
} from '../..';
import {
    IAppModels
} from '../../../models/app/app-models';
import {
    IIdentity
} from '../../../models/app/identity';
import * as Promise from 'bluebird';

const searchSections = [
    'dashboards',
    'charts',
    'kpis',
    'chartFormats',
    'dataSources',
    'users',
    'businessUnits',
    'sales',
    'expenses'
];
const sectionsModelsMap = {
    'dashboards': 'Dashboard',
    'charts': 'Chart',
    'kpis': 'KPI',
    'chartFormats': 'ChartFormat',
    'users': 'User',
    'businessUnits': 'BusinessUnit',
    'sales': 'Sale',
    'expenses': 'Expense'
};

export interface ISearchResult {
    section: string;
    data: SearchResultItem[] | string;
}

export class SearchQuery extends QueryBase< ISearchResult[] > {

    constructor(public identity: IIdentity, private _ctx: IAppModels, private _adaptEngine: AdaptEngine) {
        super(identity);
    }

    run(data: {
        sections: string[],
        query: string
    }): Promise < ISearchResult[] > {
        const that = this;

        return new Promise<ISearchResult[]>((resolve, reject) => {
            let result: ISearchResult[] = [];

            // before go through the rest of the options I want to parse the query
            // in order to determine if the AdaptEngine can extract any intent from it
            this._adaptEngine.parse(data.query).then(intents => {
                let promise: Promise<ISearchResult[]>;

                if (intents && intents.length > 0) {
                    promise = that._processIntents(intents);
                } else {
                    promise = that._processModelsSearch(data.sections, data.query);
                }

                promise.then(result => { resolve(result); }).catch(e => reject(e));
            }).catch(e => reject(e));

        });
    }

    private _processIntents(intents: any[]): Promise<ISearchResult[]> {
        // first get the intent with the highest confidence
        const sortedIntents = _.orderBy(intents, 'confidence', 'desc');
        const intent = sortedIntents[0];

        switch (intent.intent_type) {
            case IntentsMap.Chart:
                return ChartIntentProcessor.run(this.identity, this._ctx, intent);
        }
    }

    private _processModelsSearch(sections: string[], query: string): Promise<ISearchResult[]> {
        const that = this;

        return new Promise<ISearchResult[]>((resolve, reject) => {
            let result: ISearchResult[] = [];
            // I need to fire multiple search simultaneosly as promises
            // and wait for them to come back before returning the result
            let searchPromises: Promise < any[] >[] = new Array<Promise<any[]>>();
            let allSelected = sections.indexOf('all') !== -1;

            searchSections.forEach(s => {
                if (allSelected || sections.indexOf(s) !== -1) {
                    const model = this._ctx[sectionsModelsMap[s]];

                    if (!model) {
                        // if model was not found just return an empty promise in order to keep the order
                        searchPromises.push(Promise.resolve([]));
                    } else {
                        // call the search function on the model that belong to this section
                        let searchPromise = model.search(query);
                        searchPromises.push(searchPromise);
                    }
                }
            });

            Promise.all(searchPromises).then(searchResults => {
                for (let i = 0; i < searchPromises.length; i++) {
                    result.push({
                        section: searchSections[i],
                        data: searchResults[i]
                    });
                }

                resolve(result);
            }).catch(e => reject(e));
        });
    }
}