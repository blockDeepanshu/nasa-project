const mongoose = require("mongoose");

const MONGO_URL = `mongodb+srv://chauhandeepanshu336:GaZHLvQLQ0FRzs1v@cluster0.47qksxn.mongodb.net/nasa?retryWrites=true&w=majority`;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const connectMongoDB = async () => {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const disconnectMongoDB = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
};
