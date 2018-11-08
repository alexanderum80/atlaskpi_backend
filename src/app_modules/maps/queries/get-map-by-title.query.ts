import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetMapByTitleActivity } from '../activities/get-map-by-title.activity';
import { Logger } from '../../../domain/app/logger';
import { MapsService } from '../../../services/maps.service';


@injectable()
@query({
    name: 'getMapByTitle',
    activity: GetMapByTitleActivity,
    parameters: [
        { name: 'title', type: String, required: true },
    ],
    output: { type: String }
})
export class GetMapByTitleQuery implements IQuery<String> {
    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(MapsService.name) private _maps: MapsService
    ) { }

    run(data: { title: string }): Promise<String> {
        const that = this;
        return new Promise<String>((resolve, reject) => {
            that._maps.getMapByTitle(data.title)
                .then(map => {
                    resolve(map);
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    reject(err);
                });
        });
    }
}
