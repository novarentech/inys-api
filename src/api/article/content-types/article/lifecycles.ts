export default {
  async afterFindOne(event) {
    const { result } = event;
    if (!result) return;

    await strapi.db.connection('articles')
      .where({ id: result.id })
      .increment('views', 1);
  },
};
