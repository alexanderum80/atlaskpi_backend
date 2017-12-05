
    @injectable()
    @mutation({
        name: 'updateDashboard',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
            { name: 'input', type: DashboardInput, required: true },
        ],
        output: { type: DashboardResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<DashboardResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<DashboardResponse> {
            // TODO: Add implementation here
        }
    }
    