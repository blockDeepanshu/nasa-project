const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

const populateLaunches = async () => {
  console.log("Downloading launch data .....");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (!(response.status === 200)) {
    console.log(" SpaceX Launches data download failed");
    throw new Error("SpaceX Launches data download failed");
  }

  const launchDocs = response.data.docs;

  for (launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      customer: ["ISRO", "NASA"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(launch);
    console.log(`${launch.flightNumber} - ${launch.mission}`);

    await saveLaunch(launch);
  }
};

const loadLaunchesData = async () => {
  const launch = await filterLaunch({
    flightNumber: 1,
    mission: "FalconSat",
    rocket: "Falcon 1",
  });

  if (launch) {
    console.log("Launches already populated");
  } else {
    populateLaunches();
  }
};

const filterLaunch = async (filter) => {
  return await launches.findOne(filter);
};

const existLaunch = (launchId) => {
  return filterLaunch({ flightNumber: launchId });
};

const getAllLaunches = async (skip, limit) => {
  return await launches
    .find({}, "-__v -_id")
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
};

const saveLaunch = async (launch) => {
  try {
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
  const planet = await planets.findOne({
    keplerName: launch.destination,
  });

  if (!planet) {
    throw new Error("No Matching destination planet");
  }

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
};

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunch,
  deleteLaunchById,
  loadLaunchesData,
};
