const app = require("./app");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("Shutting down the Server due to Uncaught Excetion");
  process.exit(1);
});

//config file

dotenv.config({ path: "backend/config/config.env" });

//connect to Database

connectDatabase();

const DB_server = app.listen(process.env.PORT, () => {
  console.log(`server is working on http://localhost:${process.env.PORT}`);
});

//unhandle Promise rejection exception

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Error : ${err.stack}`);
  console.log("Shutting down the Server due to unhandle promise rejection");

  DB_server.close(() => {
    process.exit(1);
  });
});
