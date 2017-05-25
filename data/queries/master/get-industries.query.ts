import * as Promise from 'bluebird';
import { IIndustryModel, IIndustry } from '../..';
import { IQuery } from '..';
import { IIdentity } from '../../';

export class GetIndustriesQuery implements IQuery<IIndustry[]> {

    constructor(
        public identity: IIdentity,
        private _IndustryModel: IIndustryModel) { }

    // log = true;
    // audit = true;

    run(data: any): Promise<IIndustry[]> {
            return this._IndustryModel.findAll();
    }
}
