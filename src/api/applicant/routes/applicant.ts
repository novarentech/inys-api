import { factories } from '@strapi/strapi';

export default {
    routes: [
        {
            method: 'POST',
            path: '/applicants/:id/accept',
            handler: 'api::applicant.applicant.accept',
            config: {
                auth: false, // For now, let's keep it simple, but normally you'd want some auth or middleware
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
