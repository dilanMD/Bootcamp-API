const Bootcamp = require("../models/Bootcamp");

// @Description     Get all bootcamps
// @route           GET /api/v1/bootcamps
// @access          public
exports.getBootCamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Show all bootcamps" });
};

// @Description     Get single bootcamp
// @route           GET /api/v1/bootcamps/:id
// @access          public
exports.getBootCamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

// @Description     Create a bootcamp
// @route           POST /api/v1/bootcamps
// @access          private
exports.createBootCamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });

  console.log(bootcamp);
};

// @Description     Update single bootcamp
// @route           PUT /api/v1/bootcamps/:id
// @access          private
exports.updateBootCamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @Description     Delete single bootcamp
// @route           DELETE /api/v1/bootcamps/:id
// @access          private
exports.deleteBootCamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
