
    @injectable()
    @mutation({
        name: 'removeTargetFromChart',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
        ],
        output: { type: TargetRemoveResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<TargetRemoveResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<TargetRemoveResult> {
            // TODO: Add implementation here
        }
    }
    