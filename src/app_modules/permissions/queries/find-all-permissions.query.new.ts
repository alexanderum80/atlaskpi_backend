
    @injectable()
    @query({
        name: 'findAllPermissions',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'filter', type: String },
        ],
        output: { type: IPermissionInfo, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<IPermissionInfo[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<IPermissionInfo[]> {
            // TODO: Add implementation here
        }
    }
    