
    @injectable()
    @query({
        name: 'dashboard',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
        ],
        output: { type: Dashboard }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Dashboard> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Dashboard> {
            // TODO: Add implementation here
        }
    }
    