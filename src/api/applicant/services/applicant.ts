import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::applicant.applicant', ({ strapi }) => ({
  async find(params = {} as any) {
    return super.find({
      ...params,
      populate: {
        cv: true,
        ...params.populate,
      },
    });
  },
  
  async findOne(entityId: any, params = {} as any) {
    return super.findOne(entityId, {
      ...params,
      populate: {
        cv: true,
        ...params.populate,
      },
    });
  },
}));