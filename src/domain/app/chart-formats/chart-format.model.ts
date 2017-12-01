import {
    ModelBase
} from '../../../type-mongo';
import {
    AppConnection
} from '../app.connection';
import {
    injectable,
    inject
} from 'inversify';
import {
    IChartDocument
} from '../charts';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import {
    IChartFormatModel,
    IChartFormat,
    IChartFormatDetails,
    IChartFormatDocument
} from './chart-format';
import {
    IMutationResponse,
    MutationResponse,
    IPaginationDetails,
    IQueryResponse
} from '../../common';
import {
    IPagedQueryResult,
    PaginationDetailsDefault,
    Paginator
} from '../../common/pagination';
import * as validate from 'validate.js';
import * as logger from 'winston';

let Schema = mongoose.Schema;

let ChartFormatSchema = new Schema({
    name: String,
    type: String,
    typeFormat: {
        before: String,
        after: String,
        decimal: Number,
        formula: String
    }
});

ChartFormatSchema.statics.createChartFormat = function(details): Promise < IMutationResponse > {
    let that = this;

    return new Promise < IMutationResponse > ((resolve, reject) => {
        let constraints = {
            name: {
                presence: {
                    message: '^cannot be blank'
                }
            },
        };

        let errors = ( < any > validate)(( < any > details).details, constraints, {
            fullMessages: false
        });
        if (errors) {
            resolve(MutationResponse.fromValidationErrors(errors));
        }

        let newChart = {
            name: details.details.name,
            type: details.details.type,
            typeFormat: {
                after: undefined,
                before: undefined,
                decimal: undefined,
                formula: undefined
            }
        };
        if (details.details.typeFormat.before)
            newChart.typeFormat.before = details.details.typeFormat.before;
        if (details.details.typeFormat.after)
            newChart.typeFormat.after = details.details.typeFormat.after;
        if (details.details.typeFormat.decimal)
            newChart.typeFormat.decimal = parseFloat(details.details.typeFormat.decimal);
        if (details.details.typeFormat.formula)
            newChart.typeFormat.formula = details.details.typeFormat.formula;

        that.create(newChart, (err, chart: IChartFormat) => {
            if (err) {
                reject({
                    message: 'There was an error creating the chartFormat',
                    error: err
                });
                return;
            }

            resolve({
                entity: chart
            });
        });

    });
};

ChartFormatSchema.statics.getAllChartFormats = function(details: IPaginationDetails): Promise < IPagedQueryResult < IChartFormatDocument >> {
    let paginator = new Paginator < IChartFormatDocument > (this, ['name']);
    return paginator.getPage(details);
};

ChartFormatSchema.statics.updateChartFormat = function(id, data) {
    let that = this;

    let document: IChartFormatDocument;
    let promises = [];

    return new Promise < IMutationResponse > ((resolve, reject) => {

        let idError = ( < any > validate)({
            id: id
        }, {
            id: {
                presence: {
                    message: '^cannot be blank'
                }
            }
        });

        if (idError) {
            resolve(MutationResponse.fromValidationErrors(idError));
            return;
        }

        let dataError = ( < any > validate)({
            data: data
        }, {
            data: {
                presence: {
                    message: '^cannot be empty'
                }
            }
        });

        if (dataError) {
            resolve(MutationResponse.fromValidationErrors(dataError));
        }

        ( < IChartFormatModel > this).findById(id).then((chart) => {
            let constraints = {
                document: {
                    presence: {
                        message: '^not found'
                    }
                }
            };

            let errors = ( < any > validate)({
                id: id,
                document: chart
            }, constraints, {
                fullMessages: false
            });
            if (errors) {
                resolve(MutationResponse.fromValidationErrors(errors));
                return;
            }

            // mods
            if (data.name) {
                chart.name = data.name;
            }

            if (data.type) {
                chart.type = data.type;
            }

            if (data.typeFormat) {
                if (data.typeFormat.before) {
                    chart.typeFormat.before = data.typeFormat.before;
                }
                if (data.typeFormat.before) {
                    chart.typeFormat.before = data.typeFormat.before;
                }
                if (data.typeFormat.after) {
                    chart.typeFormat.after = data.typeFormat.after;
                }
                if (data.typeFormat.decimal) {
                    chart.typeFormat.decimal = parseFloat(data.typeFormat.decimal);
                }
                if (data.typeFormat.formula) {
                    chart.typeFormat.formula = data.typeFormat.formula;
                }
            }

            chart.save((err, chart: IChartFormat) => {
                if (err) {
                    reject({
                        message: 'There was an error updating the chart',
                        error: err
                    });
                    return;
                }
                resolve({
                    entity: chart
                });
            });
        });
    });
};

ChartFormatSchema.statics.removeChartFormat = function(id) {
    let that = this;

    let document: IChartFormatDocument;
    let promises = [];

    return new Promise < IMutationResponse > ((resolve, reject) => {

        let idError = ( < any > validate)({
            id: id
        }, {
            id: {
                presence: {
                    message: '^cannot be blank'
                }
            }
        });

        if (idError) {
            resolve(MutationResponse.fromValidationErrors(idError));
        }

        ( < IChartFormatModel > this).findById(id).then((chart) => {
            let constraints = {
                document: {
                    presence: {
                        message: '^not found'
                    }
                }
            };

            let errors = ( < any > validate)({
                id: id,
                document: chart
            }, constraints, {
                fullMessages: false
            });
            if (errors) {
                resolve(MutationResponse.fromValidationErrors(errors));
            }

            let deletedChartFormat = chart;

            chart.remove((err, chart: IChartFormat) => {
                if (err) {
                    reject({
                        message: 'There was an error removing the chart',
                        error: err
                    });
                    return;
                }
                resolve({
                    entity: deletedChartFormat
                });
            });
        });
    });
};

ChartFormatSchema.statics.getChartFormatById = function(data): Promise < IQueryResponse < IChartFormatDocument >> {
    let that = this;

    let document: IChartFormatDocument;
    let promises = [];

    return new Promise < IQueryResponse < IChartFormatDocument >> ((resolve, reject) => {
        ( < IChartFormatModel > this).findById(data.id)
            .then((chart) => {
                if (!chart) {
                    reject({
                        success: false,
                        reason: {
                            name: 'not found',
                            message: 'Chart not found'
                        }
                    });
                }
                resolve({
                    data: chart
                });
            }, (err) => {
                logger.error(err);
                reject({
                    success: false,
                    reason: {
                        message: 'Error retrieving Chart Format'
                    }
                });
            });
    });
};

@injectable()
export class ChartFormats extends ModelBase < IChartFormatModel > {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super(appConnection, 'ChartFormat', ChartFormatSchema, 'chartFormats');
    }
}