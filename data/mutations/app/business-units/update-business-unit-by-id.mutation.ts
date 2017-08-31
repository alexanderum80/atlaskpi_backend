// import { MutationBase } from '../../mutation-base';
// import { IBusinessUnitModel } from '../../../models/app/business-units/IBusinessUnit';
// import * as Promise from 'bluebird';
// import { IIdentity, IMutationResponse } from '../../..';
// import { IMutation, IValidationResult } from '../..';

// export class UpdateBusinessUnitByIdMutation extends MutationBase<IMutationResponse> {

//     constructor(public identity: IIdentity,
//                 private _IBusinessUnitModel: IBusinessUnitModel) {
//                     super(identity);
//                 }

//     // log = true;
//     // audit = true;

//     run(data): Promise<IMutationResponse> {
//         return this._IBusinessUnitModel.updateBusinessUnit(data.id, data.details);
//     }
// }
