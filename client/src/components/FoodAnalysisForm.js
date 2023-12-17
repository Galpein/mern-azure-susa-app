import React, { useState } from 'react';
import axios from 'axios';

function FoodAnalysisForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [foodAnalysis, setFoodAnalysis] = useState(null); // Estado para almacenar la respuesta JSON

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage('Selecciona una imagen antes de enviar.');
      return;
    }
  
    const formData = new FormData();
    formData.append('imagen', file);
  
    try {
      await axios.post('/upload', formData);
      getLatestFoodAnalysis(); // Obtiene el último análisis después de subir la imagen
    } catch (error) {
      setMessage('Error al realizar la consulta.');
      console.error(error);
    }
  };
  
  const getLatestFoodAnalysis = async () => {
    try {
      const response = await axios.get('/api/foodAnalysis/latest'); // Asume que tienes un endpoint para obtener el último análisis
      setFoodAnalysis(response.data);
    } catch (error) {
      setMessage('Error al obtener el análisis de alimentos.');
      console.error(error);
    }
  };  

  return (
    <div className="App">
      <h1>Consulta Logmeal</h1>
      <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Enviar Imagen</button>
      <p>{message}</p>
      {foodAnalysis && (
        <div>
          <h2>Información Nutricional:</h2>
          <p>Nombre: {foodAnalysis.nutritionalInfo.foodName[0]}</p>
          <p>Calorías: {parseFloat(foodAnalysis.nutritionalInfo.nutritional_info.calories).toFixed(2)}</p>
          <p>Carbohidratos: {parseFloat(foodAnalysis.nutritionalInfo.nutritional_info.totalNutrients.CHOCDF.quantity).toFixed(2)} {foodAnalysis.nutritionalInfo.nutritional_info.totalNutrients.CHOCDF.unit}</p>
          <p>Grasas: {parseFloat(foodAnalysis.nutritionalInfo.nutritional_info.totalNutrients.FAT.quantity).toFixed(2)} {foodAnalysis.nutritionalInfo.nutritional_info.totalNutrients.FAT.unit}</p>
        </div>
      )}
    </div>
  );  
}

export default FoodAnalysisForm;
