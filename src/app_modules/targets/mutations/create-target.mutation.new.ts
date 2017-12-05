
    @injectable()
    @mutation({
        name: 'createTarget',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
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
    