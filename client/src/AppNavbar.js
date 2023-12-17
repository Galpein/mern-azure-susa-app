import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { getPatients } from '../utils/api'; // Asegúrate de que la ruta sea correcta

function Home() {
  return <h2>Inicio</h2>;
}

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    getPatients()
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => {
        console.error('Error al obtener pacientes:', error);
      });
  }, []);

  return (
    <div>
      <h2>Pacientes</h2>
      {/* Aquí se muestra la lista de pacientes */}
      {patients.map((patient, index) => (
        <p key={index}>{patient}</p>
      ))}
    </div>
  );
}

function App() {
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api")
      .then(response => response.json())
      .then(data => {
        setBackendData(data);
      });
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/app" element={
          <div>
            {(typeof backendData.users === 'undefined') ? (
              <p>Loading...</p>
            ) : (
              backendData.users.map((user, i) => (
                <p key={i}>{user}</p>
              ))
            )}
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
