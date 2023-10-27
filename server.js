const dotenv = require("dotenv");
const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");

process.on("uncaughtException", (e) => {
  console.error(e.name);
  console.error(e.message);
  console.error("Server is shutting down.");

  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const server = http.createServer(app);

server.listen(process.env.PORT, () =>
  console.log(`Server is running on PORT ${process.env.PORT}`)
);

(async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connection to the database successful.");
  } catch (e) {
    console.error(e);
    console.error("Connection to the database failed.");
  }
})();

process.on("unhandledRejection", (e) => {
  console.error(e.name);
  console.error(e.message);

  server.close(() => process.exit(1));
});
