
    @injectable()
    @query({
        name: 'isResetPasswordTokenValid',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'token', type: String, required: true },
        ],
        output: { type: TokenVerification }
    })
    export class CreateBusinessUnitMutation extends MutationBase<TokenVerification> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<TokenVerification> {
            // TODO: Add implementation here
        }
    }
    