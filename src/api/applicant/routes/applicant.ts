import { factories } from '@strapi/strapi';

export default {
    routes: [
        {
            method: 'POST',
            path: '/applicants/:id/accept',
            handler: 'api::applicant.applicant.accept',
            // config: {
            //     // auth: false, // Commented out to enable default auth behavior
            //     policies: [],
            //     middlewares: [],
            // },
            config: {
                auth: false,
            },
        },
        // The core routes
        {
            method: 'POST',
            path: '/applicants',
            handler: 'api::applicant.applicant.create',
            config: {},
        },
        {
            method: 'GET',
            path: '/applicants',
            handler: 'api::applicant.applicant.find',
            config: {},
        },
        {
            method: 'GET',
            path: '/applicants/:id',
            handler: 'api::applicant.applicant.findOne',
            config: {},
        },
    ],
};
