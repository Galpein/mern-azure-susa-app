import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className='navbar'>
      <Link to="/">Home</Link> | 
      <Link to="/about">About</Link> | 
      <Link to="/add-patient">Add Patient</Link> | 
      <Link to="/patients">Patients</Link> |
      <Link to="/food-analysis">Food Analysis</Link> |
      <Link to="/recommendations">Recommendations</Link> |
      <Link to="/vital-signs">Blood Glucose Levels</Link>
    </nav>
  );
}

export default Navbar;
