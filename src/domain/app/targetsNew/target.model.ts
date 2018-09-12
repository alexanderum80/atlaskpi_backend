// import * as Promise from 'bluebird';/
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';
import { ITargetNewDocument, ITargetNewModel, ITargetNewInput, SourceNew } from './target';
import { SourceNewInput } from '../../../app_modules/targetsNew/target.types';
import * as moment from 'moment';

const TargetSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    source: {
        type: { type: String, required: true },
        identifier: { type: String, required: true }
    },
    kpi: { type: String, required: true },
    reportOptions: {
        frequency: String,
        groupings: [String],
        timezone: { type: String, required: true },
        dateRange: {
            from: { type: String },
            to: { type: String}
        },
        filter: { type: String, isArray: true}
    },
    compareTo: { type: String, required: true },
    recurrent: { type: Boolean, required: true },
    type: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    notificationConfig: {
        notifiOnPercente: [{ type: Number, required: true }],
        users: [{
            id: { type: String, required: true },
            deliveryMethod: [ {type: String} ]
        }]
    },
    owner: { type: String, required: true },
    active: { type: Boolean },
    selected: { type: Boolean },
    period: { type: String, required: true },
    deleted: { type: Boolean },
});

// add tags capabilities
TargetSchema.plugin(tagsPlugin);

TargetSchema.statics.createNew = function(targetInput: ITargetNewInput): Promise<ITargetNewDocument> {
    const that = <ITargetNewModel> this;

    return new Promise<ITargetNewDocument>((resolve, reject) => {
        if (!targetInput.name) {
            return reject('Information not valid');
        }

        const objectTarget = {
            name: targetInput.name,
            source : {
                type: targetInput.source.type,
                identifier: targetInput.source.identifier
            },
            kpi: targetInput.kpi,
            reportOptions: targetInput.reportOptions,
            compareTo: targetInput.compareTo,
            recurrent: targetInput.recurrent,
            type: targetInput.type,
            value: Number(targetInput.value),
            unit: targetInput.unit,
            notificationConfig : targetInput.notificationConfig,
            owner: targetInput.owner,
            active: targetInput.active,
            selected: targetInput.selected,
            target: 20,
            timestamp: new Date(),
            targetMet: 10,
            percentageCompletion: 90,
            period: targetInput.period,
        };

        that.create(objectTarget)
        .then(target => {
            resolve(
                target
            );
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the target');
        });
    });
};

TargetSchema.statics.updateTargetNew = function(_id: string, targetInput: ITargetNewInput): Promise<ITargetNewDocument> {
    const that = <ITargetNewModel> this;

    return new Promise<ITargetNewDocument>((resolve, reject) => {
        if (!targetInput) {
            return reject('Information not valid');
        }
        const objectTarget = {
            _id: _id,
            name: targetInput.name,
            source : {
                type: targetInput.source.type,
                identifier: targetInput.source.identifier
            },
            kpi: targetInput.kpi,
            reportOptions: targetInput.reportOptions,
            compareTo: targetInput.compareTo,
            recurrent: targetInput.recurrent,
            type: targetInput.type,
            value: Number(targetInput.value),
            unit: targetInput.unit,
            notificationConfig : targetInput.notificationConfig,
            owner: targetInput.owner,
            active: targetInput.active,
            selected: targetInput.selected,
            target: 20,
            timestamp: new Date(),
            targetMet: 10,
            percentageCompletion: 90,
            period: targetInput.period,
        };

        that.findByIdAndUpdate(_id, objectTarget)
        .then(target => {
            resolve(target);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the target');
        });
    });
};

TargetSchema.statics.deleteTargetNew = function(_id: string): Promise<ITargetNewDocument> {
    const that = <ITargetNewModel> this;

    return new Promise<ITargetNewDocument>((resolve, reject) => {
            that.findByIdAndRemove (_id).then(target => {
                resolve(target);
            }).catch(err => {
                logger.error(err);
                reject('There was an error updating the target');
            });

    });
};

