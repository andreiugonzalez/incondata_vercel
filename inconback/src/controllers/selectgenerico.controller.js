const SelectGenericoRepository = require('../repositories/selectgenerico.repository');
const usergenericorepository = require('../repositories/user.repository');
const MineRepository = require('../repositories/mine.repository');

// Obtener todos los países con solo los campos 'id' y 'NombrePais'
exports.getAllPaises = async (req, res, next) => {
  try {
    const paises = await SelectGenericoRepository.getAllPaises();

    // Mapea los resultados para devolver solo los campos 'id' y 'NombrePais'
    const paisesMap = paises.map(pais => ({
      id: pais.id_pais,
      nombre: pais.NombrePais
    }));

    res.json(paisesMap);
  } catch (error) {
    next(error);
  }
};


exports.getRegionesPorPais = async (req, res, next) => {
  try {
    // Obtener el ID del país desde los parámetros de la URL
    const paisId = req.params.paisId;

    // Consultar las regiones correspondientes al país en el repositorio
    const regiones = await SelectGenericoRepository.getRegionesPorPais(paisId);

    // Mapear los resultados para devolver solo los campos 'id' y 'nombre'
    const regionesMap = regiones.map(region => ({
      id: region.id_region,
      nombre: region.nombre
    }));

    // Devolver las regiones en formato JSON
    res.json(regionesMap);
  } catch (error) {
    // Manejar errores
    next(error);
  }
};


// Obtener todas las comunas
exports.getComuna = async (req, res, next) => {
  try {
    const comunas = await SelectGenericoRepository.getComuna();
    const comunasMap = comunas.map(comuna => ({
      id: comuna.id_comuna,
      nombre: comuna.nombre,
      id_region: comuna.id_region,
    }));
    res.json(comunasMap);
  } catch (error) {
    next(error);
  }
};

exports.getLocationByComuna = async (req, res, next) => {
  try {
    const comunaId = req.params.comunaId;
    const location = await SelectGenericoRepository.getLocationByComuna(comunaId);

    if (location) {
      const {
        id_comuna,nombre_comuna,id_region,nombre_region,id_pais,nombre_pais
      } = location;

      res.json({
        id_comuna,nombre_comuna,id_region,nombre_region,id_pais,nombre_pais
      });
    } else {
      res.status(404).json({ error: "Ubicación no encontrada para la comuna especificada" });
    }
  } catch (error) {
    next(error);
  }
};



// Endpoint para obtener comunas por región
exports.getComunasPorRegion = async (req, res, next) => {
  try {
    const { regionId } = req.params; // Obtén el ID de la región de los parámetros de la solicitud
    
    // Obtén las comunas de la región específica utilizando el ID de la región
    const comunas = await SelectGenericoRepository.getComunasPorRegion(regionId);
    
    // Mapea las comunas al formato deseado antes de enviar la respuesta
    const comunasMap = comunas.map(comuna => ({
      id: comuna.id_comuna,
      nombre: comuna.nombre,
      id_region: comuna.id_region,
    }));

    res.json(comunasMap); // Envía la respuesta con las comunas obtenidas
  } catch (error) {
    next(error); // Maneja los errores
  }
};



