
    @injectable()
    @mutation({
        name: 'updateChartFormat',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
            { name: 'data', type: ChartFormatDetails },
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
    