TargetSchema.statics.targetsNew = function(): Promise<ITargetNewDocument[]> {
    const that = <ITargetNewModel> this;

    return new Promise<ITargetNewDocument[]>((resolve, reject) => {
        that.find({}).then(target => {
            resolve(target);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving targets');
        });
    });
};

TargetSchema.statics.targetNewById = function(id: string): Promise<ITargetNewDocument> {
    const that = <ITargetNewModel> this;

    return new Promise<ITargetNewDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(target => {
            resolve(target);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving target');
        });
    });
};

TargetSchema.statics.targetBySource = function(identifier: string): Promise<ITargetNewDocument[]> {
    return (this as ITargetNewModel).find({'source.identifier': identifier}).exec();
};

TargetSchema.statics.targetByName = function(name: string): Promise<ITargetNewDocument> {
    return (this as ITargetNewModel).findOne({name: name}).exec();
};

TargetSchema.statics.findTargetByDate = function(date: string): Promise<ITargetNewDocument[]> {
    const from = moment(date).utc().subtract(1, 'day').startOf('date').toDate();
    const to = moment(date).utc().startOf('day').toDate();

    return new Promise<ITargetNewDocument[]>((resolve, reject) => {
      (<ITargetNewModel>this).find({datepicker: { $gte: from, $lt: to }, delete: 0})
            .then((target) => {
                if (target) {
                    resolve(target);
                    return;
                }
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            });
    });
};

TargetSchema.statics.removeTargetFromChart = function(id: string): Promise<ITargetNewDocument> {
    return new Promise<ITargetNewDocument>((resolve, reject) => {
        (<ITargetNewModel>this).findOne({ 'source.type': 'chart', 'source.identifier': id })
            .then((target) => {
                if (!target) { return; } // raul added this line, sometimes there were no target and it caused an exception
                target.deleted = true;
                target.save((err, target: ITargetNewDocument) => {
                    if (err) {
                        reject({ success: false, entity: null, errors: err});
                        return;
                    }
                    resolve(target);
                });
            });
    });
};

TargetSchema.statics.removeTarget = function(id: string): Promise<ITargetNewDocument> {
    return new Promise<ITargetNewDocument>((resolve, reject) => {
        (<ITargetNewModel>this).findByIdAndRemove(id)
            .then((target) => {
                if (!target) { return; }
                target.deleted = true;
                target.save((err, target: ITargetNewDocument) => {
                    if (err) {
                        reject({ success: false, entity: null, errors: err });
                        return;
                    }
                    resolve(target);
                });
            }).catch((err) => {
                resolve(err);
            });
    });
};


TargetSchema.statics.findAllTargets = function(): Promise<ITargetNewDocument[]> {
    const that = this;
    return new Promise<ITargetNewDocument[]>((resolve, reject) => {
        (<ITargetNewModel>this).find()
            .then((targets) => {
                if (targets) {
                    resolve(targets);
                    return;
                }
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            });
    });
};

TargetSchema.statics.findTargetById = function(id: string): Promise<ITargetNewDocument> {
    const that = this;
    return new Promise<ITargetNewDocument>((resolve, reject) => {
      (<ITargetNewModel>this).findOne({_id: id})
            .then((target) => {
                if (target) {
                    resolve(target);
                    return;
                }
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            });
    });
};


TargetSchema.statics.findTargetByName = async function(name: string): Promise<ITargetNewDocument> {
    return await this.findOne({ name: name });
};

TargetSchema.statics.findTarget = async function(id: string): Promise<ITargetNewDocument[]> {
    return await (<ITargetNewModel>this).find({_id: id, delete: 0});
};

TargetSchema.statics.findUserVisibleTargets = function(chartId: string, userId: string): Promise<ITargetNewDocument[]> {
    return (<ITargetNewModel>this).find({ delete: 0, visible: { $in: [userId] }, chart: { $in: [chartId] } }).exec();
};



@injectable()
export class TargetsNew extends ModelBase<ITargetNewModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'TargetsNew', TargetSchema, 'targets_new');
    }
}