// Obtener todas las regiones
exports.getRegion = async (req, res, next) => {
  try {
    const regiones = await SelectGenericoRepository.getRegion();
    const regionesMap = regiones.map(region => ({
      id: region.id_region,
      nombre: region.nombre
    }));
    res.json(regionesMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los tipos de empresa
exports.getTipoEmpresa = async (req, res, next) => {
  try {
    const tiposEmpresa = await SelectGenericoRepository.getTipoEmpresa();
    const tiposEmpresaMap = tiposEmpresa.map(tipoEmpresa => ({
      id: tipoEmpresa.id_TipoEmpresa,
      nombre: tipoEmpresa.nombre
    }));
    res.json(tiposEmpresaMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los estados de proyecto
exports.getEstadoProyecto = async (req, res, next) => {
  try {
    const estadosProyecto = await SelectGenericoRepository.getEstadoProyecto();
    const estadosProyectoMap = estadosProyecto.map(estadoProyecto => ({
      id: estadoProyecto.id_estadoproyecto,
      nombre: estadoProyecto.nombre
    }));
    res.json(estadosProyectoMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los nombres de banco
exports.getNombreBanco = async (req, res, next) => {
  try {
    const nombresBanco = await SelectGenericoRepository.getNombreBanco();
    const nombresBancoMap = nombresBanco.map(nombreBanco => ({
      id: nombreBanco.id_nombrebanco,
      nombre: nombreBanco.nombre_banco
    }));
    res.json(nombresBancoMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los tipos de cuenta de banco
exports.getTipoCuentaBanco = async (req, res, next) => {
  try {
    const tiposCuentaBanco = await SelectGenericoRepository.getTipoCuentaBanco();
    const tiposCuentaBancoMap = tiposCuentaBanco.map(tipoCuentaBanco => ({
      id: tipoCuentaBanco.id_tipo_cuenta,
      nombre: tipoCuentaBanco.nombre_tipo
    }));
    res.json(tiposCuentaBancoMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los tipos de contrato
exports.getTipoContrato = async (req, res, next) => {
  try {
    const tiposContrato = await SelectGenericoRepository.getTipoContrato();
    const tiposContratoMap = tiposContrato.map(tipoContrato => ({
      id: tipoContrato.tipo_contrato_id,
      nombre: tipoContrato.nombre
    }));
    res.json(tiposContratoMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los medios de pago
exports.getMedioPago = async (req, res, next) => {
  try {
    const mediosPago = await SelectGenericoRepository.getMedioPago();
    const mediosPagoMap = mediosPago.map(medioPago => ({
      id: medioPago.id,
      nombre: medioPago.nombre
    }));
    res.json(mediosPagoMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los tramos de salud
exports.getTramoSalud = async (req, res, next) => {
  try {
    const tramosSalud = await SelectGenericoRepository.getTramoSalud();
    const tramosSaludMap = tramosSalud.map(tramoSalud => ({
      id: tramoSalud.id_TramoSalud,
      nombre: tramoSalud.nombre
    }));
    res.json(tramosSaludMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los estados de salud
exports.getSalud = async (req, res, next) => {
  try {
    const estadosSalud = await SelectGenericoRepository.getSalud();
    const estadosSaludMap = estadosSalud.map(estadoSalud => ({
      id: estadoSalud.id_Salud,
      nombre: estadoSalud.nombre
    }));
    res.json(estadosSaludMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los roles
exports.getRol = async (req, res, next) => {
  try {
    const roles = await SelectGenericoRepository.getRol();
    const rolesMap = roles.map(rol => ({
      id: rol.id,
      nombre: rol.name
    }));
    res.json(rolesMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los estados de tarea
exports.getEstadoTarea = async (req, res, next) => {
  try {
    const estadosTarea = await SelectGenericoRepository.getEstadoTarea();
    const estadosTareaMap = estadosTarea.map(estadoTarea => ({
      id: estadoTarea.id_EstadoTarea,
      nombre: estadoTarea.NombreEstadoTarea
    }));
    res.json(estadosTareaMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los tipos de documento
exports.getTipoDocumento = async (req, res, next) => {
  try {
    const tiposDocumento = await SelectGenericoRepository.getTipoDocumento();
    const tiposDocumentoMap = tiposDocumento.map(tipoDocumento => ({
      id: tipoDocumento.id,
      nombre: tipoDocumento.name
    }));
    res.json(tiposDocumentoMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las unidades
exports.getUnidad = async (req, res, next) => {
  try {
    const unidades = await SelectGenericoRepository.getUnidad();
    const unidadesMap = unidades.map(unidad => ({
      id: unidad.id_unidad,
      nombre: unidad.nombre
    }));
    res.json(unidadesMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las AFP
exports.getAfp = async (req, res, next) => {
  try {
    const afp = await SelectGenericoRepository.getAfp();
    const afpMap = afp.map(afp => ({
      id: afp.id_afp,
      nombre: afp.nombre_afp
    }));
    res.json(afpMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los tramos de AFP
exports.getTramoAfp = async (req, res, next) => {
  try {
    const tramosAfp = await SelectGenericoRepository.getTramoAfp();
    const tramosAfpMap = tramosAfp.map(tramoAfp => ({
      id: tramoAfp.id_tramo,
      nombre: tramoAfp.nombre_tramo
    }));
    res.json(tramosAfpMap);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los códigos de teléfono
exports.getCodTelefono = async (req, res, next) => {
  try {
    const codigosTelefono = await SelectGenericoRepository.getCodTelefono();
    const codigosTelefonoMap = codigosTelefono.map(codigoTelefono => ({
      id: codigoTelefono.id,
      cod_numero: codigoTelefono.cod_numero
    }));
    res.json(codigosTelefonoMap);
  } catch (error) {
    next(error);
  }
};


// Obtener todas las organizaciones
exports.getOrganizacion = async (req, res, next) => {
  try {
    // Llamada al repositorio para obtener todas las organizaciones
    const organizaciones = await SelectGenericoRepository.getOrganizaciones();
    
  
    const organizacionesMap = organizaciones.map(organizacion => ({
      id: organizacion.id,
      nombre: organizacion.nombre
    }));

   
    res.json(organizacionesMap);
  } catch (error) {
    // Manejo de errores
    next(error);
  }
};





// Obtener el nombre del banco
exports.getNombreBanco = async (req, res, next) => {
  try {
    // Llamada al repositorio para obtener el nombre del banco
    const nombreBancos = await SelectGenericoRepository.getNombreBanco();
    
    // Mapeo de los resultados para el formato deseado
    const nombreBancoMap = nombreBancos.map(nombreBanco => ({
      id_nombrebanco: nombreBanco.id_nombrebanco,
      nombrebanco: nombreBanco.nombre_banco
    }));

    // Devolver los nombres de los bancos en formato JSON
    res.json(nombreBancoMap);
  } catch (error) {
    // Manejo de errores
    next(error);
  }
};

// Obtener el estado civil
exports.getEstadoCivil = async (req, res, next) => {
  try {
    // Llamada al servicio para obtener el estado civil
    const estadosCiviles = await SelectGenericoRepository.getEstadoCivil();
    
    // Mapeo de los resultados para el formato deseado
    const estadoCivilMap = estadosCiviles.map(estadoCivil => ({
      id_estado_civil: estadoCivil.id_estado_civil,
      nombre_estado_civil: estadoCivil.nombre_estado_civil
    }));

    // Devolver los estados civiles en formato JSON
    res.json(estadoCivilMap);
  } catch (error) {
    // Manejo de errores
    next(error);
  }
};


// Obtener el estado civil
exports.getEstadoCuenta = async (req, res, next) => {
  try {
    // Llamada al servicio para obtener el estado civil
    const estadoscuenta = await SelectGenericoRepository.getEstadoCuenta();
    
    // Mapeo de los resultados para el formato deseado
    const estadocuentaMap = estadoscuenta.map(estadocuenta => ({
      id_estado_cuenta: estadocuenta.id_estado_cuenta,
      nombre_estado_cuenta: estadocuenta.nombre_estado_cuenta
    }));

    // Devolver los estados civiles en formato JSON
    res.json(estadocuentaMap);
  } catch (error) {
    // Manejo de errores
    next(error);
  }
};




// Obtener el nombre de relacion
exports.getcontactoEmergencia = async (req, res, next) => {
  try {
    // Llamada al repositorio para obtener el nombre del banco
    const nombrerelaciones = await SelectGenericoRepository.getNombreRelacion();
    
    // Mapeo de los resultados para el formato deseado
    const relacionMap = nombrerelaciones.map(nombrerelacion => ({
      id_relacion: nombrerelacion.id_relacion,
      nombre: nombrerelacion.nombre
    }));

    // Devolver los nombres de los bancos en formato JSON
    res.json(relacionMap);
  } catch (error) {
    // Manejo de errores
    next(error);
  }
};

exports.getMinesname = async (req, res, next) => {
  try {
    const mines = await MineRepository.getMinesname();
    const minesMap = mines.map(mines => ({
      id_mina: mines.id,
      nombre_mina: mines.name
    }));
    res.json(minesMap);
  } catch (error) {
    console.error('Error en getMinesname:', error);
    res.status(500).json({ message: 'Error al obtener las minas' });
  }
};

exports.getUserContratista = async (req, res, next) => {
  try {
    const userRole = await usergenericorepository.getUserContratista();
    const usersMap = userRole.map(role => ({
      id_user: role.id,
      nombre_usuario: role.names,
      apellido_p: role.apellido_p,
      apellido_m: role.apellido_m
    }));
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserRoleById:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios contratistas' });
  }
};


exports.getUserinspector = async (req, res, next) => {
  try {
    // Obtiene los usuarios con el rol de inspector
    const userRole = await usergenericorepository.getUserInspector(); // Asegúrate de que getUserInspector esté usando la nueva consulta con asociaciones

    // Mapea la respuesta para estructurar los datos como lo necesitas
    const usersMap = userRole.map(user => ({
      id_user: user.id,
      nombre_usuario: user.names,
      apellido_p: user.apellido_p,
      apellido_m: user.apellido_m
    }));

    // Envía la respuesta en formato JSON
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserinspector:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios con el rol de inspector' });
  }
};



exports.getUsersuperintendente = async (req, res, next) => {
  try {
    const userRole = await usergenericorepository.getUsersuperintendente();
    const usersMap = userRole.map(role => ({
      id_user: role.id,
      nombre_usuario: role.names,
      apellido_p: role.apellido_p,
      apellido_m: role.apellido_m
    }));
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserRoleById:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios inspector' });
  }
};


exports.getUserITO = async (req, res, next) => {
  try {
    // Obtiene los usuarios con el rol de inspector
    const userRole = await usergenericorepository.getUserITO(); // Asegúrate de que getUserInspector esté usando la nueva consulta con asociaciones

    // Mapea la respuesta para estructurar los datos como lo necesitas
    const usersMap = userRole.map(user => ({
      id_user: user.id,
      nombre_usuario: user.names,
      apellido_p: user.apellido_p,
      apellido_m: user.apellido_m
    }));

    // Envía la respuesta en formato JSON
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserITO:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios con el rol de getUserITO' });
  }
};



exports.getUserplanner = async (req, res, next) => {
  try {
    // Obtiene los usuarios con el rol de inspector
    const userRole = await usergenericorepository.getUserplanner(); // Asegúrate de que getUserInspector esté usando la nueva consulta con asociaciones

    // Mapea la respuesta para estructurar los datos como lo necesitas
    const usersMap = userRole.map(user => ({
      id_user: user.id,
      nombre_usuario: user.names,
      apellido_p: user.apellido_p,
      apellido_m: user.apellido_m
    }));

    // Envía la respuesta en formato JSON
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserITO:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios con el rol de getUserITO' });
  }
};


exports.getUsersupervisor = async (req, res, next) => {
  try {
    // Obtiene los usuarios con el rol de inspector
    const userRole = await usergenericorepository.getUsersupervisor(); // Asegúrate de que getUserInspector esté usando la nueva consulta con asociaciones

    // Mapea la respuesta para estructurar los datos como lo necesitas
    const usersMap = userRole.map(user => ({
      id_user: user.id,
      nombre_usuario: user.names,
      apellido_p: user.apellido_p,
      apellido_m: user.apellido_m
    }));

    // Envía la respuesta en formato JSON
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserITO:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios con el rol de getUserITO' });
  }
};




exports.getUsersadmincontrato = async (req, res, next) => {
  try {
    // Obtiene los usuarios con el rol de inspector
    const userRole = await usergenericorepository.getUsersadmincontrato(); // Asegúrate de que getUserInspector esté usando la nueva consulta con asociaciones

    // Mapea la respuesta para estructurar los datos como lo necesitas
    const usersMap = userRole.map(user => ({
      id_user: user.id,
      nombre_usuario: user.names,
      apellido_p: user.apellido_p,
      apellido_m: user.apellido_m
    }));

    // Envía la respuesta en formato JSON
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserITO:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios con el rol de getUserITO' });
  }
};


exports.getUserprevencionista = async (req, res, next) => {
  try {
    // Obtiene los usuarios con el rol de inspector
    const userRole = await usergenericorepository.getUserprevencionista(); // Asegúrate de que getUserInspector esté usando la nueva consulta con asociaciones

    // Mapea la respuesta para estructurar los datos como lo necesitas
    const usersMap = userRole.map(user => ({
      id_user: user.id,
      nombre_usuario: user.names,
      apellido_p: user.apellido_p,
      apellido_m: user.apellido_m
    }));

    // Envía la respuesta en formato JSON
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getUserITO:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios con el rol de getUserITO' });
  }
};


// Endpoint para obtener id del usuario
exports.getUsernotid = async (req, res, next) => {
  try {
    const { userId } = req.params; // Obtén el ID 
    
    const usuariosid = await usergenericorepository.getUsernotid(userId);
    
    const userMap = usuariosid.map(user => ({
      id_usuario: user.id,
      nombre_usuario: user.names,
      apellido_paterno: user.apellido_p,
      apellido_materno: user.apellido_m
    }));

    res.json(userMap); // Envía la respuesta con los usuarios obtenidos
  } catch (error) {
    next(error); // Maneja los errores
  }
};



exports.getPuesto = async (req, res, next) => {
  try {
    const puestos = await SelectGenericoRepository.getPuesto();
    const puestosMap = puestos.map(puesto => ({
      id: puesto.id_puesto,
      nombre: puesto.nombre_puesto
    }));
    res.json(puestosMap);
  } catch (error) {
    next(error);
  }
};

exports.getGrupo = async (req, res, next) => {
  try {
    const grupos = await SelectGenericoRepository.getGrupo();
    const gruposMap = grupos.map(grupo => ({
      id: grupo.id_grupo,
      nombre: grupo.nombre_grupo
    }));
    res.json(gruposMap);
  } catch (error) {
    next(error);
  }
};

exports.getEstadoproyecto = async (req, res, next) => {
  try {
    const estado = await SelectGenericoRepository.getEstadoproyecto();
    const estadoMap = estado.map(estados => ({
      id_estado: estados.id_estadoproyecto,
      nombre_estado: estados.nombre
    }));
    res.json(estadoMap);
  } catch (error) {
    console.error('Error en getEstadoproyecto:', error);
    res.status(500).json({ message: 'Error al obtener los estados de proyecto' });
  }
};

exports.getUnidades = async (req, res, next) => {
  try {
    const unidad = await SelectGenericoRepository.getUnidades();
    const unidadMap = unidad.map(unidades => ({
      id_unidad: unidades.id_unidad,
      nombre_unidad: unidades.nombre
    }));
    res.json(unidadMap);
  } catch (error) {
    console.error('Error en getUnidad:', error);
    res.status(500).json({ message: 'Error al obtener las unidades' });
  }
};

exports.getrolITO = async (req, res, next) => {
  try {
    const userRole = await usergenericorepository.getrolITO();
    const usersMap = userRole.map(role => ({
      id_user: role.id,
      nombre_usuario: role.names,
      apellido_p: role.apellido_p,
      apellido_m: role.apellido_m
    }));
    res.json(usersMap);
  } catch (error) {
    console.error('Error en getrolITO:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios con rol ITO' });
  }
};

exports.getRolesInternos = async (req, res, next) => {
  try {
    const roles = await SelectGenericoRepository.getRolesInternos();
    const rolesMap = roles.map(rol => ({
      id: rol.id,
      nombre: rol.name
    }));
    res.json(rolesMap);
  } catch (error) {
    next(error);
  }
};

exports.getRolesExternos = async (req, res, next) => {
  try {
    const roles = await SelectGenericoRepository.getRolesExternos();
    const rolesMap = roles.map(rol => ({
      id: rol.id,
      nombre: rol.name
    }));
    res.json(rolesMap);
  } catch (error) {
    next(error);
  }
};
