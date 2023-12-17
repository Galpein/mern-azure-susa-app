import axios from 'axios';

const BASE_URL = '/api/patients';

export const getPatients = () => axios.get(BASE_URL);
export const addPatient = (patientData) => axios.post(BASE_URL, patientData);
export const updatePatient = (id, patientData) => axios.put(`${BASE_URL}/${id}`, patientData);
export const deletePatient = (id) => axios.delete(`${BASE_URL}/${id}`);

// Exporta cada función para ser utilizada en los componentes.