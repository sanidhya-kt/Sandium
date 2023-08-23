const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// register a user

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body; // data is fetched

  const user = await User.create({
    // data is send as object
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample id",
      url: "sampleprofile url",
    },
  });

  sendToken(user, 201, res);
});

// login user

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking/comfirming that user has given both email and password
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email and Password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email and Password", 401));
  }
  sendToken(user, 200, res);
});

// Logout user

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "logged Out Successfully",
  });
});
// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not Found", 404));
  }
  // Get reset Password Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPaswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your Password Reset Token is :- \n\n ${resetPaswordUrl} \n\n If you have not requested this Email then , Please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email Send to ${user.email} Successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetpasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password

exports.resetPasword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been Expired",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password does not match.", 404)
    );
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetpasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res); // user automatically logged in
});

//get user details

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is Incorrect.", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("confirm Password and new password does not match.", 400)
    );
  }
  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// Update user Profile

exports.userProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  // We Will ADD CLOUDINARY LATER

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
  });
});

// Get All User Detail(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get Single User Detail(admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User Does not Exist with id : ${req.params.id}`, 400)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// Update user Role -- admin

exports.UpdateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
  });
});

// Delete user--admin

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  //WE WILL REMOVE CLOUDINARY

  if (!user) {
    return next(
      new ErrorHandler(`User Does not Exist with id : ${req.params.id}`, 400)
    );
  }

  await user.remove();
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
