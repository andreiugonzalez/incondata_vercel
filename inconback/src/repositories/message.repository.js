const { Message, User, Project } = require("../config/sequelize-config");

class MessageRepository {
  async createMessage({
    fromUserId,
    toUserId,
    subject,
    body,
    fileUrl,
    fileOriginalName,
    id_proyecto, // <-- Nuevo campo opcional
  }) {
    return await Message.create({
      fromUserId,
      toUserId,
      subject,
      body,
      fileUrl,
      fileOriginalName,
      id_proyecto, // <-- Guardar si viene
    });
  }

  async getInbox(userId) {
    const messages = await Message.findAll({
      where: { toUserId: userId },
      attributes: [
        "id",
        "fromUserId",
        "toUserId",
        "subject",
        "body",
        "fileUrl",
        "fileOriginalName",
        "createdAt",
        "read",
        "id_proyecto", // <-- Agrega aquí en todos los métodos
      ],
      include: [
        { model: User, as: "fromUser", attributes: ["id", "names", "email"] },
        // { model: Project, as: "proyecto", attributes: ["id", "nombre"] }, // Comentado por problemas de consulta
      ],
      order: [["createdAt", "DESC"]],
    });
    console.log("DEBUG getInbox result:", messages);
    return messages;
  }

  async getSent(userId) {
    return await Message.findAll({
      where: { fromUserId: userId },
      attributes: [
        "id",
        "fromUserId",
        "toUserId",
        "subject",
        "body",
        "fileUrl",
        "fileOriginalName",
        "createdAt",
        "read",
        "id_proyecto", // <-- Agregado aquí
      ],
      include: [
        { model: User, as: "toUser", attributes: ["id", "names", "email"] },
        // { model: Project, as: "proyecto", attributes: ["id", "nombre"] }, // Comentado por problemas de consulta
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async markAsRead(messageId) {
    return await Message.update({ read: true }, { where: { id: messageId } });
  }

  async getById(messageId) {
    return await Message.findByPk(messageId, {
      attributes: [
        "id",
        "fromUserId",
        "toUserId",
        "subject",
        "body",
        "fileUrl",
        "fileOriginalName",
        "createdAt",
        "read",
        "id_proyecto", // <-- Agregado aquí
      ],
      include: [
        { model: User, as: "fromUser", attributes: ["id", "names", "email"] },
        { model: User, as: "toUser", attributes: ["id", "names", "email"] },
        // { model: Project, as: "proyecto", attributes: ["id", "nombre"] }, // Comentado por problemas de consulta
      ],
    });
  }
}

module.exports = new MessageRepository();
