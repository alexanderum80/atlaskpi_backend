export const baseAuditSchema = {
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
};

export const userAuditSchema = {
    ...baseAuditSchema,
    createdBy: String,
    updatedBy: String
};