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
    async updateMe(ctx) {
        const { userId } = ctx.query;
        const {data} = ctx.request.body;
        console.log(data)
        

        if (!userId) {
            return ctx.badRequest('User ID is required');
        }

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

        await strapi.entityService.update('api::profile.profile', profile.id, {
            data: {
                university: data.university,
                birth: data.birth,
                phone: data.phone,
            }
        });
        if (!Number.isInteger(Number(userId))) {
            return ctx.badRequest('Invalid userId');
        }

        await strapi.entityService.update('admin::user', Number(userId), {
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
            }, 
        });

        // await strapi.documents('admin::user').update({
        //     documentId: profile.user.documentId,
        //     data: {
        //         firstname: data.firstname,
        //         lastname: data.lastname,
        //         email: data.email,
        //     },                                                                          
        // });

        return { data:profile };
    },
}));
