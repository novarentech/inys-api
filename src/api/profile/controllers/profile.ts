/**
 * profile controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::profile.profile', ({ strapi }) => ({
    async getMe(ctx) {
        const { userId } = ctx.query;

        if (!userId) {
            return ctx.badRequest('User ID is required');
        }

        // Entity Service handles the profiles_user_lnk join automatically
        // when we filter by the relation attribute 'admin_user'
        const profiles = await strapi.entityService.findMany('api::profile.profile', {
            filters: {
                user: {
                    id: userId
                }
            },
            populate: {
                avatar: true,
                user: true,
            },
            limit: 1,
        });

        const profile = profiles[0];

        if (!profile) {
            return ctx.notFound('Profile not found matching this admin user');
        }

        return { data: profile };
    },
}));
