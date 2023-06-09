const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const CoupounCode = require("../model/coupounCode");
const router = express.Router();

// create coupoun code
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const isCoupounCodeExists = await CoupounCode.find({
        name: req.body.name,
      });

      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }

      const coupounCode = await CoupounCode.create(req.body);

      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find({
        shopId: req.seller.id,
        status: { $in: ["active", "inactive"] },
      });

      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// router.get(
//   "/get-coupon/:id",
//   isSeller,
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const couponCodes = await CoupounCode.find({ shopId: req.seller.id });
//       res.status(201).json({
//         success: true,
//         couponCodes,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error, 400));
//     }
//   })
// );
// update coupon code
router.put(
  "/update-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOneAndUpdate(
        {
          _id: req.params.id,
          shopId: req.seller.id,
        },
        req.body,
        { new: true }
      );

      if (!couponCode) {
        return next(new ErrorHandler("Coupon code doesn't exist!", 400));
      }

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);


// delete coupoun code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOneAndDelete({
        _id: req.params.id,
        shopId: req.seller.id,
      });

      if (!couponCode) {
        return next(new ErrorHandler("Coupon code doesn't exist!", 400));
      }

      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);



// get coupon code value by its name
// router.get(
//   "/get-coupon-value/:name",
//   catchAsyncErrors(async (req, res, next) => {
//       try {
//           const couponCode = await CoupounCode.findOne({
//               name: req.params.name,
//               status: "active", // Only active coupon codes can be retrieved
//           });

//           if (!couponCode) {
//               return next(new ErrorHandler("Coupon code doesn't exist or is inactive!", 400));
//           }

//           res.status(200).json({
//               success: true,
//               couponCode,
//           });
//       } catch (error) {
//           return next(new ErrorHandler(error, 400));
//       }
//   })
// );

// router.get(
//   "/get-coupon-value/:name",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const couponCode = await CoupounCode.findOne({ name: req.params.name });

//       res.status(200).json({
//         success: true,
//         couponCode,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error, 400));
//     }
//   })
// );

router.get(
  "/get-coupon-value/:name",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });

      if (!couponCode) {
        // Coupon code not found
        return res.status(404).json({
          success: false,
          message: "Coupon code not found",
        });
      }

      if (couponCode.status !== "active") {
        // Coupon code is inactive
        return res.status(400).json({
          success: false,
          message: "Coupon code is inactive",
        });
      }

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
module.exports = router;
