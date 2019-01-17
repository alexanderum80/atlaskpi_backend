import { searchPlugin } from '../global-search/global-search.plugin';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as validate from 'validate.js';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IMapDocument, IMapModel } from './maps';
import { tagsPlugin } from '../tags/tag.plugin';
import { MapAttributesInput } from '../../../app_modules/maps/map.types';

let Schema = mongoose.Schema;

const customDateRangeSchema = {
    from: Date,
    to: Date
};

let MapDateRangeSchema = {
    predefined: String,
    custom: customDateRangeSchema
};

let MapSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: String,
    group: String,
    dateRange: MapDateRangeSchema,
    groupings: [String],
    dashboards: [String],
    size: String,
    kpi: String,
    zipCodeSource: String,
     //add-created-update-by-date
    createdBy: String,
    createdDate: Date,
    updatedBy: String,
    updatedDate: Date
});

// add tags capabilities
MapSchema.plugin(tagsPlugin);
MapSchema.plugin(searchPlugin);

MapSchema.statics.createMap = function(input: MapAttributesInput): Promise < IMapDocument > {
    const that = this;

    return new Promise < IMapDocument > ((resolve, reject) => {
        const requiredAndNotBlank = {
            presence: {
                message: '^cannot be blank'
            }
        };

        let constraints = {
            title: requiredAndNotBlank,
            dateRange: requiredAndNotBlank,
            groupings: requiredAndNotBlank,
            size: requiredAndNotBlank,
            zipCodeSource: requiredAndNotBlank
        };

        let errors = ( < any > validate)(( < any > input), constraints, {
            fullMessages: false
        });

        if (errors) {
            reject(errors);
            return;
        }

        let newMap = {
            title: input.title,
            subtitle: input.subtitle,
            group: input.group,
            dateRange: input.dateRange,
            groupings: input.groupings,
            dashboards: input.dashboards,
            size: input.size,
            kpi: input.kpi,
            zipCodeSource: input.zipCodeSource,
            createdBy: input.createdBy,
            createdDate: input.createdDate,
            updatedBy: input.updatedBy,
            updatedDate: input.updatedDate
        };

        that.create(newMap)
            .then((map) => resolve(map))
            .catch((err) => reject(err));
    });
};
MapSchema.statics.updateMap = function(id: string, input: MapAttributesInput): Promise < String > {
    const that = this;

    return new Promise < String > ((resolve, reject) => {
        if (!id) {
            return Promise.reject({
                message: 'There was an error updating the map'
            });
        }

        const requiredAndNotBlank = {
            presence: {
                message: '^cannot be blank'
            }
        };

        let constraints = {
            title: requiredAndNotBlank,
            dateRange: requiredAndNotBlank,
            groupings: requiredAndNotBlank,
            size: requiredAndNotBlank,
            zipCodeSource: requiredAndNotBlank
        };

        let errors = ( < any > validate)(( < any > input), constraints, {
            fullMessages: false
        });

        if (errors) {
            return reject(errors);
        }

        const updatedMap = {
            title: input.title,
            subtitle: input.subtitle,
            group: input.group,
            dateRange: input.dateRange,
            groupings: input.groupings,
            dashboards: input.dashboards,
            size: input.size,
            kpi: input.kpi,
            zipCodeSource: input.zipCodeSource,
            updatedBy: input.updatedBy,
            updatedDate: input.updatedDate
        };

        that.findOneAndUpdate({
                _id: id
            }, updatedMap, {
                new: true
            })
            .exec()
            .then((map) => resolve(map))
            .catch((err) => reject(err));
    });
};

@injectable()
export class Maps extends ModelBase < IMapModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Maps', MapSchema, 'maps');
    }
}