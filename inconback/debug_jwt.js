const jwt = require('jsonwebtoken');
require('dotenv').config();

// Script para decodificar JWT y verificar roles
console.log('=== DEBUG JWT SUPERADMIN ===\n');

// Función para decodificar un token
function decodeToken(token) {
    try {
        // Remover "Bearer " si está presente
        const cleanToken = token.replace('Bearer ', '');
        
        // Decodificar sin verificar (para debug)
        const decoded = jwt.decode(cleanToken);
        console.log('Token decodificado (sin verificar):');
        console.log(JSON.stringify(decoded, null, 2));
        
        // Verificar con secret
        const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
        console.log('\nToken verificado:');
        console.log(JSON.stringify(verified, null, 2));
        
        // Verificar roles específicamente
        console.log('\n=== ANÁLISIS DE ROLES ===');
        console.log('Tipo de rol:', typeof verified.rol);
        console.log('Es array:', Array.isArray(verified.rol));
        console.log('Roles:', verified.rol);
        
        if (Array.isArray(verified.rol)) {
            console.log('Roles individuales:');
            verified.rol.forEach((role, index) => {
                console.log(`  [${index}]: "${role}" (tipo: ${typeof role})`);
            });
            
            console.log('\n¿Incluye "superadmin"?', verified.rol.includes('superadmin'));
        } else {
            console.log('Rol único:', verified.rol);
            console.log('¿Es "superadmin"?', verified.rol === 'superadmin');
        }
        
        return verified;
    } catch (error) {
        console.error('Error decodificando token:', error.message);
        return null;
    }
}

// Función para simular el middleware de autenticación
function simulateAuthMiddleware(token, requiredRoles) {
    console.log('\n=== SIMULACIÓN MIDDLEWARE ===');
    console.log('Roles requeridos:', requiredRoles);
    
    try {
        const cleanToken = token.replace('Bearer ', '');
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        console.log('Rol del usuario:', decoded.rol);
        
        const isAuthorized = Array.isArray(decoded.rol)
            ? decoded.rol.some((role) => requiredRoles.includes(role))
            : requiredRoles.includes(decoded.rol);
            
        console.log('¿Autorizado?', isAuthorized);
        
        if (Array.isArray(decoded.rol)) {
            console.log('Verificación detallada:');
            decoded.rol.forEach(role => {
                const included = requiredRoles.includes(role);
                console.log(`  "${role}" -> ${included ? '✓' : '✗'}`);
            });
        }
        
        return isAuthorized;
    } catch (error) {
        console.error('Error en simulación:', error.message);
        return false;
    }
}

// Instrucciones de uso
console.log('INSTRUCCIONES:');
console.log('1. Inicia sesión como superadmin en el frontend');
console.log('2. Abre las herramientas de desarrollador (F12)');
console.log('3. Ve a Application/Storage -> Cookies');
console.log('4. Copia el valor del cookie "token"');
console.log('5. Ejecuta: node debug_jwt.js "tu_token_aqui"');
console.log('\nO también puedes obtener el token del header Authorization de una request.\n');

// Si se proporciona un token como argumento
const token = process.argv[2];
if (token) {
    console.log('Analizando token proporcionado...\n');
    const decoded = decodeToken(token);
    
    if (decoded) {
        // Simular el middleware para el endpoint de organizaciones
        const orgRoles = ['admin', 'superadmin', 'ITO', 'planner', 'superintendente', 'inspector'];
        simulateAuthMiddleware(token, orgRoles);
    }
} else {
    console.log('No se proporcionó token. Usa: node debug_jwt.js "tu_token"');
}