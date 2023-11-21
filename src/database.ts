import { Sequelize } from 'sequelize';

const database = new Sequelize(
  process.env.DATABASE_NAME as string,
  process.env.DATABASE_USER as string,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT as string),
    dialectOptions: {
      timezone: 'America/Sao_Paulo',
    },
    logging: Boolean(process.env.DATABASE_LOG),
  }
);

export default database;
