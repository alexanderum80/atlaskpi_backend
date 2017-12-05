
    @injectable()
    @mutation({
        name: 'deleteSlideshow',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: '_id', type: String },
        ],
        output: { type: SlideshowResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<SlideshowResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<SlideshowResponse> {
            // TODO: Add implementation here
        }
    }
    