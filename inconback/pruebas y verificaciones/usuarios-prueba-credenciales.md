# Usuarios de Prueba - Sistema de Permisos

## Usuarios Disponibles para Pruebas
### 1. SuperAdmin
- **Email:** gerardo.incondata@gmail.com
- **Contraseña:** superadmin2024
- **RUT:** 23.460.750-2
- **Nombre:** Gerardo Gonzalez Araya
- **Rol:** superadmin
- **Username:** Gerardo

### 2. Superintendente
- **Email:** carlos.gonzalez@incondata.cl
- **Contraseña:** Super2024!
- **RUT:** 25.544.791-2
- **Nombre:** Carlos González Pérez
- **Rol:** superintendente
- **Username:** carlosgonzalez

### 3. Administrador
- **Email:** maria.rodriguez@incondata.cl
- **Contraseña:** Admin2024!
- **RUT:** 	24.551.202-3
- **Nombre:** María Rodríguez Silva
- **Rol:** admin
- **Username:** mariaodriguez

### 4. Supervisor
- **Email:** juan.martinez@incondata.cl
- **Contraseña:** Supervisor2024!
- **RUT:** 21.176.288-8
- **Nombre:** Juan Martínez López
- **Rol:** supervisor
- **Username:** jmartinez

### 5. ITO (Inspector Técnico de Obras)
- **Email:** ana.fernandez@incondata.cl
- **Contraseña:** ITO2024!
- **RUT:** 14.552.195-5
- **Nombre:** Ana Fernández García
- **Rol:** ITO
- **Username:** afernandez

### 6. Proyectista
- **Email:** laura.torres@incondata.cl
- **Contraseña:** Proyectista2024!
- **RUT:** 	18.619.916-2
- **Nombre:** Laura Torres Herrera
- **Rol:** proyectista
- **Username:** ltorres



## Resumen

- **5 usuarios disponibles** para pruebas del sistema
- **5 roles diferentes** representados
- Todos los usuarios están activos y funcionales

## Funciones por Rol

### Superintendente
- Acceso completo al sistema
- Gestión de usuarios y organizaciones
- Control total de proyectos y minas
- Supervisión general de todas las operaciones
- Acceso a reportes y estadísticas completas

### Administrador
- Gestión de usuarios del sistema
- Configuración de permisos y roles
- Administración de organizaciones
- Acceso a herramientas administrativas
- Gestión de proyectos y documentos

### Supervisor
- Supervisión de proyectos asignados
- Gestión de equipos de trabajo
- Control de avances y cronogramas
- Planificación de actividades
- Gestión de seguridad laboral y prevención de riesgos

### ITO (Inspector Técnico de Obras)
- Inspección técnica de obras y proyectos
- Validación de cumplimiento normativo
- Generación de informes técnicos
- Control de calidad de construcciones
- Gestión de contratos y documentación técnica

### Proyectista
- Gestión de documentos de proyecto
- Creación y edición de planos técnicos
- Coordinación técnica entre equipos
- Archivo y organización de documentos
- Seguimiento de especificaciones técnicas

---

## 🔧 Instrucciones de Uso (Actualizadas)

### Para crear los usuarios:
1. Ejecutar el script: `node create-test-users.js`
2. Verificar que todos los usuarios se crearon correctamente
3. Probar el login con cada credencial

### Para probar el sistema:
1. **Acceder al sistema** con cualquiera de los 5 usuarios disponibles
2. **Verificar funcionalidades** según el rol asignado (ver matriz de permisos actualizada)
3. **Probar reasignaciones**: Los usuarios reasignados deben tener acceso a sus nuevas funciones
4. **Validar eliminaciones**: Confirmar que los roles obsoletos ya no aparecen en el sistema

### Usuarios Recomendados para Pruebas:

#### Pruebas de Funcionalidad Completa:
- **Superintendente** (cgonzalez): Acceso total al sistema
- **Admin** (mrodriguez): Gestión administrativa completa

#### Pruebas de Roles Reasignados:
- **Ex-Contratista → ITO** (psanchez): Verificar funciones heredadas de contratista
- **Ex-Prevencionista → Supervisor** (rvargas): Verificar funciones de seguridad integradas
- **Ex-Planner → Supervisor** (cjimenez): Verificar funciones de planificación integradas

#### Pruebas de Roles Específicos:
- **Supervisor** (jmartinez): Funciones de supervisión estándar
- **ITO** (afernandez): Inspección técnica de obras
- **Proyectista** (ltorres): Gestión de documentos y planos

### Validaciones Importantes:
- ✅ Verificar que usuarios reasignados mantienen acceso al sistema
- ✅ Confirmar que nuevas funciones están disponibles según rol actual
- ✅ Validar que roles eliminados no aparecen en formularios de creación
- ✅ Probar redirección automática a `/dashboard/internaluser` desde botón "Add user"

### Matriz de Permisos por Herramientas

| Herramienta/Función | Superintendente | Administrador | Supervisor | ITO | Proyectista |
|---------------------|:---------------:|:-------------:|:----------:|:---:|:-----------:|
| Gestión de Usuarios | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestión de Proyectos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subida de Documentos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reportes Completos | ✅ | ✅ | ✅ | ✅ | ❌ |
| Configuración Sistema | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inspección Técnica | ✅ | ✅ | ✅ | ✅ | ❌ |
| Gestión de Contratos | ✅ | ✅ | ✅ | ✅ | ❌ |
| Planificación | ✅ | ✅ | ✅ | ❌ | ❌ |
| Prevención de Riesgos | ✅ | ✅ | ✅ | ❌ | ❌ |

## Instrucciones de Uso

### Para Pruebas de Autenticación:
1. Usar cualquiera de los 5 usuarios listados arriba
2. Todos tienen la contraseña: `123456`
3. Verificar que cada usuario acceda solo a las funcionalidades de su rol

### Para Pruebas de Funcionalidades:
- **Superintendente/Administrador**: Probar gestión completa del sistema
- **Supervisor**: Probar supervisión de proyectos y equipos
- **ITO**: Probar inspección técnica y gestión de contratos
- **Proyectista**: Probar gestión de documentos y planos

### Recomendaciones:
- Probar redirección automática al dashboard correspondiente
- Verificar permisos según la matriz de herramientas
- Validar que cada rol tenga acceso solo a sus funcionalidades asignadas