// src/api/landingpage/content-types/landingpage/lifecycles.ts
export default {
  async afterFindOne() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const existing = await strapi.db
        .query('api::viewer.viewer')
        .findOne({
          where: {
            date: { $eq: today },
          },
        });

      if (existing) {
        await strapi.db
          .query('api::viewer.viewer')
          .update({
            where: { id: existing.id },
            data: { count: existing.count + 1 },
          });
      } else {
        await strapi.db
          .query('api::viewer.viewer')
          .create({
            data: {
              date: today,
              count: 1,
            },
          });
      }
    } catch (err) {
      strapi.log.error('Landingpage view tracking failed', err);
    }
  },
};
