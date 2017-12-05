
    @injectable()
    @mutation({
        name: 'createChartFormat',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'details', type: ChartFormatDetails },
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
    