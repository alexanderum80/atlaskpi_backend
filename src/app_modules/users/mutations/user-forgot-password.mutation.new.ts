
    @injectable()
    @mutation({
        name: 'userForgotPassword',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'email', type: String, required: true },
        ],
        output: { type: ForgotPasswordResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<ForgotPasswordResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<ForgotPasswordResult> {
            // TODO: Add implementation here
        }
    }
    