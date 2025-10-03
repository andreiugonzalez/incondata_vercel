const { sequelize } = require('../config/sequelize-config');
const { CustomHttpError } = require('../errors/customError');

class LaboralRepository {
    async createLaboral(laboral, options) {

        const { fecha_inicio_contrato,
                sueldo_base,
                gratificacion,
                valor_dia,
                fecha_de_pago,
                fecha_de_ingreso_obra,
                cargo,
                tipo_contrato_id,
                medio_pago_id } = laboral;

        const laboralBD = await sequelize.models.Laboral.create({
            fecha_inicio_actividad: fecha_inicio_contrato, // Mapear correctamente a la columna real
            sueldo_base: sueldo_base,
            gratificacion: gratificacion,
            valor_hora: valor_dia,
            fecha_pago: fecha_de_pago,
            fecha_ingreso_obra: fecha_de_ingreso_obra,
            Cargo: cargo,
            tipo_contrato_id: tipo_contrato_id,
            medio_pago_id: medio_pago_id
        }, options);

        return laboralBD;
    }
}

module.exports = new LaboralRepository();