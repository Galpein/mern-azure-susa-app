import React, { useState } from 'react';
import axios from 'axios';

function RecommendationsForm() {
  const [prompt, setPrompt] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const response = await axios.post('/api/chat', { prompt: prompt });
      setRecommendation(response.data.response); // Establecer la respuesta de OpenAI como recomendación
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error al obtener la recomendación:', error);
      setError('Error al obtener la recomendación.');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>OpenAI Chatbot Recommendation</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          name="prompt"
          value={prompt}
          onChange={handleChange}
          placeholder="Escribe tu prompt aquí..."
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Obteniendo recomendación...' : 'Enviar Prompt'}
        </button>
      </form>
      {recommendation && (
        <div>
          <h2>Recomendación:</h2>
          <p>{recommendation}</p>
        </div>
      )}
      {error && <div>Error: {error}</div>}
    </div>
  );
}

export default RecommendationsForm;
