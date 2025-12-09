// import dotenv from "dotenv";
// dotenv.config();

// export default {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST || "127.0.0.1",
//     dialect: "postgres",
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "postgres",
//   }
// };

import dotenv from "dotenv";
dotenv.config();


export default {
  production: {
    url: `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}/${process.env.PGDATABASE}?sslmode=require&channel_binding=require`,
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  },
};


