import { PreviewWidgetQuery } from './queries/preview-widget.query';
import { ListWidgetsQuery } from './queries';
import { GetWidgetQuery } from './queries/get-widget.query';
import { CreateWidgetMutation, RemoveWidgetMutation, UpdateWidgetMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateWidgetMutation,
        RemoveWidgetMutation,
        UpdateWidgetMutation
    ],
    queries: [
        GetWidgetQuery,
        ListWidgetsQuery,
        PreviewWidgetQuery
    ]
})
export class WidgetsModule extends ModuleBase { }