
    @injectable()
    @query({
        name: 'getChartFormatById',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
        ],
        output: { type: ChartFormatQueryResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<ChartFormatQueryResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<ChartFormatQueryResult> {
            // TODO: Add implementation here
        }
    }
    