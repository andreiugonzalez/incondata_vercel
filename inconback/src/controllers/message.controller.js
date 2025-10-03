const MessageRepository = require("../repositories/message.repository");

class MessageController {
  async sendMessage(req, res) {
    try {
      console.log("Body recibido en sendMessage:", req.body);
      const { fromUserId, toUserId, subject, body, id_proyecto } = req.body;
      const attachment = req.file; // Si estás usando multer para manejar archivos adjuntos
      // Convertir id_proyecto a número si viene como string
      const id_proyecto_num = id_proyecto ? Number(id_proyecto) : null;

      if (!fromUserId || !toUserId || !subject || !body) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
      }
      const message = await MessageRepository.createMessage({
        fromUserId,
        toUserId,
        subject,
        body,
        fileUrl: attachment ? attachment.path : null, // Guardar la ruta del archivo adjunto
        fileOriginalName: attachment ? attachment.originalname : null, // Guardar el nombre original del archivo adjunto
        id_proyecto: id_proyecto_num, // <-- Ahora como número
      });
      res.status(201).json({ message: "Mensaje enviado", data: message });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al enviar mensaje", details: error.message });
    }
  }

  async inbox(req, res) {
    try {
      const userId = req.params.userId;
      const messages = await MessageRepository.getInbox(userId);
      res.json({ data: messages });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener mensajes", details: error.message });
    }
  }

  async sent(req, res) {
    try {
      const userId = req.params.userId;
      const messages = await MessageRepository.getSent(userId);
      res.json({ data: messages });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener mensajes enviados",
        details: error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const messageId = req.params.id;
      await MessageRepository.markAsRead(messageId);
      res.json({ message: "Mensaje marcado como leído" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al marcar como leído", details: error.message });
    }
  }

  async getById(req, res) {
    try {
      const messageId = req.params.id;
      const message = await MessageRepository.getById(messageId);
      if (!message)
        return res.status(404).json({ error: "Mensaje no encontrado" });
      res.json({ data: message });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener mensaje", details: error.message });
    }
  }
}

module.exports = new MessageController();
