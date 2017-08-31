import { IUser } from '../../../models/app/users';
import { ITargetModel } from '../../../models/app/targets/ITarget';
import { IIdentity } from '../../../models/app/identity';
import { IMutationResponse } from '../../../models/common';
import { MutationBase } from '../..';

export class RemoveTargetMutation /*extends MutationBase<IMutationResponse>*/ {
    constructor(public identity: IIdentity,
                private _TargetModel: ITargetModel,
                private _UserModel: IUser) {
                    // super(identity);
                }

    // run(data: string): Promise<IMutationResponse> {
    //     const that = this;
    //     return new Promise<IMutationResponse>((resolve, reject) => {
    //         let promises = [];
    //         let currentUser = this._UserModel.findById('')
    //             .then((user) => {
    //                 return user ? true : false;
    //             });
    //         promises.push(currentUser);

    //     });
    // }
}