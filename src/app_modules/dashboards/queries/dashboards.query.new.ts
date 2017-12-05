
    @injectable()
    @query({
        name: 'dashboards',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'group', type: String },
        ],
        output: { type: Dashboard, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Dashboard[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Dashboard[]> {
            // TODO: Add implementation here
        }
    }
    