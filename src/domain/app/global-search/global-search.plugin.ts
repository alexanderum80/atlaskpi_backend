import * as mongoose from 'mongoose';
import { IGlobalSearch, IGlobalSearchFieldMap } from './global-search';

export async function searchPlugin(schema: mongoose.Schema, options?: any) {
    schema.statics.globalSearch = globalSearch;
}

function globalSearch(query: string, searchPaths: string[], sectionName: string, nameField: string = 'name', descriptionField: string = 'description'): Promise<IGlobalSearch> {
    if (!searchPaths || !nameField || !descriptionField) {
        return Promise.resolve(null);
    }

    const filter = {
        $or: []
    }

    const regEx = new RegExp(query, 'i');

    searchPaths.forEach(f => {
        const fieldFilter = {};
        fieldFilter[f] = regEx;
        
        filter.$or.push(fieldFilter);
    });

    return new Promise<IGlobalSearch>((resolve, reject) => {
        this.find(filter, (err, docs) => {
            if (err) {
                resolve(null);
            }

            const searchResult: IGlobalSearch = {
                name: sectionName,
                data: docs.map(d => ({
                    id: d.id,
                    name: d[nameField],
                    description: d[descriptionField]
                }))
            };

            resolve(searchResult);
        });

    });
}