import mongoose from "mongoose";
import env, { mongoUri as MONGO_URI } from "./config/env.js";
import User from "./models/User.js";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const adminName = env.admin.name;
    const adminEmail = env.admin.email;
    const adminPassword = env.admin.password;
    const adminMobile = env.admin.mobile;

    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log("ℹ️  Admin user already exists, updating password...");
      existing.password = adminPassword;
      existing.name = adminName;
      existing.mobile = adminMobile;
      await existing.save();
      console.log("✅ Admin user updated");
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        mobile: adminMobile,
      });
      console.log("✅ Admin user created");
    }

    console.log(`\n📋 Admin credentials:`);
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Name:     ${adminName}`);
    console.log(`   Mobile:   ${adminMobile}`);

    await mongoose.disconnect();
    console.log("\n✨ Seed complete");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
