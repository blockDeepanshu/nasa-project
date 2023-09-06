const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27,2030"),
  destination: "Kepler-442 b",
  customer: ["ISRO", "NASA"],
  upcoming: true,
  success: true,
};

const existLaunch = (launchId) => {
  return launches.findOne({ flightNumber: launchId });
};

const getAllLaunches = async () => {
  return await launches.find({}, "-__v -_id");
};

const saveLaunch = async (launch) => {
  try {
    const planet = await planets.findOne({
      keplerName: launch.destination,
    });

    if (!planet) {
      throw new Error("No Matching destination planet");
    }

    await launches.findOneAndUpdate(
      {
        flightNumber: launch.flightNumber,
      },
      launch,
      { upsert: true }
    );
  } catch (error) {
    console.log(error);
  }
};

const getLatestFlightNumber = async () => {
  const latestFlight = await launches.findOne().sort("-flightNumber");

  if (!latestFlight) {
    return 100;
  }

  return latestFlight.flightNumber;
};

const scheduleNewLaunch = async (launch) => {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customer: ["ISRO", "NASA"],
    upcoming: true,
    success: true,
  });

  await saveLaunch(newLaunch);
};

const deleteLaunchById = async (launchId) => {
  try {
    console.log(launchId);
    const aborted = await launches.updateOne(
      {
        flightNumber: launchId,
      },
      {
        upcoming: false,
        success: false,
      }
    );

    console.log(aborted);

    return aborted.acknowledged && aborted.modifiedCount === 1;
  } catch (error) {
    console.log(error);
  }

  // const aborted = launches.get(launchId);
  // aborted.success = false;
  // aborted.upcoming = false;
  // return aborted;
};

saveLaunch(launch);

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunch,
  deleteLaunchById,
};
