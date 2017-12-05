
    @injectable()
    @mutation({
        name: 'createKPI',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'input', type: KPIAttributesInput },
        ],
        output: { type: KPIMutationResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<KPIMutationResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<KPIMutationResponse> {
            // TODO: Add implementation here
        }
    }
    