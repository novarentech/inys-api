export default {
  async stats(ctx) {
    const { range = 'today', group = 'day' } = ctx.query;

    const now = new Date();
    let start: Date;

    if (range === 'today') {
      start = new Date();
      start.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      start = new Date(now.setDate(now.getDate() - 6));
      start.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const knex = strapi.db.connection;

    let rows;

    if (group === 'day') {
      rows = await knex('viewers')
        .select(
          knex.raw('DATE(date) as label'),
          knex.raw('SUM(count) as value')
        )
        .where('date', '>=', start)
        .groupByRaw('DATE(date)')
        .orderBy('label');
    }

    if (group === 'month') {
      rows = await knex('viewers')
        .select(
          knex.raw("DATE_FORMAT(date, '%Y-%m') as label"),
          knex.raw('SUM(count) as value')
        )
        .groupByRaw("DATE_FORMAT(date, '%Y-%m')")
        .orderBy('label');
    }

    ctx.body = rows;
  },
};
