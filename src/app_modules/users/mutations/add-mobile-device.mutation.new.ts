
    @injectable()
    @mutation({
        name: 'addMobileDevice',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'details', type: AddMobileDeviceDetails, required: true },
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
    