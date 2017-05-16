import * as mongoose from 'mongoose';
import * as validate from 'validate.js';

export interface IDuplicateOptions {
    model: mongoose.Model<mongoose.Document>;
    condition: any;
    message?: string;
}


export function addDuplicateValidator() {

    (<any>validate).validators.checkDuplicateAsync = function(value, options: IDuplicateOptions, key, attributes) {

        if (!options.model) {
            throw { message: 'Cannot use duplicate validator without a model'};
        }

        if (!options.condition) {
            throw { message: 'Cannot use duplicate validator without a condition'};
        }

        return new (<any>validate).Promise((resolve, reject) => {
            options.model.findOne(options.condition).then((res) => {
                if (res) {
                    let message = options.message || 'is duplicated';
                    resolve(message);
                } else {
                    resolve();
                };
            });
        });
    };

}