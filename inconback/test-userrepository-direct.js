require('dotenv').config();
const userRepository = require("./src/repositories/user.repository");

async function testUserRepositoryDirect() {
  try {
    console.log("Testing UserRepository.getUserContratista() directly...");
    
    const contractors = await userRepository.getUserContratista();
    console.log("✅ getUserContratista() successful!");
    console.log("Found contractors:", contractors.map(c => ({
      id: c.id,
      names: c.names,
      apellido_p: c.apellido_p,
      apellido_m: c.apellido_m
    })));
    
  } catch (error) {
    console.error("❌ Error occurred:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

testUserRepositoryDirect();