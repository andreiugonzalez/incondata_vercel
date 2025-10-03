// Clase que gestiona el mapeo entre usuarios, proyectos y sockets activos.
// Útil para aplicaciones en tiempo real donde los usuarios pueden cambiar de proyecto y se requiere saber quién está conectado a qué proyecto.
class UserProjectManager {
  constructor() {
    // Mapea userId a projectId (qué usuario está en qué proyecto)
    this.userProjectMap = {};
    // Mapea projectId a un array de objetos { socket, userId, projectId } (quiénes están conectados a cada proyecto)
    this.projectUserMap = {};
    // Mapea userId a su socket activo (qué socket tiene cada usuario)
    this.userSocketMap = {};
  }

  /**
   * Registra un usuario en un proyecto con su socket.
   * Si el usuario ya estaba conectado, lo desconecta del proyecto anterior.
   * @param {string} userId - ID del usuario
   * @param {string} projectId - ID del proyecto
   * @param {object} socket - Socket del usuario (por ejemplo, de Socket.IO)
   * @returns {object} - Mapa actualizado de usuarios por proyecto
   */
  register(userId, projectId, socket) {
    // Si el usuario ya tiene un socket registrado, lo saca del proyecto anterior y desconecta el socket viejo
    if (this.userSocketMap[userId]) {
      const oldSocket = this.userSocketMap[userId];
      const oldProjectId = oldSocket.projectId;
      // Elimina al usuario del array de usuarios del proyecto anterior
      if (this.projectUserMap[oldProjectId]) {
        this.projectUserMap[oldProjectId] = this.projectUserMap[
          oldProjectId
        ].filter((s) => s.socket.id !== oldSocket.id);
        if (this.projectUserMap[oldProjectId].length === 0) {
          delete this.projectUserMap[oldProjectId];
        }
      }
      // Desconecta el socket anterior si sigue conectado
      if (oldSocket.connected) {
        oldSocket.disconnect();
      }
    }

    // Asocia el nuevo socket y proyecto al usuario
    this.userSocketMap[userId] = socket;
    this.userProjectMap[userId] = projectId;

    // Agrega el usuario al nuevo proyecto
    if (!this.projectUserMap[projectId]) {
      this.projectUserMap[projectId] = [];
    }
    this.projectUserMap[projectId].push({ socket, userId, projectId });

    // Guarda los datos en el socket para fácil acceso
    socket.userId = userId;
    socket.projectId = projectId;

    return this.getProjectUserMap();
  }

  /**
   * Elimina la asociación de un usuario/socket cuando se desconecta.
   * Limpia las referencias en todos los mapas.
   * @param {object} socket - Socket del usuario que se desconecta
   * @returns {object} - Mapa actualizado de usuarios por proyecto
   */
  unregister(socket) {
    if (socket.userId && this.userProjectMap[socket.userId]) {
      const projectId = this.userProjectMap[socket.userId];
      if (this.projectUserMap[projectId]) {
        this.projectUserMap[projectId] = this.projectUserMap[projectId].filter(
          (s) => s.socket.id !== socket.id,
        );
        if (this.projectUserMap[projectId].length === 0) {
          delete this.projectUserMap[projectId];
        }
      }
      delete this.userProjectMap[socket.userId];
      delete this.userSocketMap[socket.userId];
    }
    return this.getProjectUserMap();
  }

  /**
   * Devuelve un resumen de usuarios conectados por proyecto (sin los sockets).
   * @returns {object} - Objeto con projectId como clave y array de usuarios como valor
   */
  getProjectUserMap() {
    const formatted = {};
    for (const projectId in this.projectUserMap) {
      formatted[projectId] = this.projectUserMap[projectId].map((s) => ({
        userId: s.userId,
        projectId,
      }));
    }
    return formatted;
  }
}

module.exports = UserProjectManager;
