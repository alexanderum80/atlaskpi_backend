export const initialRoles  = {
    admin: [
            ['create', 'Post'],
            ['read', 'Post'],
            ['update', 'Post'],
            ['delete', 'Post']
        ],
        semiAdmin: [
            // we can also specify permissions as an object
            { action: 'read', subject: 'Post' }
        ],
        manager: [
            ['create', 'Post'],
        ],
        supervisor: [
            ['create', 'Post'],
        ],
        externalUser: [
            ['create', 'Post'],
        ],
        viewer: [
            ['create', 'Post'],
        ]
};
