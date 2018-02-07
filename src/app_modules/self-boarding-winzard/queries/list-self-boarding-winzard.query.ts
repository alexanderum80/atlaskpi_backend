import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListSelfBoardinWinsardActivity } from '../activities/list-self-boarding-winzard.activity';
import { ISelfBoardingWinzardInput, ISelfBoardingWinzardDocument } from '../../../domain/app/self-boarding-winzard/self-boarding-winzard';
import { SelfBoardingWinzards } from '../../../domain/app/self-boarding-winzard/self-boarding-winzard.model';
import { SelfBoardingWinzard } from '../self-boarding-winzard.types';

@injectable()
@query({
    name: 'selfBoardingWinzard',
    activity: ListSelfBoardinWinsardActivity,
    output: { type: SelfBoardingWinzard , isArray: true }
})
export class ListSelfBoardingWinzardQuery implements IQuery<ISelfBoardingWinzardDocument[]> {

    constructor(@inject(SelfBoardingWinzards.name) private _selfBoardingWinzard: SelfBoardingWinzards ) { }

    run(): Promise<ISelfBoardingWinzardDocument[]> {
        const that = this;

        return new Promise<ISelfBoardingWinzardDocument[]>((resolve, reject) => {
            that._selfBoardingWinzard.model
            .find()
            .then(selfBoardingWinzard => {
                return resolve(selfBoardingWinzard);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }
}
