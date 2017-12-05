
    @injectable()
    @mutation({
        name: 'removeMobileDevice',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'network', type: String, required: true },
            { name: 'token', type: String, required: true },
        ],
        output: { type: Boolean }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Boolean> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Boolean> {
            // TODO: Add implementation here
        }
    }
    