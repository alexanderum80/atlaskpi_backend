export interface IBaseAudit {
    createdOn: Date;
    updatedOn?: Date;
}

export interface IUserAudit extends IBaseAudit {
    createdBy: string;
    updatedBy?: string;
}
