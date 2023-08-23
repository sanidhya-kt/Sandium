const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //Cast Error(Wrong Mongo Db id Error)
  if (err.name === "CastError") {
    const message = `Resources not found.Invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongose Dublicate key Error
  if (err.code === 11000) {
    const message = `Dublicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }
  // Wrong JWT error
  if (err.code === "JsonWebTokenError") {
    const message = "Json Web Token is Invalid, Please try again.";
    err = new ErrorHandler(message, 400);
  }

  // JWT Expire Error
  if (err.code === "TokenExpiredError") {
    const message = "Json Web Token is Expired, Please try again.";
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // error : err.stack,
  });
};
