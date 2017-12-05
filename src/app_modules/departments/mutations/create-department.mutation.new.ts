
    @injectable()
    @mutation({
        name: 'createDepartment',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'name', type: String, required: true },
            { name: 'manager', type: String },
        ],
        output: { type: CreateDepartmentResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<CreateDepartmentResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<CreateDepartmentResponse> {
            // TODO: Add implementation here
        }
    }
    