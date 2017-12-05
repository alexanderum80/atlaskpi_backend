
    @injectable()
    @mutation({
        name: 'removeTarget',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
            { name: 'owner', type: String },
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
    