const {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunch,
  deleteLaunchById,
} = require("../../models/launches.model");

const httpGetAllLaunches = async (req, res) => {
  res.status(200).json(await getAllLaunches());
};

const httpAddNewLaunch = async (req, res) => {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.destination
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  console.log("lauch date", launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  await scheduleNewLaunch(launch);

  return res.status(201).json(launch);
};

const httpAbortLaunch = async (req, res) => {
  const launchId = +req.params.id;
  const launchExists = await existLaunch(launchId);

  if (!launchExists) {
    return res.json(400).json({
      error: "Invalid launch Id",
    });
  }

  const aborted = await deleteLaunchById(launchId);

  if (!aborted) {
    return res.status(400).json({
      error: "Failed to abort the mission",
    });
  }
  return res.status(200).json(aborted);
};

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
