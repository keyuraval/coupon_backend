const express = require('express');
const {
   createCoupon,
   getCoupons,
   getCouponById,
   updateCoupon,
   deleteCoupon,
   fetchApplicableCoupons,
   applyCoupon,
} = require('../controllers/couponController'); // Ensure correct relative path

const router = express.Router();

router.post('/', createCoupon); // Create a new coupon
router.get('/', getCoupons); // Get all coupons
router.get('/:id', getCouponById); // Get a coupon by ID
router.put('/:id', updateCoupon); // Update a coupon by ID
router.delete('/:id', deleteCoupon); // Delete a coupon by ID

router.post('/applicable-coupons', fetchApplicableCoupons); // Get applicable coupons for a cart
router.post('/apply-coupon/:id', applyCoupon); // Apply a selected coupon

module.exports = router;
