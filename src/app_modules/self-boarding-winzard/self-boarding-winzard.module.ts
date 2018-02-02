import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { ListSelfBoardingWinzardQuery } from './queries/list-self-boarding-winzard.query';
import { CreateSelfBoardingWinzardMutation } from './mutations/create-self-boarding-winzard.mutation';
import { DeleteSelfBoardingWinzardRateMutation } from './mutations/delete-self-boarding-winzard.mutation';
import { UpdateSelfBoardingWinzardMutation } from './mutations/update-self-boarding-winzard.mutation';


@AppModule({
    mutations: [
        CreateSelfBoardingWinzardMutation,
        DeleteSelfBoardingWinzardRateMutation,
        UpdateSelfBoardingWinzardMutation
    ],
    queries: [
        ListSelfBoardingWinzardQuery
    ]
})
export class SelfBoardingWinzardModule extends ModuleBase { }