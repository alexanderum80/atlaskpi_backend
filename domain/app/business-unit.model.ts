import { AppConnection } from './app.connection';
import { ModelBase } from '../../type-mongo';
import { injectable } from 'inversify';

// this class needs to be declared in the container as singleton

export interface IBusinessUnit {

}


@injectable()
@model({ name: 'BusinessUnit', collection: 'business-units' })
export class BusinessUnit extends ModelBase<IBusinessUnit> {

    constructor(appConnection: AppConnection) {
        super(appConnection);
    }


}