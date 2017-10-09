
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ISlideshow {
    name: string;
    description?: string;
    charts: [string];
}

export interface ISlideshowInput {
    name: string;
    description?: string;
    charts: [string];
}
export interface ISlideshowDocument extends ISlideshow, mongoose.Document {
}

export interface ISlideshowModel extends mongoose.Model<ISlideshowDocument> {
    /**
     * Create a slideshow
     * @param {name: string, description: string, charts: string[]} input -  with the details of the Slideshow
     * @returns {Promise<ISlideshowDocument>}
     */
     createSlideshow(input: ISlideshowInput): Promise<ISlideshowDocument>;

     /**
      * Update a Slideshow
      * @param {_id: string, name: string, description: string, charts: string[]} input -  with the details of the Slideshow and a param id for research 
      * @returns {Promise<ISlideshowDocument>} 
      */
     updateSlideshow(_id: string, input: ISlideshowInput): Promise<ISlideshowDocument>;

     /**
      * Delete a Slideshow
      * @param {_id: string} input: - id for research the slideshow to erase
      * @return {Boolean} Return a boolean Value
      */
      deleteSlideshow(_id: string): Promise<ISlideshowDocument>;

    /**
     * Return a slideshow list
     * @returns {Promise<ISlideshowDocument[]>}
     */
     slideshows(): Promise<ISlideshowDocument[]>;

     /**
      *  Return a slideshow
      * @param {_id: String} input: for to do de search by id
      * @returns {slideshow} Returns a Slideshow
      */
      slideshowById(_Id: string): Promise<ISlideshowDocument>;

      slideshowsByGroupChart(group: string): Promise<ISlideshowDocument[]>;

}

