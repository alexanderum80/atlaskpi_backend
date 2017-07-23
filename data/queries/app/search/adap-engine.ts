import * as Promise from 'bluebird';
const EngineBuilder: any = require('adaptjs').EngineBuilder;

export enum AdaptIntents {
    Chart
}

export const IntentsMap = {
    Chart: 'ChartIntent'
};

export class AdaptEngine {
    private _builder;
    private _engine;

    constructor(intents: AdaptIntents[]) {
        if (!intents || intents.length === 0) {
            throw new Error('An Adapt Engine with intents it is not useful');
        }

        const that = this;
        this._builder = new EngineBuilder();

        intents.forEach(i => {
            switch (i) {
                case AdaptIntents.Chart:
                    that._enableChartIntent();
                    break;
            }
        });

        this._engine = this._builder.build();
    }

    private _enableChartIntent() {
        this._builder.entity('ChartKeyword', ['show me', 'give me', 'draw for me']);
        this._builder.entity('DateRange', ['last month', 'this year', 'last year', 'last 6 months']);
        this._builder.entity('Frequency', ['daily', 'monthly']);
        this._builder.entity('Collection', ['sales', 'expenses']);
        this._builder.entity('Grouping', ['location', 'service type', 'category', 'business unit']);
        this._builder.entity('ChartType', ['pie chart', 'area chart', 'column chart', 'line chart', 'stacked bar chart', 'bar chart']);

        this._builder.intent('ChartIntent')
            .require('ChartKeyword', 'chartKey')
            .require('DateRange')
            .require('Collection')
            .optionally('Grouping')
            .optionally('Frequency')
            .optionally('ChartType');
    }

    parse(sentence: string): Promise<any> {
        const that = this;

        return new Promise<any>((resolve, reject) => {
            this._engine.query(sentence)
                .then(intents => {
                    console.log(intents);
                    that._engine.stop();
                    resolve(intents);
                })
                .catch(error => {
                    console.log(error);
                    console.log(error.stack);
                    that._engine.stop();
                    reject(error);
                });
        });
    }

}