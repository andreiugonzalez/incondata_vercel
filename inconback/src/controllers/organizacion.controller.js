const OrganizacionRepository = require('../repositories/organizacion.repository');
const { response } = require('../utils/response');


class OrganizacionController {

  async getOrganizaciones(req, res, next) {
    try {
      const organizaciones = await OrganizacionRepository.getOrganizaciones();
      res.status(200).send(response(200, 'Organizaciones encontradas', organizaciones));
    } catch (error) {
      return next(error);
    }
  }

  async getOrganizacionById(req, res, next) {
    try {
      const { id } = req.params;
  
      // Obtener la organización por ID desde el repositorio
      const organizacion = await OrganizacionRepository.getOrganizacionById(id);
  
      // Verificar si la organización no existe y devolver un mensaje de error
      if (!organizacion) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Organización no encontrada'
        });
      }
  
      // Si la organización existe, devolver los datos en un array para consistencia futura
      return res.status(200).json({
        statusCode: 200,
        message: 'Organización encontrada',
        data: [organizacion]
      });
    } catch (error) {
      next(error); // Delegar el manejo del error al middleware de errores
    }
  }
  

  async createOrganizacion(req, res, next) {
    try {
      console.log("=== BACKEND ORGANIZATION CREATION DEBUG ===");
      console.log("Received organization data:", req.body);
      console.log("Request headers:", req.headers);
      console.log("User from token:", req.user);
      console.log("============================================");

      const nuevaOrganizacion = req.body;
      const organizacionCreada = await OrganizacionRepository.createOrganizacion(nuevaOrganizacion);
      
      console.log("=== ORGANIZATION CREATED SUCCESSFULLY ===");
      console.log("Created organization:", organizacionCreada);
      console.log("==========================================");

      res.status(201).send(response(201, 'Organización creada correctamente', organizacionCreada));
    } catch (error) {
      console.error("=== BACKEND ORGANIZATION CREATION ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("============================================");
      return next(error);
    }
  }

  
  async updateOrganizacion(req, res, next) {
    try {
        const { id } = req.params;
        // console.log("ID recibido:", id); // Verificar que `id` no es undefined o null
        if (!id) {
            throw new CustomHttpError(400, "ID no válido");
        }

        const datosActualizados = req.body;
        const organizacionActualizada = await OrganizacionRepository.updateOrganizacion(id, datosActualizados);
        res.status(200).send(response(200, 'Organización actualizada correctamente', organizacionActualizada));
    } catch (error) {
        return next(error);
    }
}



  async deleteOrganizacion(req, res, next) {
    try {
      const { id } = req.params;
      await OrganizacionRepository.deleteOrganizacion(id);
      res.status(200).send(response(200, 'Organización eliminada correctamente'));
    } catch (error) {
      return next(error);
    }
  }

  async getOrganizacionByUserEmail(req, res, next) {
    try {
      // Obtener el correo electrónico del usuario desde el token decodificado
      const userEmail = req.user.email;
  
      console.log("organizacion a la que pertenece : " + userEmail);
  
      // Consultar la base de datos para obtener la organización asociada al usuario
      const organizacion = await OrganizacionRepository.getOrganizacionByUserEmail(userEmail);
      
      // Verificar si se encontró la organización
      if (!organizacion) {
        return res.status(404).json({ message: 'No se encontró la organización asociada al usuario' });
      }
  
      // Enviar la organización como respuesta
      res.status(200).json(organizacion);
    } catch (error) {
      next(error);
    }
  }
  
  
}

const organizacionController = new OrganizacionController();
module.exports = organizacionController;
