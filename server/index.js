import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
dotenv.config();
const APP = express();

const PORT = process.env.PORT || 3000;

//middlewares
APP.use(express.json());
APP.use(cookieParser());

// db connection
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("connected to database");
  })
  .catch((e) => {
    console.log(e);
  });

//server initialization
APP.listen(PORT, () => {
  console.log(`server is running @ port ${PORT}`);
});

//global middlewares for route

APP.use("/api/auth", authRoute);
