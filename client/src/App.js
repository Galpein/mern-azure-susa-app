import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import FoodAnalysisForm from './components/FoodAnalysisForm';
import RecommendationsForm from './components/RecommendationsForm';
import VitalSignsPage from './pages/VitalSignsPage';
import './App.css';


function App() {
  return (
    <div className="app-container">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/add-patient" element={<PatientForm />} />
          <Route path="/food-analysis" element={<FoodAnalysisForm />} />
          <Route path="/recommendations" element={<RecommendationsForm />} />
          <Route path="/vital-signs" element={<VitalSignsPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
