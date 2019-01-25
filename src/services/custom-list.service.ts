import { inject, injectable } from 'inversify';

import { AppConnection } from '../domain/app/app.connection';
import { CurrentUser } from '../domain/app/current-user';
import { ICustomListInput, ICustomListResponse, ICustomList } from '../domain/app/custom-list/custom-list';
import { Logger } from '../domain/app/logger';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { CustomList } from './../domain/app/custom-list/custom-list.model';
import { IVirtualSource } from '../domain/app/virtual-sources/virtual-source';

const GOOGLE_ANALYTICS = 'GoogleAnalytics';

export interface IFieldAvailabilityOptions {
    dateRangeFilter?: { $gte: Date, $lt: Date };
    filters?: any;
    excludeSourceField?: boolean;
}

@injectable()
export class CustomListService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(AppConnection.name) private _appConnection: AppConnection,
        @inject(CustomList.name) private _customList: CustomList,
        @inject(CurrentUser.name) private _user: CurrentUser,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources
        ) { }

    async getCustomList(id?: string): Promise<ICustomListResponse[]> {
        const user = this._user.get().id;
        return await this._customList.model.getCustomList(user, id);
    }

    async customListByName(name: string): Promise<ICustomListResponse> {
        try {
            const user = this._user.get().id;
            return await this._customList.model.getCustomListByName(user, name);
        }
        catch (err) {
            console.error(err);
        }
    }

    async customListsByVirtualSource(id: string): Promise<ICustomList[]> {
        try {
            const vs = await this._virtualSources.model.findById(id).lean().exec() as IVirtualSource;
            const listIds: string[] = [];
            // get fields with list data sources
            for (let [key, value] of Object.entries(vs.fieldsMap)) {
                if (value.sourceOrigin) { listIds.push(value.sourceOrigin); }
            }

            if (!listIds.length) { return []; }

            return this._customList.model.find({ _id: { $in: listIds } }).lean().exec() as Promise<ICustomList[]>;
        } catch (e) {
            console.error(e);
        }
    }

    async addCustomList(input: ICustomListInput): Promise<ICustomListResponse> {
        return await this._customList.model.addCustomList(input);
    }

    async updateCustomList(input: ICustomListInput): Promise<ICustomListResponse> {
        return await this._customList.model.updateCustomList(input);
    }

    async removeCustomList(id: string): Promise<ICustomListResponse> {
        return new Promise<ICustomListResponse>((resolve, reject) => {
            const user = this._user.get().id;
            this._virtualSources.model.getDataEntry(user).then(dataSource => {
                const customListInUse = dataSource.filter(d => {
                    const customListExist = d.fields.filter(f => f.sourceOrigin === id);
                    if (customListExist.length) {
                        return d;
                    }
                });

                if (customListInUse.length) {
                    return reject('list in use');
                }

               this._customList.model.removeCustomList(id).then(res => {
                   return resolve(res);
               });
            });

        });
    }

}