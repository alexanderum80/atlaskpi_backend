
    @injectable()
    @mutation({
        name: 'updateRole',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
            { name: 'data', type: RoleDetailsInput },
        ],
        output: { type: Role }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Role> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Role> {
            // TODO: Add implementation here
        }
    }
    