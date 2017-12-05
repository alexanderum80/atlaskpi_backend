
    @injectable()
    @mutation({
        name: 'createUser',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'data', type: UserDetails },
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
    