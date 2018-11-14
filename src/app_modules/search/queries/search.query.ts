import { ChartQuery } from './../../charts/queries/chart.query';
// import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { orderBy } from 'lodash';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { SearchActivity } from '../activities/search.activity';
import { SearchResultItem, SearchResult } from '../search.types';
import { AdaptEngine, AdaptIntents, IntentsMap } from './adap-engine';
import { ChartIntentProcessor } from './intent-processors/chart-intent.processor';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { Charts } from '../../../domain/app/charts/chart.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { Users } from '../../../domain/app/security/users/user.model';
import { Roles } from '../../../domain/app/security/roles/role.model';
import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { Widgets } from '../../../domain/app/widgets/widget.model';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { IGlobalSearch, ISearchResultItem } from '../../../domain/app/global-search/global-search';

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

@injectable()
@query({
    name: 'search',
    activity: SearchActivity,
    parameters: [
        { name: 'sections', type: String, required: true, isArray: true },
        { name: 'query', type: String, required: true },
    ],
    output: { type: SearchResult, isArray: true }
})
// TODO: MAKE SURE THIS WORKS
export class SearchQuery implements IQuery<SearchResult[]> {
    private _adaptEngine: AdaptEngine;

    constructor(
        @inject(ChartQuery.name) private _getChartQuery: ChartQuery,
        @inject(ChartIntentProcessor.name) private _chartIntentProcessor: ChartIntentProcessor,
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(Charts.name) private _charts: Charts,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Slideshows.name) private _slideshows: Slideshows,
        @inject(Widgets.name) private _widgets: Widgets,
        @inject(Users.name) private _users: Users,
        @inject(Roles.name) private _roles: Roles,
        @inject(Appointments.name) private _appointments: Appointments
    ) {
        this._adaptEngine = new AdaptEngine([AdaptIntents.Chart]);
    }

    run(data: { query: string }): Promise<SearchResult[]> {
        const that = this;

        return new Promise<SearchResult[]>((resolve, reject) => {
            let result: SearchResult[] = [];

            // that._processModelsSearch(data.query).then(r => resolve(r));

            // before go through the rest of the options I want to parse the query
            // in order to determine if the AdaptEngine can extract any intent from it
            this._adaptEngine.parse(data.query).then(intents => {
                let promise: Promise<SearchResult[]>;

                if (intents && intents.length > 0) {
                    console.log('Intents found');
                    promise = that._processIntents(intents);
                } else {
                    console.log('Intents not found');
                    promise = that._processModelsSearch(data.query);
                }

                promise.then(result => { resolve(result); }).catch(e => reject(e));
            }).catch(e => reject(e));
        });
    }

    private _processIntents(intents: any[]): Promise<SearchResult[]> {
        // first get the intent with the highest confidence
        const sortedIntents = orderBy(intents, 'confidence', 'desc');
        const intent = sortedIntents[0];

        switch (intent.intent_type) {
            case IntentsMap.Chart:
                return this._chartIntentProcessor.run(intent);
        }
    }

    private _processModelsSearch(query: string): Promise<SearchResult[]> {
        const that = this;

        const regexSpecialCharacters = ['(', ')', '[', ']', '{', '}', '$', '^', '.', '|', '?', '*', '+', '\\'];

        const cleanQuery = this.escapeCharacters(regexSpecialCharacters, query);

        return new Promise<SearchResult[]>((resolve, reject) => {
            const searchFields = ['name', 'description'];

            const searchPromises: Promise<IGlobalSearch>[] = [
                this._dashboards.model.globalSearch(cleanQuery, searchFields, 'Dashboards', 'name', 'description'),
                this._charts.model.globalSearch(cleanQuery, ['title', 'subtitle'], 'Charts', 'title', 'subtitle'),
                this._kpis.model.globalSearch(cleanQuery, searchFields, 'KPIs', 'name', 'description'),
                this._slideshows.model.globalSearch(cleanQuery, searchFields, 'Slideshows', 'name', 'description'),
                this._widgets.model.globalSearch(cleanQuery, searchFields, 'Widgets', 'name', 'description'),
                this._users.model.globalSearch(cleanQuery, ['profile.firstName', 'profile.lastName'], 'Users', 'profile.firstName', 'profile.lastName'),
                this._roles.model.globalSearch(cleanQuery, ['name'], 'Roles', 'name', 'name'),
                this._appointments.model.globalSearch(cleanQuery, ['reason'], 'Appointments', 'reason', 'reason')
            ];

            Promise.all(searchPromises).then(res => {
                const section = { section: 'items', items: [] };

                res.forEach(r => {
                    if (r.data && r.data.length) {
                        section.items.push({
                            name: r.name,
                            data: r.data ? JSON.stringify(r.data) : null
                        });
                    }
                });

                resolve([section]);
            });
        });
    }

    escapeCharacters(characters, text) {
        var result = '';
    
        for (let i = 0; i < text.length; i++) {
            const element = text[i];
            result += characters.indexOf(element) !== -1
                ? "\\" + element
                : element;
        }
        
        return result;
    }

}
