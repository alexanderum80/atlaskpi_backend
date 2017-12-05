
    @injectable()
    @query({
        name: 'dateRanges',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'filter', type: String },
        ],
        output: { type: DateRangeResponse, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<DateRangeResponse[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<DateRangeResponse[]> {
            // TODO: Add implementation here
        }
    }
    