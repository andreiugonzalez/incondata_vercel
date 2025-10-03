const NotificationDummy = [
  {
    message: 'Nueva actualización disponible para su revisión.',
    resumen: 'Actualización disponible',
    fecha: new Date(),
    userId: 1,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [1] // Inicialmente nueva para el usuario 1
  },
  {
    message: 'Recordatorio: Reunión de seguridad mañana a las 9 a.m.',
    resumen: 'Recordatorio de reunión',
    fecha: new Date(),
    userId: 2,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [2] // Inicialmente nueva para el usuario 2
  },
  {
    message: 'Se ha completado la revisión de seguridad semanal.',
    resumen: 'Revisión de seguridad completada',
    fecha: new Date(),
    userId: 2,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [2] // Inicialmente nueva para el usuario 2
  },
  {
    message: 'Alerta de mantenimiento programado para el próximo fin de semana.',
    resumen: 'Alerta de mantenimiento',
    fecha: new Date(),
    userId: 2,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [2] // Inicialmente nueva para el usuario 2
  },
  {
    message: 'Se ha recibido una solicitud de vacaciones para revisión.',
    resumen: 'Solicitud de vacaciones',
    fecha: new Date(),
    userId: 2,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [2] // Inicialmente nueva para el usuario 2
  },
  {
    message: 'Tarea asignada: Completar informe trimestral.',
    resumen: 'Informe trimestral',
    fecha: new Date(),
    userId: 3,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [3] // Inicialmente nueva para el usuario 3
  },
  {
    message: 'Alerta: Actualización crítica del sistema mañana a las 2 a.m.',
    resumen: 'Actualización crítica del sistema',
    fecha: new Date(),
    userId: 3,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [3] // Inicialmente nueva para el usuario 3
  },
  {
    message: 'Recordatorio: Enviar reportes de gastos.',
    resumen: 'Recordatorio de reportes de gastos',
    fecha: new Date(),
    userId: 3,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [3] // Inicialmente nueva para el usuario 3
  },
  {
    message: 'Invitación: Reunión del equipo de desarrollo el viernes.',
    resumen: 'Invitación a reunión de desarrollo',
    fecha: new Date(),
    userId: 4,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [4] // Inicialmente nueva para el usuario 4
  },
  {
    message: 'Notificación: Cambio de contraseña exitoso.',
    resumen: 'Cambio de contraseña',
    fecha: new Date(),
    userId: 5,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [5] // Inicialmente nueva para el usuario 5
  },
  {
    message: 'Nuevo mensaje del equipo de recursos humanos.',
    resumen: 'Mensaje de recursos humanos',
    fecha: new Date(),
    userId: 6,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [6] // Inicialmente nueva para el usuario 6
  },
  {
    message: 'Se ha asignado un nuevo proyecto.',
    resumen: 'Nuevo proyecto asignado',
    fecha: new Date(),
    userId: 6,
    id_proyecto: 1,
    readBy: [],
    deletedBy: [],
    newFor: [6] // Inicialmente nueva para el usuario 6
  }
  // Agrega más ejemplos según sea necesario
];

module.exports = { NotificationDummy };
