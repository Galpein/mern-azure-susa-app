import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Checkbox } from 'recharts';
import { format, parseISO } from 'date-fns';
import Swal from 'sweetalert2';

const initialDataCount = 1000;  // Cantidad de datos iniciales a cargar

const updateInterval = 3000;    // Intervalo de actualización en milisegundos (1 segundo)

const thresholds = {
    bg: { min: 70, max: 180 }, // Ejemplo de umbral para glucosa en sangre
    cgm: { min: 70, max: 180 },
    // Puedes agregar más umbrales para otras columnas
};

const checkForAnomalies = (newData) => {
    let anomaliesDetails = [];
  
    newData.forEach(dataPoint => {
      Object.entries(thresholds).forEach(([key, { min, max }]) => {
        const value = dataPoint[key];
        if (value < min || value > max) {
          anomaliesDetails.push({ key, value, min, max });
        }
      });
    });
  
    if (anomaliesDetails.length > 0) {
      const anomaliesMessage = anomaliesDetails.map(anomaly => 
        `ALERTA: ANOMALÍA en ${anomaly.key.toUpperCase()}. Valor: ${anomaly.value}, Umbral: ${anomaly.min}-${anomaly.max}`).join('<br>');
  
      Swal.fire({
        title: '¡Anomalía Detectada!',
        html: anomaliesMessage,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        customClass: {
          popup: 'anomaly-alert-popup'
        }
      });
    }
  };

const CustomizedAxisTick = ({ x, y, stroke, payload }) => {
    const date = parseISO(payload.value); // Convierte la cadena en una fecha
    const formattedDate = format(date, 'HH:mm'); // Formatea como 'Hora:Minutos'
  
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {formattedDate}
        </text>
      </g>
    );
  };

function VitalSignsChart() {
  const [data, setData] = useState([]);
  const [currentDataIndex, setCurrentDataIndex] = useState(initialDataCount);
  const [displayColumns, setDisplayColumns] = useState({
    bg: true, cgm: true, cho: true, insulin: true, lbgi: true, hbgi: true, risk: true
  });

  useEffect(() => {
    axios.get('/api/vitalSigns?limit=2400').then((response) => {
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const initialData = response.data.data.slice(0, initialDataCount);
        setData(initialData);
        setCurrentDataIndex(initialDataCount);
      }
    }).catch(error => console.error("Error fetching data:", error));
  }, []);

  // Actualizar los datos con nuevos puntos
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('/api/vitalSigns?limit=2400').then((response) => {
        if (response.data && response.data.data && currentDataIndex < response.data.data.length) {
          const newData = response.data.data[currentDataIndex];
          setData(currentData => [...currentData, newData]);
          setCurrentDataIndex(currentDataIndex + 1);

          // Llamar a checkForAnomalies para el nuevo punto de datos
          checkForAnomalies([newData]);
        }
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [currentDataIndex]);

  const handleColumnDisplayChange = (columnName) => {
    setDisplayColumns(prevDisplayColumns => ({
      ...prevDisplayColumns,
      [columnName]: !prevDisplayColumns[columnName]
    }));
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" height={60} tick={<CustomizedAxisTick />} />
          <YAxis />
          <Tooltip />
          <Legend />
          {displayColumns.bg && <Line type="monotone" dataKey="bg" stroke="#8884d8" />}
          {displayColumns.cgm && <Line type="monotone" dataKey="cgm" stroke="#82ca9d" />}
          {displayColumns.cho && <Line type="monotone" dataKey="cho" stroke="#ffc658" />}
          {displayColumns.insulin && <Line type="monotone" dataKey="insulin" stroke="#ff8042" />}
          {displayColumns.lbgi && <Line type="monotone" dataKey="lbgi" stroke="#8dd1e1" />}
          {displayColumns.hbgi && <Line type="monotone" dataKey="hbgi" stroke="#a4de6c" />}
          {displayColumns.risk && <Line type="monotone" dataKey="risk" stroke="#d0ed57" />}
        </LineChart>
      </ResponsiveContainer>
      <div>
        {Object.keys(displayColumns).map(columnName => (
          <div key={columnName}>
            <input
              type="checkbox"
              checked={displayColumns[columnName]}
              onChange={() => handleColumnDisplayChange(columnName)}
            />
            {columnName.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VitalSignsChart;