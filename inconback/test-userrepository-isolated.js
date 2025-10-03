require('dotenv').config();
const { sequelize } = require("./src/config/sequelize-config");

async function testUserRepositoryIssue() {
  try {
    console.log("Testing sequelize models directly...");
    
    // Test 1: Check if sequelize is properly initialized
    console.log("\n1. Testing sequelize connection...");
    await sequelize.authenticate();
    console.log("✅ Sequelize connection successful");
    
    // Test 2: Check if models are loaded
    console.log("\n2. Checking available models...");
    console.log("Available models:", Object.keys(sequelize.models));
    
    // Test 3: Test the exact query from getUserContratista
    console.log("\n3. Testing getUserContratista logic step by step...");
    
    // Step 3a: Find contratista role
    console.log("3a. Finding contratista role...");
    const roles = await sequelize.models.Rol.findAll({
      where: {
        name: "contratista",
      },
      attributes: ["id", "name"],
    });
    console.log("Found roles:", roles.map(r => ({ id: r.id, name: r.name })));
    
    if (roles.length === 0) {
      console.log("❌ No contratista role found");
      return;
    }
    
    // Step 3b: Find user-role relationships
    console.log("3b. Finding user-role relationships...");
    const roleIds = roles.map((role) => role.id);
    console.log("Role IDs to search:", roleIds);
    
    const user_roles = await sequelize.models.UserRol.findAll({
      where: {
        rolId: roleIds,
      },
      attributes: ["userId", "rolId"],
    });
    console.log("Found user_roles:", user_roles.map(ur => ({ userId: ur.userId, rolId: ur.rolId })));
    
    if (user_roles.length === 0) {
      console.log("❌ No user-role relationships found");
      return;
    }
    
    // Step 3c: Find users
    console.log("3c. Finding users...");
    const userIds = user_roles.map((user_role) => user_role.userId);
    console.log("User IDs to search:", userIds);
    
    const users = await sequelize.models.User.findAll({
      where: {
        id: userIds,
      },
      attributes: ["id", "names", "apellido_p", "apellido_m"],
    });
    console.log("Found users:", users.map(u => ({ 
      id: u.id, 
      names: u.names, 
      apellido_p: u.apellido_p, 
      apellido_m: u.apellido_m 
    })));
    
    console.log("\n✅ All steps completed successfully!");
    
  } catch (error) {
    console.error("❌ Error occurred:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    await sequelize.close();
  }
}

testUserRepositoryIssue();