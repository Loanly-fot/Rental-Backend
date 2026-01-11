require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Equipment = require("./src/models/Equipment");
const Rental = require("./src/models/Rental");
const Payment = require("./src/models/Payment");
const Delivery = require("./src/models/Delivery");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/rental_system"
    );
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Rental.deleteMany({});
    await Payment.deleteMany({});
    await Delivery.deleteMany({});

    // Create users
    console.log("👤 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@rental.com",
      password: hashedPassword,
      role: "admin",
      phone: "+1 (555) 123-4567",
      address: "123 Admin St, Rental City, RC 12345",
    });

    const user1 = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      role: "user",
      phone: "+1 (555) 234-5678",
      address: "456 Main St, Rental City, RC 12346",
    });

    const user2 = await User.create({
      name: "Jane Smith",
      email: "jane@example.com",
      password: hashedPassword,
      role: "user",
      phone: "+1 (555) 345-6789",
      address: "789 Oak Ave, Rental City, RC 12347",
    });

    const delivery1 = await User.create({
      name: "Delivery Driver 1",
      email: "delivery@rental.com",
      password: hashedPassword,
      role: "delivery",
      phone: "+1 (555) 456-7890",
      address: "321 Delivery Ln, Rental City, RC 12348",
    });

    console.log("✅ Users created");

    // Create equipment
    console.log("🔧 Creating equipment...");
    const equipment1 = await Equipment.create({
      name: "Power Drill",
      category: "Power Tools",
      description: "Professional cordless power drill with battery",
      quantity: 5,
      dailyRate: 15.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "power-drill.jpg",
    });

    const equipment2 = await Equipment.create({
      name: "Circular Saw",
      category: "Power Tools",
      description: "7-1/4 inch circular saw with laser guide",
      quantity: 3,
      dailyRate: 25.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "circular-saw.jpg",
    });

    const equipment3 = await Equipment.create({
      name: "Ladder (12ft)",
      category: "Outdoor Equipment",
      description: "Aluminum extension ladder",
      quantity: 8,
      dailyRate: 10.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "ladder.jpg",
    });

    const equipment4 = await Equipment.create({
      name: "Paint Sprayer",
      category: "Others",
      customCategory: "Painting Equipment",
      description: "Electric paint sprayer with hose",
      quantity: 4,
      dailyRate: 30.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "paint-sprayer.jpg",
    });

    const equipment5 = await Equipment.create({
      name: "Generator (5000W)",
      category: "Others",
      customCategory: "Generators",
      description: "Portable gas generator",
      quantity: 2,
      dailyRate: 50.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "generator.jpg",
    });

    const equipment6 = await Equipment.create({
      name: "Pressure Washer",
      category: "Cleaning Equipment",
      description: "3000 PSI electric pressure washer",
      quantity: 6,
      dailyRate: 35.0,
      status: "available",
      createdBy: user1._id,
      approved: false,
      image: "pressure-washer.jpg",
    });

    const equipment7 = await Equipment.create({
      name: "Hammer Drill",
      category: "Power Tools",
      description: "SDS+ hammer drill for concrete and masonry",
      quantity: 4,
      dailyRate: 20.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "hammer-drill.jpg",
    });

    const equipment8 = await Equipment.create({
      name: "Jigsaw",
      category: "Power Tools",
      description: "Variable speed orbital jigsaw",
      quantity: 5,
      dailyRate: 12.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "jigsaw.jpg",
    });

    const equipment9 = await Equipment.create({
      name: "Angle Grinder",
      category: "Power Tools",
      description: "4.5 inch angle grinder with accessories",
      quantity: 3,
      dailyRate: 18.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "angle-grinder.jpg",
    });

    const equipment10 = await Equipment.create({
      name: "Impact Driver",
      category: "Power Tools",
      description: "Cordless impact driver with battery",
      quantity: 7,
      dailyRate: 14.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "impact-driver.jpg",
    });

    const equipment11 = await Equipment.create({
      name: "Air Compressor",
      category: "Power Tools",
      description: "Portable 6-gallon air compressor",
      quantity: 4,
      dailyRate: 22.0,
      status: "available",
      createdBy: user1._id,
      approved: true,
      approvedBy: admin._id,
      image: "air-compressor.jpg",
    });

    const equipment12 = await Equipment.create({
      name: "Orbital Sander",
      category: "Power Tools",
      description: "Random orbital sander for wood finishing",
      quantity: 5,
      dailyRate: 16.0,
      status: "maintenance",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "orbital-sander.jpg",
    });

    const equipment13 = await Equipment.create({
      name: "Table Saw",
      category: "Power Tools",
      description: "10-inch contractor table saw",
      quantity: 2,
      dailyRate: 45.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "table-saw.jpg",
    });

    const equipment14 = await Equipment.create({
      name: "Brad Nailer",
      category: "Hand Tools",
      description: "Pneumatic 18-gauge brad nailer",
      quantity: 6,
      dailyRate: 10.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "brad-nailer.jpg",
    });

    const equipment15 = await Equipment.create({
      name: "Caulk Gun",
      category: "Hand Tools",
      description: "Professional grade caulk gun",
      quantity: 8,
      dailyRate: 5.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "caulk-gun.jpg",
    });

    const equipment16 = await Equipment.create({
      name: "Power Level Laser",
      category: "Measuring Equipment",
      description: "Green laser level with self-leveling",
      quantity: 3,
      dailyRate: 25.0,
      status: "available",
      createdBy: user1._id,
      approved: true,
      approvedBy: admin._id,
      image: "laser-level.jpg",
    });

    const equipment17 = await Equipment.create({
      name: "Digital Multimeter",
      category: "Measuring Equipment",
      description: "Auto-ranging digital multimeter",
      quantity: 5,
      dailyRate: 8.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "multimeter.jpg",
    });

    const equipment18 = await Equipment.create({
      name: "Safety Harness Kit",
      category: "Safety Equipment",
      description: "Complete fall protection harness system",
      quantity: 10,
      dailyRate: 12.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "safety-harness.jpg",
    });

    const equipment19 = await Equipment.create({
      name: "Scaffolding (10ft)",
      category: "Outdoor Equipment",
      description: "Aluminum scaffolding system",
      quantity: 2,
      dailyRate: 60.0,
      status: "available",
      createdBy: admin._id,
      approved: true,
      approvedBy: admin._id,
      image: "scaffolding.jpg",
    });

    const equipment20 = await Equipment.create({
      name: "Work Light Stand",
      category: "Outdoor Equipment",
      description: "Tripod work light with halogen bulb",
      quantity: 7,
      dailyRate: 15.0,
      status: "available",
      createdBy: user1._id,
      approved: false,
      image: "work-light.jpg",
    });

    console.log("✅ Equipment created");

    // Create some rentals
    console.log("📦 Creating rentals...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Rental.create({
      equipmentId: equipment1._id,
      userId: user1._id,
      startDate: today,
      endDate: nextWeek,
      quantity: 1,
      totalCost: 105.0,
      status: "active",
    });

    await Rental.create({
      equipmentId: equipment2._id,
      userId: user2._id,
      startDate: tomorrow,
      endDate: nextWeek,
      quantity: 1,
      totalCost: 150.0,
      status: "pending",
    });

    await Rental.create({
      equipmentId: equipment3._id,
      userId: user1._id,
      startDate: yesterday,
      endDate: today,
      quantity: 2,
      totalCost: 20.0,
      status: "completed",
    });

    console.log("✅ Rentals created");

    // Create payments
    console.log("💳 Creating payments...");
    const rental1 = await Rental.findOne({ equipmentId: equipment1._id });
    const rental2 = await Rental.findOne({ equipmentId: equipment2._id });
    const rental3 = await Rental.findOne({ equipmentId: equipment3._id });

    await Payment.create({
      rentalId: rental3._id,
      userId: user1._id,
      amount: 20.0,
      method: "card",
      status: "completed",
      transactionId: "TXN001",
      notes: "Payment for ladder rental",
      processedAt: new Date(),
    });

    await Payment.create({
      rentalId: rental1._id,
      userId: user1._id,
      amount: 105.0,
      method: "card",
      status: "completed",
      transactionId: "TXN002",
      notes: "Payment for power drill rental",
      processedAt: new Date(),
    });

    await Payment.create({
      rentalId: rental2._id,
      userId: user2._id,
      amount: 150.0,
      method: "cash",
      status: "pending",
      notes: "Cash payment pending",
    });

    console.log("✅ Payments created");

    // Create deliveries
    console.log("🚚 Creating deliveries...");
    await Delivery.create({
      rentalId: rental1._id,
      deliveryPersonId: delivery1._id,
      address: "123 Main St, City, State 12345",
      status: "assigned",
      deliveryNotes: "Deliver to front desk",
    });

    await Delivery.create({
      rentalId: rental2._id,
      deliveryPersonId: delivery1._id,
      address: "456 Oak Ave, City, State 12345",
      status: "assigned",
      deliveryNotes: "Customer will be home after 2 PM",
    });

    console.log("✅ Deliveries created");

    console.log("\n📊 Database seeded successfully!");
    console.log("\n🔑 Login credentials (all users):");
    console.log("   Password: password123\n");
    console.log("👤 Admin:    admin@rental.com");
    console.log("👤 User 1:   john@example.com");
    console.log("👤 User 2:   jane@example.com");
    console.log("🚚 Delivery: delivery@rental.com");
    console.log("\n📈 Sample Data:");
    console.log("   Users: 4");
    console.log("   Equipment: 20");
    console.log("   Rentals: 3");
    console.log("   Payments: 3");
    console.log("   Deliveries: 2");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();
