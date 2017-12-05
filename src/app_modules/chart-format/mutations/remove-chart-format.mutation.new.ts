
    @injectable()
    @mutation({
        name: 'removeChartFormat',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
        ],
        output: { type: ChartFormatMutationResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<ChartFormatMutationResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<ChartFormatMutationResult> {
            // TODO: Add implementation here
        }
    }
    