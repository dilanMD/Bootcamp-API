const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

// @Description     Get all bootcamps
// @route           GET /api/v1/bootcamps
// @access          public
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  bootcamp.remove();

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

// @Description     Upload File
// @route           PUT /api/v1/bootcamps/:id/photo
// @access          Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }

  // File exist validation
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Image type validation
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // File size upload
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} size`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(
        new ErrorResponse(`Problem occured while uploading image`, 400)
      );
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
  console.log(file.name);
});
