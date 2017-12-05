
    @injectable()
    @mutation({
        name: 'updateSlideshow',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: '_id', type: String, required: true },
            { name: 'input', type: SlideshowInput, required: true },
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
    