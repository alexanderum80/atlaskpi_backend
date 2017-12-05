
    @injectable()
    @mutation({
        name: 'removeRole',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
        ],
        output: { type: RoleResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<RoleResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<RoleResult> {
            // TODO: Add implementation here
        }
    }
    