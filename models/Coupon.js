const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
   type: {
      type: String,
      required: true,
      enum: ['cart-wise', 'product-wise', 'bxgy'], 
   },
   details: {
      type: Object,
      required: true, 
   },
   expirationDate: {
      type: Date,
      required: true, 
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model('Coupon', couponSchema);
