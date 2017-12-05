
    @injectable()
    @mutation({
        name: 'removeUser',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
        ],
        output: { type: CreateUserResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<CreateUserResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<CreateUserResult> {
            // TODO: Add implementation here
        }
    }
    