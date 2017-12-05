
    @injectable()
    @mutation({
        name: 'deleteBusinessUnit',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: '_id', type: String, required: true },
        ],
        output: { type: DeleteBusinessUnitResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<DeleteBusinessUnitResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<DeleteBusinessUnitResponse> {
            // TODO: Add implementation here
        }
    }
    