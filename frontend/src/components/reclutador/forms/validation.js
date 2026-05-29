export function validateStep(step, data, t) {
  const errs = {};

  if (step === 0) {
    if (!data.empresa.trim())
      errs.empresa = t("recruiterValidations.empresa.required");
    else if (data.empresa.trim().length < 2)
      errs.empresa = t("recruiterValidations.empresa.minLength");

    if (!data.descripcion.trim())
      errs.descripcion = t("recruiterValidations.descripcion.required");
    else if (data.descripcion.trim().length < 20)
      errs.descripcion = t("recruiterValidations.descripcion.minLength");
  }

  if (step === 2) {
    if (!data.rubro.trim())
      errs.rubro = t("recruiterValidations.rubro.required");
    if (!data.ciudad.trim())
      errs.ciudad = t("recruiterValidations.ciudad.required");
    if (!data.pais)
      errs.pais = t("recruiterValidations.pais.required");
  }

  if (step === 3) {
    const digits = data.telefono.replace(/\D/g, "");
    if (!digits)
      errs.telefono = t("recruiterValidations.telefono.required");
    else if (digits.length < 7)
      errs.telefono = t("recruiterValidations.telefono.invalid");

    if (data.sitio && !/^https?:\/\/.+\..+/.test(data.sitio))
      errs.sitio = t("recruiterValidations.sitio.invalid");
  }

  return errs;
}