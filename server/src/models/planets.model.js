const { parse } = require("csv-parse");

const fs = require("fs");
const path = require("path");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

const loadPlanetsData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "src", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          //console.log(data);
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const totalPlanets = (await getAllPlanets()).length;
        console.log(`Total ${totalPlanets} habitable planets are found`);
        resolve();
      });
  });
};

const getAllPlanets = () => {
  return planets.find({}, "-__v -_id");
};

const savePlanet = async (planet) => {
  try {
    const planetFound = await planets.findOneAndUpdate(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
