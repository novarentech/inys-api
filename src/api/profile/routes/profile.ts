/**
 * profile router - custom configuration
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::profile.profile', {
    config: {
        find: {
            auth: false, // Allow public access, filtering by user ID handles security
        },
        findOne: {
            auth: false,
        },
        update: {
            auth: false, // Will add proper admin auth later
        },
    }
});
