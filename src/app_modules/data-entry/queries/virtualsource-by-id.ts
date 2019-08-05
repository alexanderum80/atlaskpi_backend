import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetVirtualSourceByIdActivity } from '../activities/get-virtualsource-by-id';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';


@injectable()
@query({
    name: 'virtualSourceById',
    activity: GetVirtualSourceByIdActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: String }
})
export class VirtualSourceByIdQuery implements IQuery<string> {
    constructor(@inject(VirtualSources.name) private _virtualSourceSvc: VirtualSources) { }

    async run(data: { id: string }): Promise<string> {
        const vs = await this._virtualSourceSvc.model.findOne({ _id: data.id});

        return JSON.stringify(vs);
    }
}