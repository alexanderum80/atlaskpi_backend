import { UserAttachmentsService } from '../../../services/attachments/user-attachments.service';
import { IAttachementsService } from '../../../services/attachments/base-attachments.service';
import { AttachmentTypeEnum } from '../../../domain/app/attachments/attachment';
import { IWebRequestContainerDetails } from '../../../framework/di/bridge-container';

export function getAttachmentsProcessor(
    instance: IWebRequestContainerDetails,
    type: AttachmentTypeEnum): IAttachementsService {
    switch (type) {
        case AttachmentTypeEnum.ProfilePicture:
            return instance.instance.get(UserAttachmentsService.name);
        default:
            return null;
    }
}