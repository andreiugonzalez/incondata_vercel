const ProjectRepository = require('../repositories/project.repository');
const { response } = require('../utils/response');

class ProjectController {
  async getProjects(req, res, next) {
    try {
      const { projects, avanceGlobal, estadoglobal, totalPlannedDays, roundedSPI, valorganado, totalCPI } = await ProjectRepository.getProjects();
      res.status(200).send({
        status: 200,
        message: 'Proyectos encontrados',
        data: { projects, avanceGlobal, estadoglobal, totalPlannedDays, roundedSPI, valorganado, totalCPI}  // Enviar estadoglobal dentro de data
      });
    } catch (error) {
      return next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
  
      // Validación del ID (ejemplo simple)
      if (!id || isNaN(id)) {
        return res.status(400).send(response(400, 'ID de proyecto no válido'));
      }
  
      // Llamada al repositorio para obtener el proyecto por ID
      const project = await ProjectRepository.getProjectById(id);
  
      // Manejo si el proyecto no es encontrado
      if (!project) {
        return res.status(404).send(response(404, 'Proyecto no encontrado'));
      }
  
      // Si todo es exitoso, enviar la respuesta con el proyecto
      res.status(200).send(response(200, 'Proyecto encontrado', project));
  
    } catch (error) {
      // Manejo de errores con más contexto
      console.error(`Error al obtener el proyecto con ID ${req.params.id}:`, error);
      return next(error);
    }
  }
  

  async crearproyecto(req, res, next) {
    try {
      console.log('DEBUG - req.body:', JSON.stringify(req.body, null, 2));
      
      // El repositorio destructura directamente las propiedades del objeto
      const nuevoProyecto = await ProjectRepository.createProject(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Proyecto creado exitosamente',
        data: nuevoProyecto
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const updatedProject = await ProjectRepository.updateProject(id, updatedData);
      res.status(200).send(response(200, 'Proyecto actualizado correctamente', updatedProject));
    } catch (error) {
      return next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      await ProjectRepository.deleteProject(id);
      res.status(200).send(response(200, 'Proyecto eliminado correctamente'));
    } catch (error) {
      return next(error);
    }
  }



  async getProjectDetails  (req, res)  {
    try {
      const projectId = req.params.id;
      const result = await ProjectRepository.getProjectWithDetailsById(projectId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async getfechabyid(req, res, next){
    try{
      const { id } = req.params;
      const project = await ProjectRepository.getfechabyid(id);
      const projectmap = project.map(project => ({
        fecha_inicio: project.fecha_inicio,
        fecha_termino: project.fecha_termino
      }));
          res.json(projectmap);
    } catch (error) {
        console.error('Error en getEstadopartida:', error);
        res.status(500).json({ message: 'Error al obtener los estados de tareas' });
    }
}



}

const projectController = new ProjectController();
module.exports = projectController;
