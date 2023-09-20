const http = require("http");

require("dotenv").config();

const app = require("./app");
const { loadPlanetsData } = require("./models/planets.model");
const { connectMongoDB } = require("./services/mongo");
const { loadLaunchesData } = require("./models/launches.model");

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectMongoDB();
  await loadLaunchesData();
  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`Server is running 🚀 on port ${PORT} `);
  });
};

startServer();
