const express = require('express');
const mongoose = require('mongoose'); // Ensure mongoose is imported
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
   .connect(process.env.MONGO_URI)
   .then(() => {
      console.log('Connected to MongoDB');
      seedDatabase(); // Seed database with dummy data
   })
   .catch((error) => console.error('Error connecting to MongoDB:', error));

// Routes
const couponRoutes = require('./routes/couponRoutes');
app.use('/coupons', couponRoutes);

// Seed function (add dummy data)
const seedDatabase = async () => {
   const Coupon = require('./models/Coupon'); // Import the model where it's used

   const dummyCoupons = [
      {
         type: 'cart-wise',
         details: { threshold: 100, discount: 10 },
         expirationDate: '2024-12-31',
      },
      {
         type: 'product-wise',
         details: { product_id: 1, discount: 20 },
         expirationDate: '2024-12-31',
      },
      {
         type: 'bxgy',
         details: {
            buy_products: [
               { product_id: 1, quantity: 3 },
               { product_id: 2, quantity: 1 },
            ],
            get_products: [{ product_id: 3, quantity: 1 }],
            repition_limit: 2,
         },
         expirationDate: '2024-12-31',
      },
   ];

   try {
      const count = await Coupon.countDocuments();
      if (count === 0) {
         await Coupon.insertMany(dummyCoupons);
         console.log('Dummy coupons added to the database');
      } else {
         console.log('Database already seeded');
      }
   } catch (error) {
      console.error('Error seeding database:', error);
   }
};

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
