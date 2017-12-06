import {
    CreateWidgetMutation,
    RemoveWidgetMutation,
    UpdateWidgetMutation
} from './mutations';
import {
    WidgetsQuery,
    WidgetQuery,
    PreviewWidgetQuery
} from './queries';
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
        WidgetQuery,
        WidgetsQuery,
        PreviewWidgetQuery
    ]
})
export class WidgetsModule extends ModuleBase { }