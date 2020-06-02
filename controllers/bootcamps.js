const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

// @Description     Get all bootcamps
// @route           GET /api/v1/bootcamps
// @access          public
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  let query;
  let reqQuery = { ...req.query };
  const removeFields = ["select", "sort"];
  removeFields.forEach((param) => delete reqQuery[param]);
  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = Bootcamp.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    console.log(fields);
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    console.log(sortBy);
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  const bootcamps = await query;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @Description     Get single bootcamp
// @route           GET /api/v1/bootcamps/:id
// @access          public
exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamps,
  });
});

// @Description     Create a bootcamp
// @route           POST /api/v1/bootcamps
// @access          private
exports.createBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @Description     Update single bootcamp
// @route           PUT /api/v1/bootcamps/:id
// @access          private
exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @Description     Delete single bootcamp
// @route           DELETE /api/v1/bootcamps/:id
// @access          private
exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

// @Description     Get Bootcamps by distance
// @route           DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access          private
exports.getBootCampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get Long. Lat from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude;
  const lat = loc[0].latitude;

  // Calculate radius
  const radius = distance / 3963; // Earth radius = 3963 miles

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
