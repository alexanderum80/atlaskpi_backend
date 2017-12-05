
    @injectable()
    @mutation({
        name: 'createBusinessUnit',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'name', type: String, required: true },
            { name: 'serviceType', type: String },
        ],
        output: { type: CreateBusinessUnitResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<CreateBusinessUnitResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<CreateBusinessUnitResponse> {
            // TODO: Add implementation here
        }
    }
    