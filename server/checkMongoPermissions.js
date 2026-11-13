
require("dotenv").config();
const mongoose = require("mongoose");

async function checkPermissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\n--- MongoDB Authentication Check ---");

    const status = await mongoose.connection.db.admin().command({
      connectionStatus: 1,
      showPrivileges: true,
    });

    console.log(
      "Authenticated Users:",
      JSON.stringify(status.authInfo.authenticatedUsers, null, 2)
    );

    console.log(
      "Authenticated Roles:",
      JSON.stringify(status.authInfo.authenticatedUserRoles, null, 2)
    );

    console.log("\n--- ShopNest Users Collection Check ---");

    await mongoose.connection.db
      .collection("users")
      .findOne({}, { projection: { _id: 1 } });

    console.log("SUCCESS: Can read shopnest.users");

  } catch (error) {
    console.error("DIAGNOSTIC ERROR:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkPermissions();
