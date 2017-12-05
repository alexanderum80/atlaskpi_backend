
    @injectable()
    @query({
        name: 'findAllRoles',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'filter', type: String },
        ],
        output: { type: RoleList, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<RoleList[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<RoleList[]> {
            // TODO: Add implementation here
        }
    }
    