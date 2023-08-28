const { getAllPlanets } = require("../../models/planets.model");

const httpGetAllPlanets = (req, res) => {
  return res.status(200).json({
    status: "success",
    data: getAllPlanets(),
  });
};

module.exports = {
  httpGetAllPlanets,
};
