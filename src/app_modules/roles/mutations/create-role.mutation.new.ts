
    @injectable()
    @mutation({
        name: 'createRole',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
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
    