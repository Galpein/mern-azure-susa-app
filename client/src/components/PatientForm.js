import React, { useState } from 'react';
import { addPatient } from '../utils/api';

function PatientForm() {
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    condition: ''
  });

  const [submitted, setSubmitted] = useState(false); // Nuevo estado para seguimiento de envío

  const handleChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPatient(patientData);
      setSubmitted(true); // Actualizar estado a enviado con éxito
      // Reiniciar el formulario
      setPatientData({
        name: '',
        age: '',
        condition: ''
      });
    } catch (error) {
      console.error('Error al agregar el paciente:', error);
      // Aquí puedes establecer el estado para mostrar un mensaje de error si es necesario
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={patientData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="number"
          name="age"
          value={patientData.age}
          onChange={handleChange}
          placeholder="Age"
        />
        <input
          type="text"
          name="condition"
          value={patientData.condition}
          onChange={handleChange}
          placeholder="Condition"
        />
        <button type="submit">Add Patient</button>
      </form>
      {submitted && <div>Paciente agregado con éxito</div>} {/* Mensaje de éxito */}
    </>
  );
}

export default PatientForm;