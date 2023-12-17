// PatientList.js
import React, { useState, useEffect } from 'react';
import { getPatients } from '../utils/api';

function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await getPatients();
        if (Array.isArray(response.data)) {
          setPatients(response.data);
        } else {
          console.error('La respuesta no es un array:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener pacientes:', error);
      }
    }
    fetchPatients();
  }, []);

  return (
    <div className="patient-list">
      {patients.map(patient => (
        <div key={patient._id} className="patient-card">
          <h3>{patient.name}</h3>
          <p><strong>Edad:</strong> {patient.age} años</p>
          <p><strong>Condición:</strong> {patient.condition}</p>
        </div>
      ))}
    </div>
  );
}

export default PatientList;
