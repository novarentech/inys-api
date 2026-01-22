export default {
    routes: [
        {
            method: 'GET',
            path: '/profiles/me',
            handler: 'api::profile.profile.getMe',
            config: {
                auth: false,
                // policies: [],
                // middlewares: [],
            },
        },
    ],
};
