
    @injectable()
    @query({
        name: 'getAllChartFormats',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'details', type: PaginationDetails },
        ],
        output: { type: ChartFormatPagedQueryResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<ChartFormatPagedQueryResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<ChartFormatPagedQueryResult> {
            // TODO: Add implementation here
        }
    }
    