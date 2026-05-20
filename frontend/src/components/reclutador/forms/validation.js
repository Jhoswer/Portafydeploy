

export function validateStep(step, data) {
  const errs = {};

  if (step === 0) {
    if (!data.empresa.trim())
      errs.empresa = "El nombre de la empresa es obligatorio";
    else if (data.empresa.trim().length < 2)
      errs.empresa = "Debe tener al menos 2 caracteres";

    if (!data.descripcion.trim())
      errs.descripcion = "La descripción es obligatoria";
    else if (data.descripcion.trim().length < 20)
      errs.descripcion = "Escribe al menos 20 caracteres";
  }

  if (step === 2) {
    if (!data.rubro.trim())
      errs.rubro = "Selecciona o escribe un rubro";
    if (!data.ciudad.trim())
      errs.ciudad = "La ciudad es obligatoria";
    if (!data.pais)
      errs.pais = "Selecciona un país";
  }

  if (step === 3) {
    const digits = data.telefono.replace(/\D/g, "");
    if (!digits)
      errs.telefono = "El teléfono es obligatorio";
    else if (digits.length < 7)
      errs.telefono = "Número inválido";

    if (data.sitio && !/^https?:\/\/.+\..+/.test(data.sitio))
      errs.sitio = "Ingresa una URL válida (ej: https://empresa.com)";
  }

  return errs;
}