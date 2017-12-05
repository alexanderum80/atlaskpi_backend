
    @injectable()
    @mutation({
        name: 'deleteDepartment',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: '_id', type: String, required: true },
        ],
        output: { type: DeleteDepartmentResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<DeleteDepartmentResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<DeleteDepartmentResponse> {
            // TODO: Add implementation here
        }
    }
    