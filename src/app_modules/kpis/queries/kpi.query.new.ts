
    @injectable()
    @query({
        name: 'kpi',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
        ],
        output: { type: KPI }
    })
    export class CreateBusinessUnitMutation extends MutationBase<KPI> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<KPI> {
            // TODO: Add implementation here
        }
    }
    