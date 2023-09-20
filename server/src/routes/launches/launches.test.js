const request = require("supertest");
const app = require("../../app");
const { connectMongoDB } = require("../../services/mongo");

describe("LAUNCHES API TESTS", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  // afterAll(async () => {
  //   await disconnectMongoDB();
  // });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "Chandryan 3",
      rocket: "vikram",
      destination: "Kepler-442 b",
      launchDate: "January 21,2030",
    };

    const launchDataWithoutDate = {
      mission: "Chandryan 3",
      rocket: "vikram",
      destination: "Kepler-442 b",
    };

    test("It should respond with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(Object.assign(completeLaunchData, { launchDate: "date" }))
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
