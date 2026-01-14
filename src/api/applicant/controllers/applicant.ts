import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::applicant.applicant', ({ strapi }) => ({
    async accept(ctx) {
        const { id } = ctx.params;

        // 1. Fetch applicant
        const applicant = await strapi.entityService.findOne('api::applicant.applicant', id);

        if (!applicant) {
            return ctx.notFound('Applicant not found');
        }

        if (applicant.accepted) {
            return ctx.badRequest('Applicant already accepted');
        }

        // 2. Find the "Author" role (Admin Role)
        const authorRole = await strapi.query('admin::role').findOne({
            where: { name: { $eq: 'Author' } }
        });
        console.log((await strapi.query('admin::role').findMany()));

        if (!authorRole) {
            return ctx.badRequest('Author role not found in admin roles. Please ensure a role with "Author" exists.');
        }

        // 3. Create Admin User
        // Split name into firstname and lastname (admin user requires both)
        const nameParts = applicant.name.split(' ');
        const firstname = nameParts[0];
        const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

        const newUser = await strapi.service('admin::user').create({
            email: applicant.email,
            firstname: firstname,
            lastname: lastname,
            password: 'password',
            roles: [authorRole.id],
            isActive: true,
        });

        // 4. Create Profile
        // The Profile schema defines a relation to "admin::user", so we link the new admin user.
        const profile = await strapi.entityService.create('api::profile.profile', {
            data: {
                university: applicant.university,
                birth: applicant.birth,
                user: newUser.id,
            },
        });

        // 5. Update Applicant
        const updatedApplicant = await strapi.entityService.update('api::applicant.applicant', id, {
            data: {
                accepted: true,
            },
        });

        return {
            data: updatedApplicant,
            user: newUser,
            profile: profile,
        };
    },
}));
