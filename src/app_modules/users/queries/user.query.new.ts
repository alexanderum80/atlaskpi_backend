
    @injectable()
    @query({
        name: 'User',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String },
        ],
        output: { type: User }
    })
    export class CreateBusinessUnitMutation extends MutationBase<User> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<User> {
            // TODO: Add implementation here
        }
    }
    