
    @injectable()
    @query({
        name: 'departmentById',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
        ],
        output: { type: Department }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Department> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Department> {
            // TODO: Add implementation here
        }
    }
    