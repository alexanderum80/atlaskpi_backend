
    @injectable()
    @mutation({
        name: 'resetPassword',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'token', type: String, required: true },
            { name: 'password', type: String, required: true },
            { name: 'profile', type: InputUserProfile },
            { name: 'enrollment', type: Boolean },
        ],
        output: { type: ResetPasswordResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<ResetPasswordResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<ResetPasswordResult> {
            // TODO: Add implementation here
        }
    }
    