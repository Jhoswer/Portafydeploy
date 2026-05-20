import { apiClient } from "./http/httpClient";
import { persistCompany } from "./sessionService";

export const registrarEmpresa = async (datos) => {
    const formData = new FormData();

    formData.append("name",         datos.empresa);
    formData.append("description",  datos.descripcion);
    formData.append("industry",     datos.rubro);
    formData.append("city",         datos.ciudad);
    formData.append("country_name", datos.pais);
    formData.append("phone_prefix", datos.prefijo);
    formData.append("phone",        datos.telefono);
    if (datos.sitio) formData.append("website", datos.sitio);
    if (datos.logo)  formData.append("logo",    datos.logo);
    if (datos.founded_year) formData.append("founded_year", datos.founded_year);
    if (datos.size)         formData.append("size",         datos.size);
    if (datos.alcance)      formData.append("alcance",      datos.alcance);
    if (datos.personeria)   formData.append("personeria",   datos.personeria);
    if (datos.address)      formData.append("address",      datos.address);
    if (datos.schedule)     formData.append("schedule",     datos.schedule);
    if (datos.specialty)    formData.append("specialty",    datos.specialty);
    if (datos.segment)      formData.append("segment",      datos.segment);
    if (datos.services)     formData.append("services",     datos.services);

    const data = await apiClient.post("company", formData);

    persistCompany(data.company);

    return data;
};

export const actualizarEmpresa = async (datos) => {
    const formData = new FormData();
    formData.append("_method", "PUT");

    if (datos.name)         formData.append("name",         datos.name);
    if (datos.description)  formData.append("description",  datos.description);
    if (datos.mission)      formData.append("mission",      datos.mission);
    if (datos.vision)       formData.append("vision",       datos.vision);
    if (datos.industry)     formData.append("industry",     datos.industry);
    if (datos.city)         formData.append("city",         datos.city);
    if (datos.phone_prefix) formData.append("phone_prefix", datos.phone_prefix);
    if (datos.phone)        formData.append("phone",        datos.phone);
    if (datos.website)      formData.append("website",      datos.website);
    if (datos.logo)         formData.append("logo",         datos.logo);
    if (datos.banner)       formData.append("banner",       datos.banner);
    if (datos.founded_year) formData.append("founded_year", datos.founded_year);
    if (datos.size)         formData.append("size",         datos.size);
    if (datos.alcance)      formData.append("alcance",      datos.alcance);
    if (datos.personeria)   formData.append("personeria",   datos.personeria);
    if (datos.address)      formData.append("address",      datos.address);
    if (datos.schedule)     formData.append("schedule",     datos.schedule);
    if (datos.specialty)    formData.append("specialty",    datos.specialty);
    if (datos.segment)      formData.append("segment",      datos.segment);
    if (datos.services)     formData.append("services",     datos.services);

    const data = await apiClient.post("company", formData);

    persistCompany(data.company);

    return data;
};