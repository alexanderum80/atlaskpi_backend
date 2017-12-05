
    @injectable()
    @query({
        name: 'businessUnitById',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
        ],
        output: { type: BusinessUnit }
    })
    export class CreateBusinessUnitMutation extends MutationBase<BusinessUnit> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<BusinessUnit> {
            // TODO: Add implementation here
        }
    }
    