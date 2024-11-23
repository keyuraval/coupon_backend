const Coupon = require('../models/Coupon');

// Create a new coupon
exports.createCoupon = async (req, res) => {
   try {
      const coupon = new Coupon(req.body);
      await coupon.save();
      res.status(201).json(coupon);
   } catch (error) {
      res.status(400).json({ message: 'Error creating coupon', error });
   }
};

// Get all coupons
exports.getCoupons = async (req, res) => {
   try {
      const coupons = await Coupon.find();
      res.status(200).json(coupons);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching coupons', error });
   }
};

// Get a specific coupon by ID
exports.getCouponById = async (req, res) => {
   try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
      res.status(200).json(coupon);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching coupon', error });
   }
};

// Update a specific coupon
exports.updateCoupon = async (req, res) => {
   try {
      const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedCoupon) return res.status(404).json({ message: 'Coupon not found' });
      res.status(200).json(updatedCoupon);
   } catch (error) {
      res.status(500).json({ message: 'Error updating coupon', error });
   }
};

// Delete a specific coupon
exports.deleteCoupon = async (req, res) => {
   try {
      const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!deletedCoupon) return res.status(404).json({ message: 'Coupon not found' });
      res.status(200).json({ message: 'Coupon deleted successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Error deleting coupon', error });
   }
};

// Fetch applicable coupons for a cart
exports.fetchApplicableCoupons = async (req, res) => {
   try {
      const { cart } = req.body;
      const coupons = await Coupon.find();
      const applicableCoupons = [];

      for (const coupon of coupons) {
         let discount = 0;

         if (coupon.type === 'cart-wise') {
            const cartTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            if (cartTotal >= coupon.details.threshold) {
               discount = (coupon.details.discount / 100) * cartTotal;
            }
         } else if (coupon.type === 'product-wise') {
            const product = cart.items.find((item) => item.product_id === coupon.details.product_id);
            if (product) {
               discount = (coupon.details.discount / 100) * product.price * product.quantity;
            }
         } else if (coupon.type === 'bxgy') {
            const buyProducts = coupon.details.buy_products;
            const getProducts = coupon.details.get_products;
            const repetitionLimit = coupon.details.repition_limit;

            let eligibleRepetitions = Math.min(
               ...buyProducts.map((buy) => {
                  const cartItem = cart.items.find((item) => item.product_id === buy.product_id);
                  return cartItem ? Math.floor(cartItem.quantity / buy.quantity) : 0;
               })
            );

            eligibleRepetitions = Math.min(eligibleRepetitions, repetitionLimit);

            discount = eligibleRepetitions * getProducts.reduce((sum, get) => {
               const cartItem = cart.items.find((item) => item.product_id === get.product_id);
               return sum + (cartItem ? get.quantity * cartItem.price : 0);
            }, 0);
         }

         if (discount > 0) {
            applicableCoupons.push({ coupon_id: coupon._id, type: coupon.type, discount });
         }
      }

      res.status(200).json({ applicable_coupons: applicableCoupons });
   } catch (error) {
      res.status(500).json({ message: 'Error fetching applicable coupons', error });
   }
};

// Apply a specific coupon to a cart
exports.applyCoupon = async (req, res) => {
   try {
      const { id } = req.params; // Coupon ID
      const { cart } = req.body; // Cart details

      const coupon = await Coupon.findById(id);
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

      const cartTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      let totalDiscount = 0;

      if (coupon.type === 'cart-wise') {
         if (cartTotal >= coupon.details.threshold) {
            totalDiscount = (coupon.details.discount / 100) * cartTotal;
         }
      } else if (coupon.type === 'product-wise') {
         totalDiscount = cartTotal * (coupon.details.discount / 100); // Apply discount to entire cart
      } else if (coupon.type === 'bxgy') {
         const buyProducts = coupon.details.buy_products;
         const getProducts = coupon.details.get_products;
         const repetitionLimit = coupon.details.repition_limit;

         let eligibleRepetitions = Math.min(
            ...buyProducts.map((buy) => {
               const cartItem = cart.items.find((item) => item.product_id === buy.product_id);
               return cartItem ? Math.floor(cartItem.quantity / buy.quantity) : 0;
            })
         );

         eligibleRepetitions = Math.min(eligibleRepetitions, repetitionLimit);

         totalDiscount = eligibleRepetitions * getProducts.reduce((sum, get) => {
            const cartItem = cart.items.find((item) => item.product_id === get.product_id);
            return sum + (cartItem ? get.quantity * cartItem.price : 0);
         }, 0);
      }

      res.status(200).json({
         cartTotal,
         totalDiscount,
         finalPrice: cartTotal - totalDiscount,
         appliedCoupon: coupon,
      });
   } catch (error) {
      res.status(500).json({ message: 'Error applying coupon', error });
   }
};
