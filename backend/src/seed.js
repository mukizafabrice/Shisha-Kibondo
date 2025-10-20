import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

// ⚠️ IMPORTANT: Replace these with your actual model import paths
import User from "./models/User.js";
import Product from "./models/Product.js";
import Beneficiaries from "./models/Beneficiaries.js";
import Stock from "./models/Stock.js";
import MainStock from "./models/MainStock.js";
import Distribution from "./models/Distribution.js";
// import your Mongoose connection logic here, or define it below

const { MONGO_URI } = process.env;

// --- Seed Data Generation Functions ---

// 1. Products Data
const createProductData = (count = 5) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      name: `Product ${i + 1} - ${faker.commerce.productName()}`,
      description: faker.commerce.productDescription(),
    });
  }
  return products;
};

// 2. Users Data
const createUserData = async (count = 10) => {
  const users = [];
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt); // default password for all

  // Manager User
  users.push({
    name: "Admin Manager",
    email: "manager@example.com",
    phone: "+250788123456",
    nationalId: "1198000000000001",
    password: hashedPassword,
    role: "manager",
  });

  // Umunyabuzima Users
  for (let i = 1; i <= count - 1; i++) {
    users.push({
      name: faker.person.fullName(),
      email: `umunyabuzima${i}@example.com`,
      phone: `+250788${faker.string.numeric({ length: 6 })}`,
      nationalId: `119800000000000${i + 1}`,
      password: hashedPassword,
      role: "umunyabuzima",
    });
  }
  return users;
};

// 3. Beneficiaries Data
const createBeneficiariesData = (users, count = 20) => {
  const beneficiaries = [];
  const umunyabuzimaUsers = users.filter((u) => u.role === "umunyabuzima");

  for (let i = 0; i < count; i++) {
    const randomUser = faker.helpers.arrayElement(umunyabuzimaUsers);
    beneficiaries.push({
      userId: randomUser._id,
      nationalId: `1200${faker.string.numeric({ length: 12 })}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      village: faker.location.city(),
      type: faker.helpers.arrayElement(["pregnant", "breastfeeding", "child"]),
      gender: faker.helpers.arrayElement(["male", "female"]),
      status: faker.helpers.arrayElement(["active", "inactive"]),
      admissionStatus: faker.helpers.arrayElement([
        "pending",
        "admitted",
        "rejected",
      ]),
      totalProgramDays: 100, // Example fixed value
      completedDays: faker.number.int({ min: 0, max: 100 }),
      // Attendance rate will be calculated on save/read/method call
    });
  }
  return beneficiaries;
};

// 4. MainStock Data
const createMainStockData = (products) => {
  return products.map((product) => ({
    productId: product._id,
    totalStock: faker.number.int({ min: 1000, max: 5000 }),
  }));
};

// 5. Stock (Umunyabuzima Stock) Data
const createStockData = (products, umunyabuzimaUsers) => {
  const stocks = [];
  for (const user of umunyabuzimaUsers) {
    for (const product of products) {
      stocks.push({
        userId: user._id,
        productId: product._id,
        totalStock: faker.number.int({ min: 50, max: 300 }),
      });
    }
  }
  return stocks;
};

// 6. Distribution Data
const createDistributionData = (beneficiaries, products, umunyabuzimaUsers) => {
  const distributions = [];
  for (let i = 0; i < 50; i++) {
    const randomBeneficiary = faker.helpers.arrayElement(beneficiaries);
    const randomProduct = faker.helpers.arrayElement(products);
    const randomUser = faker.helpers.arrayElement(umunyabuzimaUsers);

    // Ensure the user is the one assigned to the beneficiary
    const correctUser =
      umunyabuzimaUsers.find(
        (u) => u._id.toString() === randomBeneficiary.userId.toString()
      ) || randomUser; // fallback if beneficiary's user is not in the list

    distributions.push({
      beneficiaryId: randomBeneficiary._id,
      productId: randomProduct._id,
      quantityKg: faker.number.float({ min: 0.5, max: 2, precision: 0.1 }),
      userId: correctUser._id,
      distributionDate: faker.date.past(),
    });
  }
  return distributions;
};

// --- Main Seeder Function ---

const seedDB = async () => {
  try {
    // Connect to DB
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding!");

    // Clear existing data (optional, but good for fresh seeds)
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Beneficiaries.deleteMany({}),
      Stock.deleteMany({}),
      MainStock.deleteMany({}),
      Distribution.deleteMany({}),
    ]);
    console.log("Old data cleared.");

    // 1. Seed Products
    const productData = createProductData(5);
    const products = await Product.insertMany(productData);
    console.log(`Seeded ${products.length} Products.`);

    // 2. Seed Users
    const userData = await createUserData(10);
    const users = await User.insertMany(userData);
    const umunyabuzimaUsers = users.filter((u) => u.role === "umunyabuzima");
    console.log(`Seeded ${users.length} Users (including manager).`);

    // 3. Seed Beneficiaries
    const beneficiariesData = createBeneficiariesData(umunyabuzimaUsers, 20);
    const beneficiaries = await Beneficiaries.insertMany(beneficiariesData);
    console.log(`Seeded ${beneficiaries.length} Beneficiaries.`);

    // 4. Seed MainStock
    const mainStockData = createMainStockData(products);
    await MainStock.insertMany(mainStockData);
    console.log(`Seeded ${mainStockData.length} MainStock entries.`);

    // 5. Seed User Stock
    const stockData = createStockData(products, umunyabuzimaUsers);
    await Stock.insertMany(stockData);
    console.log(`Seeded ${stockData.length} User Stock entries.`);

    // 6. Seed Distribution
    const distributionData = createDistributionData(
      beneficiaries,
      products,
      umunyabuzimaUsers
    );
    await Distribution.insertMany(distributionData);
    console.log(`Seeded ${distributionData.length} Distribution records.`);

    console.log("Database Seeding Complete! ✅");
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected.");
  }
};

seedDB();
