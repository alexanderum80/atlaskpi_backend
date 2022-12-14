import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateWidgetMutation } from './mutations/create-widget.mutation';
import { RemoveWidgetMutation } from './mutations/remove-widget.mutation';
import { UpdateWidgetMutation } from './mutations/update-widget.mutation';
import { PreviewWidgetQuery } from './queries/preview-widget.query';
import { WidgetQuery } from './queries/widget.query';
import { ListWidgetsQuery } from './queries/list-widgets.query';
import { WidgetByNameQuery } from './queries/widget-by-name.query';


@AppModule({
    mutations: [
        CreateWidgetMutation,
        RemoveWidgetMutation,
        UpdateWidgetMutation
    ],
    queries: [
        WidgetQuery,
        ListWidgetsQuery,
        PreviewWidgetQuery,
        WidgetByNameQuery
    ]
})
export class WidgetsModule extends ModuleBase { }