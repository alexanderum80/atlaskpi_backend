
    @injectable()
    @mutation({
        name: 'updateBusinessUnit',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: '_id', type: String, required: true },
            { name: 'name', type: String, required: true },
            { name: 'serviceType', type: String },
        ],
        output: { type: UpdateBusinessUnitResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<UpdateBusinessUnitResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<UpdateBusinessUnitResponse> {
            // TODO: Add implementation here
        }
    }
    