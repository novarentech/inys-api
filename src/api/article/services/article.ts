import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::article.article', ({ strapi }) => ({
  async find(params = {} as any) {
    return super.find({
      ...params,
      populate: {
        thumbnail: true
      },
    });
  },
  
  async findOne(entityId: any, params = {} as any) {
    return super.findOne(entityId, {
      ...params,
      populate: {
        thumbnail: true
      },
    });
  },
}));