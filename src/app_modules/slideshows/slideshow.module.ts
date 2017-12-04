import { SlideshowsByGroupChartQuery } from './queries/slideshows-by-group.query';
import { SlideshowByIdQuery } from './queries/slideshow-by-id.query';
import { SlideshowsQuery } from './queries';
import { UpdateSlideshowMutation } from './mutations/update-slideshow.mutation';
import { DeleteSlideshowMutation } from './mutations/delete-slideshow.mutation';
import { CreateSlideshowMutation } from './mutations';
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
        SlideshowsByGroupChartQuery
    ]
})
export class SlideshowsModule extends ModuleBase { }