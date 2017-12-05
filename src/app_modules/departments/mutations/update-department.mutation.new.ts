
    @injectable()
    @mutation({
        name: 'updateDepartment',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: '_id', type: String, required: true },
            { name: 'name', type: String, required: true },
            { name: 'manager', type: String },
        ],
        output: { type: UpdateDepartmentResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<UpdateDepartmentResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<UpdateDepartmentResponse> {
            // TODO: Add implementation here
        }
    }
    