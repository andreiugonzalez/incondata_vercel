const { sequelize } = require('../config/sequelize-config');
const { usersDummy } = require('../utils/dummys/user.dummy');
const { rolDummy } = require('../utils/dummys/rol.dummy');
const { userRol } = require('../utils/dummys/user-rol.dummy');

const { documentTypeDummy } = require('../utils/dummys/document-type.dummy');
const { medioPagoDummy } = require('../utils/dummys/medio-pago.dummy');
const { bancoDummy } = require('../utils/dummys/banco.dummy');
const { nombreBancoDummy } = require('../utils/dummys/nombre-banco.dummy');
const { tipoContratoDummy } = require('../utils/dummys/tipo-contrato.dummy');
const { tipoCuentaDummy } = require('../utils/dummys/tipo-cuenta.dummy');
const { regionDummy } = require('../utils/dummys/region.dummy');
const { comunaDummy } = require('../utils/dummys/comuna.dummy');
const { paisDummy } = require('../utils/dummys/pais.dummy');

const { TramoDummy } = require('../utils/dummys/tramo.dummy');
const { AFPDummy } = require('../utils/dummys/afp.dummy');
const { EmergenciaDummy } = require('../utils/dummys/emergencia.dummy');

const { organizationsDummy } = require('../utils/dummys/organizacion.dummy');
const { TramoSaludDummy } = require('../utils/dummys/tramosalud.dummy');
const { SaludDummy } = require('../utils/dummys/salud.dummy');
const { EstadoCivilDummy } = require('../utils/dummys/estadocivil.dummy');
const { LaboralDummy } = require('../utils/dummys/laboral.dummy');
const { TipoMaterialDummy } = require('../utils/dummys/tipomaterial.dummy');
const { MaterialDummy } = require('../utils/dummys/material.dummy');
const { estadosCuentaUsuarioDummy } = require('../utils/dummys/estadocuenta.dummy');
const { dummiesMine } = require('../utils/dummys/mina.dummy');
const { EstadoTareaDummy } = require('../utils/dummys/estadotarea.dummy');
const { codtelefonoDummy } = require('../utils/dummys/codtelefono.dummy');
const { TipoTareaDummy } = require('../utils/dummys/tipotarea.dummy');
const { TipoRecursodummy } = require('../utils/dummys/tiporecurso.dummy');
const { NotificationDummy } = require('../utils/dummys/notificacion.dummy');
const { CommentDummy } = require('../utils/dummys/comentario.dummy');

const { TipoEmpresaDummy } = require('../utils/dummys/tipoempresa.dummy');
const { EstadoProyectoDummy } = require('../utils/dummys/estadoproyecto.dummy');
const { UnidadDummy } = require('../utils/dummys/unidad.dummy');
const { relacionDummy } = require('../utils/dummys/relacion.dummy');
const { componenteDummy } = require('../utils/dummys/componente.dummy');
const { ProveedorDummy } = require('../utils/dummys/proveedor.dummy');
const { projectoDummy } = require('../utils/dummys/proyecto.dummy');
const { PartidaDummy } = require('../utils/dummys/partida.dummy');
const { SubtaskDummy } = require('../utils/dummys/sub_task.dummy');
const { TaskDummy } = require('../utils/dummys/task.dummy');

const { SubPartidaDummy } = require('../utils/dummys/sub_partida.dummy');

const { PuestoDummy } = require('../utils/dummys/puesto.dummy');
const { GrupoDummy } = require('../utils/dummys/grupo.dummy');
const { EventoDummy } = require('../utils/dummys/evento.dummy');
const { Tipo_eventoDummy } = require('../utils/dummys/tipo_evento.dummy');
const { Tipo_capacitacionDummy } = require('../utils/dummys/tipo_capacitacion.dummy');
const { prioridadDummy } = require('../utils/dummys/prioridad.dummy');
const {CommentDummy_subpartida} = require('../utils/dummys/comentario_subpartida.dummy');
const {CommentDummy_tarea} = require('../utils/dummys/comentario_tarea.dummy');
const {CommentDummy_subtarea} = require('../utils/dummys/comentario_subtarea.dummy');
const {Tipo_accidenteDummy} = require('../utils/dummys/tipo_accidente.dummy');
const {ChartTypeDummy } = require('../utils/dummys/ChartTypeDummy .dummy');


