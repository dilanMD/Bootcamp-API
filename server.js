const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const errorHandler = require("./middlewares/error");
const connectDB = require("./config/db");

// Load env variables
dotenv.config({ path: "./config/config.env" });

// Connect Mongo DB
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

const app = express();

// Body parser
app.use(express.json());

// Dev Logging Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File upload middleware
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount Routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server is running ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handling UnHandled Promise Rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
