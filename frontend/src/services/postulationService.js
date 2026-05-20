import { apiClient } from "./http/httpClient";
import { invalidateOffersCache } from "./offerService";


export const postularseAOferta = async (idOffer, reason, idCv = null) => {
    const body = {
        id_offer: Number(idOffer),
        reason,
        ...(idCv && { id_cv: Number(idCv) }),
    };
    return await apiClient.post("postulations", body);
};

export const obtenerPostulantes = async (idOffer) => {
    return await apiClient.get(`offers/${idOffer}/postulations`);
};


export const actualizarEstadoPostulacion = async (idPostulation, state) => {
  const res = await apiClient.patch(`postulations/${idPostulation}/state`, { state });
  invalidateOffersCache(); 
  return res;
};

export const obtenerMisPostulaciones = async () => {
    return await apiClient.get("postulations/my");
};

export const obtenerStatsConvocatorias = async () => {
  const res = await apiClient.get("offers/stats");
  return res?.data?.stats ?? [];
};

export async function crearEntrevista(idPostulation, details) {
  const res = await apiClient.post(`postulations/${idPostulation}/interview`, {
    type: details.type,
    link: details.link || null,
    address: details.address || null,
    interview_date: details.interview_date || details.date || null,
    interview_time: details.interview_time || details.time || null,
  });

  invalidateOffersCache();

  return res.data;
}
