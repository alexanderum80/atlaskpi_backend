// import * as Promise from 'bluebird';
// import { inject, injectable } from 'inversify';

// import { ILocationDocument } from '../../../domain/app/location/location';
// import { Locations } from '../../../domain/app/location/location.model';
// import { query } from '../../../framework/decorators/query.decorator';
// import { IQuery } from '../../../framework/queries/query';
// import { LocationByIdActivity } from '../activities/location-by-id.activity';
// import { Location } from '../locations.types';

// @input()
// export class SearchInput {

//     @field({ type: GraphqlTypeMap.String })
//     city: string;

//     @field({ type: GraphqlTypeMap.String })
//     state: string;

//     @field({ type: GraphqlTypeMap.String })
//     name: string;

// }

// /**
//  * Create a location search that allow the following search criterias:
//  * 
//  * city
//  * state
//  * name
//  * 
//  */

// @injectable()
// @query({
//     name: 'searchLocation',
//     activity: SearchLocationsActivity,
//     parameters:[
//         { name: 'searchInput', type: SearchInput }
//     ]
  
// })
// export class LocationByIdQuery implements IQuery<ILocationDocument> {
//     constructor(@inject(Locations.name) private _locations: Locations) { }

//     run(data: { searchInput: SearchInput }): Promise<ILocationDocument> {
        
//         return this._locations.model.search(data.searchInput);




//     }
// }


// // Location Model

// function search(filters: SearchInput) {
//     const conditions = {} as any;

//     if (filters.city) {
//         conditions.city = filters.city;
//     }

//     if (filters.state) {
//         conditions.state = filters.state;
//     }

//     if (filters.name) {
//         conditions.name = {
//             $regex: new RegExp(filters.name)
//         };
//     }

//     this.find(conditions).then(result => {

//     });
// }


