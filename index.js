const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoute = require("./routes/auth");
const orderRoute = require("./routes/order");
const productRoute = require("./routes/product");
const userRoute = require("./routes/user");
const checkoutRoute = require("./routes/checkout");
require("dotenv").config();
const app = express();
app.use(express.json());

// const dbURI = process.env.DB_URI;
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// // my custom routes
app.use("/api", authRoute);
app.use("/api", orderRoute);
app.use("/api", productRoute);
app.use("/api", userRoute);
app.use("/api", checkoutRoute);

const port = 5000;
app.listen(port, () => {
  console.log(`Backend server is running at port ${port}`);
});
