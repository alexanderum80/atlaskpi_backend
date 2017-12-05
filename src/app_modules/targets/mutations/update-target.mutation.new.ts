
    @injectable()
    @mutation({
        name: 'updateTarget',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
            { name: 'data', type: TargetInput },
        ],
        output: { type: TargetResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<TargetResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<TargetResult> {
            // TODO: Add implementation here
        }
    }
    