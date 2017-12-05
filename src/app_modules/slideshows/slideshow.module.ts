import {
    SlideShowsByGroupChartQuery,
    SlideshowByIdQuery,
    SlideshowsQuery
} from './queries';
import {
    UpdateSlideshowMutation,
    DeleteSlideshowMutation,
    CreateSlideshowMutation
} from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateSlideshowMutation,
        DeleteSlideshowMutation,
        UpdateSlideshowMutation
    ],
    queries: [
        SlideshowsQuery,
        SlideshowByIdQuery,
        SlideShowsByGroupChartQuery
    ]
})
export class SlideshowsModule extends ModuleBase { }