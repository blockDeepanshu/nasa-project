const {
  getAllLaunches,
  addNewLaunch,
  existLaunch,
  deleteLaunchById,
} = require("../../models/launches.model");

const httpGetAllLaunches = (req, res) => {
  res.status(200).json(getAllLaunches());
};

const httpAddNewLaunch = (req, res) => {
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

  addNewLaunch(launch);

  return res.status(201).json(launch);
};

const httpAbortLaunch = async (req, res) => {
  const launchId = +req.params.id;

  if (!existLaunch(launchId)) {
    return res.json(400).json({
      error: "Invalid launch Id",
    });
  }

  const aborted = deleteLaunchById(launchId);
  return res.status(200).json(aborted);
};

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
