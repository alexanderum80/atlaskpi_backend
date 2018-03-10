import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateSlideshowMutation } from './mutations/create-slideshow.mutation';
import { DeleteSlideshowMutation } from './mutations/delete-slideshow.mutation';
import { UpdateSlideshowMutation } from './mutations/update-slideshow.mutation';
import { SlideshowByIdQuery } from './queries/slideshow-by-id.query';
import { SlideShowsByGroupChartQuery } from './queries/slideshows-by-group-chart.query';
import { SlideshowsQuery } from './queries/slideshows.query';
import { SlideshowByNameQuery } from './queries/slideshow-by-name.query';


@AppModule({
    mutations: [
        CreateSlideshowMutation,
        DeleteSlideshowMutation,
        UpdateSlideshowMutation
    ],
    queries: [
        SlideshowsQuery,
        SlideshowByIdQuery,
        SlideShowsByGroupChartQuery,
        SlideshowByNameQuery
    ]
})
export class SlideshowsModule extends ModuleBase { }