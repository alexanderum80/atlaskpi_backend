
export class BasicRoleChecker {
    public static hasPermission(user: any, action: string, subject: string) {
        const currentUser = user._user;

        if (!currentUser) { return false; }
        const isAllowed = currentUser.roles.find(role => {
            return role.permissions.find(perm => {
                return (perm.action === action) && (perm.subject === subject);
            });
        });

        return isAllowed !== undefined;
    }
}