class SeederController {
    async create(req, res, next) {

        const seedingRegistry = {
            EstadoProyectoDummy: false,
            UnidadDummy: false,
            TipoEmpresaDummy: false,
            organizationsDummy: false,
            codtelefonoDummy: false,
            //   TramoDummy: false,
            AFPDummy: false,
            paisDummy: false,
            regionDummy: false,
            comunaDummy: false,
            nombreBancoDummy: false,
            tipoCuentaDummy: false,
            tipoContratoDummy: false,
            medioPagoDummy: false,
            bancoDummy: false,
            documentTypeDummy: false,
            rolDummy: false,
            userRol: false,
            usersDummy: false,
            EmergenciaDummy: false,
            //   TramoSaludDummy: false,
            SaludDummy: false,
            EstadoCivilDummy: false,
            TipoMaterialDummy: false,
            MaterialDummy: false,
            estadosCuentaUsuarioDummy: false,
            dummiesMine: false,
            EstadoTareaDummy: false,
            TipoTareaDummy: false,
            TipoRecursodummy: false,
            NotificationDummy: false,
            CommentDummy: false,
            relacionDummy: false,
            componenteDummy: false,
            ProveedorDummy: false,
            projectoDummy: false,
            PartidaDummy: false,
            SubtaskDummy: false,
            TaskDummy: false,
            SubPartidaDummy: false,
            GrupoDummy: false,
            PuestoDummy: false,
            EventoDummy: false,
            Tipo_eventoDummy: false,
            Tipo_capacitacionDummy:false,
            prioridadDummy: false,
            CommentDummy_subpartida: false,
            CommentDummy_tarea: false,
            CommentDummy_subtarea: false,
            Tipo_accidenteDummy: false,
            ChartTypeDummy:false


        };

        try {
            // Seeding para tipo accidentedummy
            await Promise.all(Tipo_accidenteDummy.map(async (rol) => {
                await sequelize.models.Tipo_accidente.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.Tipo_accidenteDummy = true;
                console.log('Seeding completado para Tipo_accidenteDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de Tipo_accidenteDummy:', error);
            });


            // Seeding para prioridaddummy
            await Promise.all(prioridadDummy.map(async (rol) => {
                await sequelize.models.Prioridad.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.prioridadDummy = true;
                console.log('Seeding completado para prioridadDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de prioridadDummy:', error);
            });



            // Seeding para grupodummy
            await Promise.all(GrupoDummy.map(async (rol) => {
                await sequelize.models.Grupo.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.GrupoDummy = true;
                console.log('Seeding completado para GrupoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de GrupoDummy:', error);
            });

            // Seeding para PuestoDummy
            await Promise.all(PuestoDummy.map(async (rol) => {
                await sequelize.models.Puesto.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.PuestoDummy = true;
                console.log('Seeding completado para PuestoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de PuestoDummy:', error);
            });


            // Seeding para componenteDummy
            await Promise.all(componenteDummy.map(async (rol) => {
                await sequelize.models.Componente.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.componenteDummy = true;
                console.log('Seeding completado para componenteDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de componenteDummy:', error);
            });


            // Seeding para relacionDummy
            await Promise.all(relacionDummy.map(async (rol) => {
                await sequelize.models.Relacion.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.relacionDummy = true;
                console.log('Seeding completado para relacionDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de relacionDummy:', error);
            });



            // Seeding para tramosaluddummy
            //   await Promise.all(TramoSaludDummy.map(async (rol) => {
            //        await sequelize.models.TramoSalud.create(rol);
            //       })).then(() => {
            //         // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
            //        seedingRegistry.TramoSaludDummy = true;
            //        console.log('Seeding completado para TramoSaludDummy.');
            //    }).catch((error) => {
            // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
            //        console.error('Error durante el seeding de TramoSaludDummy:', error);
            //     });


            // Seeding para SaludDummy
            await Promise.all(SaludDummy.map(async (rol) => {
                await sequelize.models.Salud.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.SaludDummy = true;
                console.log('Seeding completado para SaludDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de SaludDummy:', error);
            });
            // Seeding para paisDummy
            await Promise.all(paisDummy.map(async (rol) => {
                await sequelize.models.Pais.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.paisDummy = true;
                console.log('Seeding completado para paisDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de paisDummy:', error);
            });

            // Seeding para regionDummy
            await Promise.all(regionDummy.map(async (rol) => {
                await sequelize.models.Region.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.regionDummy = true;
                console.log('Seeding completado para regionDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de regionDummy:', error);
            });



            // Seeding para comunaDummy
            await Promise.all(comunaDummy.map(async (rol) => {
                await sequelize.models.Comuna.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.comunaDummy = true;
                console.log('Seeding completado para comunaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de comunaDummy:', error);
            });

            // Seeding para UnidadDummy
            await Promise.all(UnidadDummy.map(async (rol) => {
                await sequelize.models.Unidad.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.UnidadDummy = true;
                console.log('Seeding completado para UnidadDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de UnidadDummy:', error);
            });

            // Seeding para EstadoProyectoDummy
            await Promise.all(EstadoProyectoDummy.map(async (rol) => {
                await sequelize.models.EstadoProyecto.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.EstadoProyectoDummy = true;
                console.log('Seeding completado para EstadoProyectoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de EstadoProyectoDummy:', error);
            });

            // Seeding para TipoEmpresaDummy
            await Promise.all(TipoEmpresaDummy.map(async (rol) => {
                await sequelize.models.TipoEmpresa.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.TipoEmpresaDummy = true;
                console.log('Seeding completado para TipoEmpresaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de TipoEmpresaDummy:', error);
            });



            // Seeding para TipoRecursodummy
            await Promise.all(TipoRecursodummy.map(async (rol) => {
                await sequelize.models.TipoRecurso.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.TipoRecursodummy = true;
                console.log('Seeding completado para TipoRecursodummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de TipoRecursodummy:', error);
            });


            // Seeding para TipoTareaDummy
            await Promise.all(TipoTareaDummy.map(async (rol) => {
                await sequelize.models.TipoTarea.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.TipoTareaDummy = true;
                console.log('Seeding completado para TipoTareaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de TipoTareaDummy:', error);
            });

            // Seeding para codtelefonoDummy
            await Promise.all(codtelefonoDummy.map(async (rol) => {
                await sequelize.models.CodTelefono.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.codtelefonoDummy = true;
                console.log('Seeding completado para codtelefonoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de codtelefonoDummy:', error);
            });




            // Seeding para ProveedorDummy
            await Promise.all(ProveedorDummy.map(async (rol) => {
                await sequelize.models.Proveedor.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.ProveedorDummy = true;
                console.log('Seeding completado para ProveedorDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de ProveedorDummy:', error);
            });


            // Seeding para EstadoTareaDummy
            await Promise.all(EstadoTareaDummy.map(async (rol) => {
                await sequelize.models.EstadoTarea.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.EstadoTareaDummy = true;
                console.log('Seeding completado para EstadoTareaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de EstadoTareaDummy:', error);
            });



            // Seeding para organizationsDummy
            await Promise.all(organizationsDummy.map(async (rol) => {
                await sequelize.models.Organizacion.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.organizationsDummy = true;
                console.log('Seeding completado para organizationsDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de organizationsDummy:', error);
            });





            // Seeding para estadosCuentaUsuarioDummy
            await Promise.all(estadosCuentaUsuarioDummy.map(async (rol) => {
                await sequelize.models.EstadoCuenta.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.estadosCuentaUsuarioDummy = true;
                console.log('Seeding completado para estadosCuentaUsuarioDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de estadosCuentaUsuarioDummy:', error);
            });



            // Seeding para TipoMaterialDummy
            await Promise.all(TipoMaterialDummy.map(async (rol) => {
                await sequelize.models.TipoMaterial.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.TipoMaterialDummy = true;
                console.log('Seeding completado para TipoMaterialDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de TipoMaterialDummy:', error);
            });






            // Seeding para tramodummy
            //    await Promise.all(TramoDummy.map(async (rol) => {
            //        await sequelize.models.Tramo.create(rol);
            //    })).then(() => {
            //       // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
            //      seedingRegistry.TramoDummy = true;
            //       console.log('Seeding completado para TramoDummy.');
            //   }).catch((error) => {
            // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
            //        console.error('Error durante el seeding de TramoDummy:', error);
            //   });

            // Seeding para AFPDummy
            await Promise.all(AFPDummy.map(async (rol) => {
                await sequelize.models.Afp.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.AFPDummy = true;
                console.log('Seeding completado para AFPDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de AFPDummy:', error);
            });
            // Seeding para tipoCuentaDummy
            await Promise.all(tipoCuentaDummy.map(async (rol) => {
                await sequelize.models.TipoCuenta.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.tipoCuentaDummy = true;
                console.log('Seeding completado para tipoCuentaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de tipoCuentaDummy:', error);
            });



            // Seeding para nombreBancoDummy
            await Promise.all(nombreBancoDummy.map(async (rol) => {
                await sequelize.models.NombreBanco.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.nombreBancoDummy = true;
                console.log('Seeding completado para nombreBancoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de nombreBancoDummy:', error);
            });






            // Seeding para bancoDummy
            await Promise.all(bancoDummy.map(async (rol) => {
                await sequelize.models.Banco.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.bancoDummy = true;
                console.log('Seeding completado para bancoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de bancoDummy:', error);
            });



            // Seeding para tipoContratoDummy
            await Promise.all(tipoContratoDummy.map(async (rol) => {
                await sequelize.models.TipoContrato.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.tipoContratoDummy = true;
                console.log('Seeding completado para tipoContratoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de tipoContratoDummy:', error);
            });

            // Seeding para medioPagoDummy
            await Promise.all(medioPagoDummy.map(async (rol) => {
                await sequelize.models.MedioPago.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.medioPagoDummy = true;
                console.log('Seeding completado para medioPagoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de medioPagoDummy:', error);
            });






            // Seeding para LaboralDummy
            await Promise.all(LaboralDummy.map(async (rol) => {
                await sequelize.models.Laboral.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.LaboralDummy = true;
                console.log('Seeding completado para LaboralDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de LaboralDummy:', error);
            });





            // Seeding para EstadoCivilDummy
            await Promise.all(EstadoCivilDummy.map(async (rol) => {
                await sequelize.models.EstadoCivil.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.EstadoCivilDummy = true;
                console.log('Seeding completado para EstadoCivilDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de EstadoCivilDummy:', error);
            });


            // Seeding para rolDummy
            await Promise.all(rolDummy.map(async (rol) => {
                await sequelize.models.Rol.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.rolDummy = true;
                console.log('Seeding completado para rolDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de rolDummy:', error);
            });


            // Seeding para usersDummy
            await Promise.all(usersDummy.map(async (rol) => {
                await sequelize.models.User.create(rol);
            })).then(async () => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.usersDummy = true;
                console.log('Seeding completado para usersDummy.');

                // Actualizar la secuencia después de insertar los usuarios dummy
                const maxId = await sequelize.models.User.max('id');
                await sequelize.query(`SELECT setval('user_id_seq', ${maxId}, true);`);
                console.log('Secuencia user_id_seq actualizada a:', maxId);

            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de usersDummy:', error);
            });


            // Seeding para comentario subpartida
            await Promise.all(CommentDummy_subpartida.map(async (rol) => {
                await sequelize.models.Comment_subpartida.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.CommentDummy_subpartida = true;
                console.log('Seeding completado para CommentDummy_subpartida.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de CommentDummy_subpartida:', error);
            });

            // Seeding para comentario tarea
            await Promise.all(CommentDummy_tarea.map(async (rol) => {
                await sequelize.models.Comment_tarea.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.CommentDummy_tarea = true;
                console.log('Seeding completado para CommentDummy_tarea.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de CommentDummy_tarea:', error);
            });

             // Seeding para comentario subtarea
             await Promise.all(CommentDummy_subtarea.map(async (rol) => {
                await sequelize.models.Comment_subtarea.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.CommentDummy_subtarea = true;
                console.log('Seeding completado para CommentDummy_subtarea.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de CommentDummy_subtarea:', error);
            });

            // Seeding para userRol
            await Promise.all(userRol.map(async (rol) => {
                await sequelize.models.UserRol.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.userRol = true;
                console.log('Seeding completado para userRol.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de userRol:', error);
            });

            // Seeding para dummiesMine
            await Promise.all(dummiesMine.map(async (rol) => {
                await sequelize.models.Mine.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.dummiesMine = true;
                console.log('Seeding completado para dummiesMine.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de dummiesMine:', error);
            });

            // Seeding para projectoDummy
            await Promise.all(projectoDummy.map(async (rol) => {
                await sequelize.models.Project.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.projectoDummy = true;
                console.log('Seeding completado para projectoDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de projectoDummy:', error);
            });




            // Insertar Tipo_eventoDummy  sin id_parent primero
            await Promise.all(Tipo_eventoDummy.map(async (tipoEvento) => {
                await sequelize.models.Tipo_evento.create(tipoEvento);
            })).then(async () => {
                seedingRegistry.Tipo_eventoDummy = true;
                console.log('Seeding completado para Tipo_eventoDummy.');

                const maxId = await sequelize.models.Tipo_evento.max('id_tipo_evento');
                await sequelize.query(`SELECT setval('tipo_evento_id_tipo_evento_seq', ${maxId}, true);`);
                console.log('Seeding completado para Tipo_eventoDummy a:', maxId);
            }).catch((error) => {
                console.error('Error durante el seeding de Tipo_eventoDummy sin id_parent:', error);
            });

             // Insertar Tipo_capacitacionDummy  sin id_parent primero
             await Promise.all(Tipo_capacitacionDummy.map(async (tipoEvento) => {
                await sequelize.models.Tipo_capacitacion.create(tipoEvento);
            })).then(async () => {
                seedingRegistry.Tipo_capacitacionDummy = true;
                console.log('Seeding completado para Tipo_capacitacionDummy.');

                const maxId = await sequelize.models.Tipo_capacitacion.max('id_tipo_capacitacion');
                await sequelize.query(`SELECT setval('tipo_capacitacion_id_tipo_capacitacion_seq', ${maxId}, true);`);
                console.log('Seeding completado para Tipo_capacitacionDummy a:', maxId);
            }).catch((error) => {
                console.error('Error durante el seeding de Tipo_capacitacionDummy :', error);
            });





                 // Seeding para EventoDummy
                 await Promise.all(EventoDummy.map(async (evento) => {
                    await sequelize.models.Evento.create(evento);
                })).then(async () => {
                    seedingRegistry.EventoDummy = true;
                    console.log('Seeding completado para EventoDummy.');

                    const maxId = await sequelize.models.Evento.max('id_evento');
                    await sequelize.query(`SELECT setval('evento_id_evento_seq', ${maxId}, true);`);
                    console.log('Seeding completado para EventoDummy. Secuencia Evento_id_evento_seq actualizada a:', maxId);
                }).catch((error) => {
                    console.error('Error durante el seeding de EventoDummy:', error);
                });



            // Seeding para PartidaDummy
            await Promise.all(PartidaDummy.map(async (rol) => {
                await sequelize.models.Partida.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.PartidaDummy = true;
                console.log('Seeding completado para PartidaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de PartidaDummy:', error);
            });


            // Seeding para SubPartidaDummy
            await Promise.all(SubPartidaDummy.map(async (rol) => {
                await sequelize.models.Subpartida.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.SubPartidaDummy = true;
                console.log('Seeding completado para SubPartidaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de SubPartidaDummy:', error);
            });


            // Seeding para TaskDummy
            await Promise.all(TaskDummy.map(async (rol) => {
                await sequelize.models.Task.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.TaskDummy = true;
                console.log('Seeding completado para TaskDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de TaskDummy:', error);
            });



            // Seeding para SubtaskDummy
            await Promise.all(SubtaskDummy.map(async (rol) => {
                await sequelize.models.Subtask.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.SubtaskDummy = true;
                console.log('Seeding completado para SubtaskDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de SubtaskDummy:', error);
            });




            // Seeding para MaterialDummy
            await Promise.all(MaterialDummy.map(async (rol) => {
                await sequelize.models.Material.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.MaterialDummy = true;
                console.log('Seeding completado para MaterialDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de MaterialDummy:', error);
            });


            // Seeding para NotificationDummy
            await Promise.all(NotificationDummy.map(async (rol) => {
                await sequelize.models.Notification.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.NotificationDummy = true;
                console.log('Seeding completado para NotificationDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de NotificationDummy:', error);
            });





            // Seeding para CommentDummy
            await Promise.all(CommentDummy.map(async (rol) => {
                await sequelize.models.Comment.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.CommentDummy = true;
                console.log('Seeding completado para CommentDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de CommentDummy:', error);
            });

            // Seeding para EmergenciaDummy
            await Promise.all(EmergenciaDummy.map(async (rol) => {
                await sequelize.models.Emergencia.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.EmergenciaDummy = true;
                console.log('Seeding completado para EmergenciaDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de EmergenciaDummy:', error);
            });

               // Seeding para ChartTypeDummy 
               await Promise.all(ChartTypeDummy .map(async (rol) => {
                await sequelize.models.ChartType.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.ChartTypeDummy  = true;
                console.log('Seeding completado para ChartTypeDummy .');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de ChartTypeDummy :', error);
            });


            // Seeding para documentTypeDummy
            await Promise.all(documentTypeDummy.map(async (rol) => {
                await sequelize.models.DocumentType.create(rol);
            })).then(() => {
                // Solo si todas las promesas se resuelven sin errores, actualizamos el registro a verdadero
                seedingRegistry.documentTypeDummy = true;
                console.log('Seeding completado para documentTypeDummy.');
            }).catch((error) => {
                // Si hay algún error, lo capturamos aquí sin cambiar el registro a verdadero
                console.error('Error durante el seeding de documentTypeDummy:', error);
            });

            // Promise.all(documentTypeDummy.map(async (documentType) => {
            //     await sequelize.models.DocumentType.create(documentType);
            // }));


            console.log('--------------------------------------------------------------------------------------');
            console.log('Tablas registradas en models :');
            console.log('--------------------------------------------------------------------------------------');
            console.log(Object.keys(sequelize.models));
            console.log('--------------------------------------------------------------------------------------');


            // Imprime los resultados del seeding
            console.log('Resultado del seeding:');
            console.log('--------------------------------------------------------------------------------------');
            const seedingResults = [];
            Object.entries(seedingRegistry).forEach(([key, value]) => {
                console.log(`${key}: ${value ? '\x1b[32mSeeded\x1b[0m' : '\x1b[31mNot seeded\x1b[0m'}`);
                seedingResults.push(`${key}: ${value ? 'Seeded' : 'Not seeded'}`);
                console.log('--------------------------------------------------------------------------------------');

            });
            res.status(201).send({
                message: 'Seeder creado correctamente',
                seedingResults: seedingResults,
            });
        } catch (error) {
            return next(error);
        }
    }
}

const seederController = new SeederController();
module.exports = seederController;