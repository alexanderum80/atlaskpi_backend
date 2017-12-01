
import { ModelBase } from '../../../type-mongo';
import { AppConnection } from '../app.connection';
import { injectable, inject } from 'inversify';
import { ISlideshowInput } from './';
import { ISlideshowDocument, ISlideshowModel } from './slideshow';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as logger from 'winston';

const SlideshowSchema = new mongoose.Schema({

    name: String,
    description: String,
    charts: [String]
});

SlideshowSchema.statics.createSlideshow = function(input: ISlideshowInput): Promise<ISlideshowDocument> {
    const that = <ISlideshowModel> this;

    return new Promise<ISlideshowDocument>((resolve, reject) => {
        const newSlideshow = {
            name: input.name,
            description: input.description,
            charts: input.charts
        };

        if (!newSlideshow.name || !newSlideshow.description || !newSlideshow.charts || !(newSlideshow.charts.length > 0)) {
            return reject('Information not valid');
        }

        that.create(newSlideshow).then(slideshow => {
            resolve(slideshow);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the slideshow');
        });
    });
};

SlideshowSchema.statics.updateSlideshow = function(_id: string, input: ISlideshowInput): Promise<ISlideshowDocument>{
    const that = <ISlideshowModel> this;

     return new Promise<ISlideshowDocument>((resolve, reject) => {
        const newSlideshow = {
            name: input.name,
            description: input.description,
            charts: input.charts
        };

        if (!_id || !newSlideshow.name || !newSlideshow.description || !newSlideshow.charts) {
            return reject('Information not valid');
        }
        that.findByIdAndUpdate(_id, newSlideshow).then(slideshow => {
            resolve(slideshow);
            return;
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the Slideshow');
        });
     });
};

SlideshowSchema.statics.deleteSlideshow = function(_id: string): Promise<ISlideshowDocument>{
    const that = <ISlideshowModel> this;
    return new Promise<ISlideshowDocument>((resolve, reject) => {
        if (!_id) {
        return reject('Information not valid');
       }
       that.findByIdAndRemove(_id).then(slideshow => {
           resolve(slideshow);
       }).catch(err => {
            logger.error(err);
            reject('There was an error updating the Slideshow');
        });

    });
};

SlideshowSchema.statics.slideshows = function(): Promise<ISlideshowDocument[]>{
    const that = <ISlideshowModel> this;

    return new Promise<ISlideshowDocument[]>((resolve, reject) => {
        that.find({}).then(slideshow => {
            resolve(slideshow);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving Slideshow');
        });
    });
};

SlideshowSchema.statics.slideshowById = function(id: string): Promise<ISlideshowDocument> {
    const that = <ISlideshowModel> this;

    return new Promise<ISlideshowDocument>((resolve, reject) => {
        that.findById({_id: id}).then(slideshow => {
           resolve(slideshow);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving Slideshow');
        });
    });
};

SlideshowSchema.statics.slideshowByGroupChart = function(group: string): Promise<ISlideshowDocument[]>{
    const that = <ISlideshowModel> this;
    ///  falta la verdadera implementacion, tiene otro proposito
    return new Promise<ISlideshowDocument[]>((resolve, reject) => {
        that.find().then(slideshow => {
            resolve(slideshow);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving Slideshow');
        });
    });
};

@injectable()
export class Slideshows extends ModelBase<ISlideshowModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super(appConnection, 'Slideshow', SlideshowSchema, 'slideshows');
    }
}
