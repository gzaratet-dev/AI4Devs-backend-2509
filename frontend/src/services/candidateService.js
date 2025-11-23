import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
});

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Devuelve la ruta del archivo y el tipo
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        throw new Error(error.response?.data?.message || 'Error al subir el archivo');
    }
};

export const sendCandidateData = async (candidateData) => {
    try {
        const response = await apiClient.post('/candidates', candidateData);
        return response.data;
    } catch (error) {
        console.error('Error al enviar datos del candidato:', error);
        throw new Error(error.response?.data?.message || 'Error al enviar datos del candidato');
    }
};