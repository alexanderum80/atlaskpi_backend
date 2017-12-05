
    @injectable()
    @mutation({
        name: 'removeKPI',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
        ],
        output: { type: KPIRemoveResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<KPIRemoveResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<KPIRemoveResponse> {
            // TODO: Add implementation here
        }
    }
    