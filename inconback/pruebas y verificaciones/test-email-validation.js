const Joi = require('joi');

// Esquema de validación de email como está definido en el sistema
const emailSchema = Joi.string().email().max(255).required();

const testEmails = [
    'superadmin@sistema.interno',
    'superadmin@sistema.com',
    'superadmin@localhost',
    'superadmin@example.com',
    'test@test.test',
    'admin@admin.local'
];

console.log('Probando validación de emails:\n');

testEmails.forEach(email => {
    const result = emailSchema.validate(email);
    console.log(`Email: ${email}`);
    console.log(`Válido: ${!result.error}`);
    if (result.error) {
        console.log(`Error: ${result.error.message}`);
    }
    console.log('---');
});