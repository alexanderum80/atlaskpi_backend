import { IWidget } from './../../../models/app/widgets/IWidget';
import { WidgetsService } from '../../../services/widgets/widgets.service';
import { IUIWidget } from '../../../models/app/widgets/ui-widget-base';
import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../../query-base';
import * as Promise from 'bluebird';

export class GetWidgetQuery extends QueryBase<IUIWidget> {

    constructor(
            public identity: IIdentity,
            private _widgetsService: WidgetsService) {
                super(identity);
            }

    run(data: { id: string }): Promise<IUIWidget> {
        return this._widgetsService.getWidgetById(data.id);
    }
}
