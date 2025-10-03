export const validateEventoForm = (formData, showTrainingOptions, showgraveOptions) => {
    const errors = {};

    if (!formData.eventType) {
      errors.eventType = 'El tipo de evento es obligatorio';
    }

    if (showTrainingOptions && !formData.trainingType) {
      errors.trainingType = 'El tipo de capacitación es obligatorio';
    }
    if (showgraveOptions && !formData.accidentType) {
      errors.accidentType = 'El tipo de accidente es obligatorio';
    }

    if (!formData.description) {
      errors.description = 'La descripción es obligatoria';
    }

    return errors;
  };
