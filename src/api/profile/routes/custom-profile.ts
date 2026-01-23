export default {
    routes: [
        {
            method: 'GET',
            path: '/profiles/me',
            handler: 'api::profile.profile.getMe',
            config: {
                auth: false
            },
        },
        {
            method: 'PUT',
            path: '/profiles/me',
            handler: 'api::profile.profile.updateMe',
            config: {
                auth: false
            },
        },
    ],
};
