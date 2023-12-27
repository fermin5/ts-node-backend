import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Initialization of DB
const sequelize = new Sequelize(process.env.DATABASE_URL!, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

export default sequelize;
