const LOGMEAL_API_KEY = '39910f8190df71d1004d806271d2873b5f95c028'

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Añadir multer
const { PythonShell } = require('python-shell'); // Añadir python-shell
const app = express();
const fs = require('fs');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const csv = require('csv-parser');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'python_scripts/'); // Reemplaza 'RUTA_ABSOLUTA_DONDE_GUARDAR' con la ubicación deseada en tu sistema local
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://SUgarSAvy:SusaPIDS6@sugarsavy.v7lcxk1.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Conexión exitosa a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar con MongoDB Atlas', err));

// Modelo de paciente
const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    condition: String
});

const Patient = mongoose.model('Patient', patientSchema); 

const foodAnalysisSchema = new mongoose.Schema({
  // Asegúrate de que las propiedades coincidan con los datos de la respuesta de Logmeal
  nutritionalInfo: mongoose.Schema.Types.Mixed, // Ajusta según sea necesario
  // Puedes agregar más campos si es necesario
});

const FoodAnalysis = mongoose.model('FoodAnalysis', foodAnalysisSchema);

// Define el esquema para los datos del CSV
const glucoseDataEntrySchema = new mongoose.Schema({
  time: Date,
  bg: Number,
  cgm: Number,
  cho: Number,
  insulin: Number,
  lbgi: Number,
  hbgi: Number,
  risk: Number
}, { _id: false }); // _id: false porque esto será parte de un array


const glucoseDataSchema = new mongoose.Schema({
  data: [glucoseDataEntrySchema] // Un array de datos
});

const VitalSigns = mongoose.model('GlucoseData', glucoseDataSchema);

// Función para importar datos de CSV a MongoDB
const importCSV = (filePath) => {
  const dataEntries = [];
  const choValues = [];
  const insulinValues = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const cho = parseFloat(row['CHO']);
      const insulin = parseFloat(row['insulin']);

      if (!isNaN(cho)) choValues.push(cho);
      if (!isNaN(insulin)) insulinValues.push(insulin);

      dataEntries.push({
        time: new Date(row['Time']),
        bg: parseFloat(row['BG']),
        cgm: parseFloat(row['CGM']),
        cho: isNaN(cho) ? null : cho,
        insulin: isNaN(insulin) ? null : insulin,
        lbgi: parseFloat(row['LBGI']),
        hbgi: parseFloat(row['HBGI']),
        risk: parseFloat(row['Risk'])
      });
    })
    .on('end', () => {
      // Calcular los valores medios
      const choMean = choValues.length ? choValues.reduce((a, b) => a + b, 0) / choValues.length : 0;
      const insulinMean = insulinValues.length ? insulinValues.reduce((a, b) => a + b, 0) / insulinValues.length : 0;

      // Reemplazar NaN con el valor medio
      dataEntries.forEach(entry => {
        if (entry.cho === null) entry.cho = choMean;
        if (entry.insulin === null) entry.insulin = insulinMean;
      });

      // Guardar en MongoDB
      const glucoseDataDocument = new VitalSigns({ data: dataEntries });
      glucoseDataDocument.save()
        .then(() => console.log(`${filePath} file successfully processed and saved as a single document`))
        .catch(err => console.error('Error saving document:', err));
    });
};

// Observador de archivos para detectar nuevos CSVs
const csvFolderPath = path.join(__dirname, 'csv');
fs.watch(csvFolderPath, (eventType, filename) => {
  if (eventType === 'rename' && filename.endsWith('.csv')) {
    console.log(`Nuevo archivo CSV detectado: ${filename}`);
    const fullPath = path.join(csvFolderPath, filename);
    importCSV(fullPath);
  }
});

app.get('/api/patients', async (req, res) => {
    console.log('Obteniendo pacientes...');
    const patients = await Patient.find();
    console.log('Pacientes encontrados:', patients);
    res.json(patients);
});
  
app.post('/api/patients', async (req, res) => {
    console.log('Añadiendo nuevo paciente:', req.body);
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    console.log('Paciente guardado:', savedPatient);
    res.json(savedPatient);
});

// Endpoint para análisis de alimentos

app.post('/upload', upload.single('imagen'), (req, res) => {
    // Obtén la imagen cargada desde la solicitud de React (usando Multer)
    const imagen = req.file.path; // Asegúrate de configurar Multer adecuadamente
  
    // Llama al script Python para realizar una acción adicional
    exec(`python python_scripts/logmeal_client.py ${imagen}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar el script Python: ${error}`);
        res.status(500).send('Error al ejecutar el script Python.');
        return;
      }
      console.log(`Resultado del script Python: ${stdout}`);
  
      // En lugar de guardar la respuesta en un archivo, envía la respuesta al cliente
      res.send(`Resultado de la consulta: ${stdout}`);
    });
  });

app.post('/api/foodAnalysis', async (req, res) => {
  const respuestaLogmeal = req.body.respuestaLogmeal;

  // Crear un nuevo documento con la respuesta de Logmeal
  const newFoodAnalysis = new FoodAnalysis({
    nutritionalInfo: respuestaLogmeal, // Asegúrate de que esto coincida con el esquema
  });

  // Guardar el documento en MongoDB
  try {
    const savedFoodAnalysis = await newFoodAnalysis.save();
    res.json({ message: 'Análisis guardado correctamente', id: savedFoodAnalysis._id });
  } catch (err) {
    console.error('Error al guardar en MongoDB:', err);
    res.status(500).send('Error al guardar en MongoDB.');
  }
});

app.get('/api/foodAnalysis', async (req, res) => {
  console.log('Obteniendo análisis de alimentos...');
  try {
      const foodAnalysisData = await FoodAnalysis.find();
      console.log('Análisis de alimentos encontrados:', foodAnalysisData);
      res.json(foodAnalysisData);
  } catch (err) {
      console.error('Error al obtener análisis de alimentos:', err);
      res.status(500).send('Error al obtener análisis de alimentos.');
  }
});

app.get('/api/foodAnalysis/latest', async (req, res) => {
  try {
    const latestAnalysis = await FoodAnalysis.findOne().sort({ _id: -1 }); // Obtiene el último documento
    if (!latestAnalysis) {
      return res.status(404).send('Análisis no encontrado.');
    }
    res.json(latestAnalysis);
  } catch (err) {
    console.error('Error al obtener el último análisis:', err);
    res.status(500).send('Error al obtener el último análisis.');
  }
});

app.post('/api/chat', (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    return res.status(400).send('No se proporcionó un prompt válido.');
  }

  const pythonProcess = spawn('python', ['python_scripts/openai_chatbot.py', prompt]);
  let pythonResponse = '';

  pythonProcess.stdout.on('data', (data) => {
    pythonResponse += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send(`El script de Python se cerró con el código ${code}`);
    }
    res.json({ response: pythonResponse });
  });

  pythonProcess.on('error', (error) => {
    console.error(`Error al ejecutar el script de Python: ${error}`);
    res.status(500).send(`Error al ejecutar el script de Python: ${error.message}`);
  });
});

// Endpoint para obtener los últimos datos de VitalSigns

app.get('/api/vitalSigns', async (req, res) => {
  try {
    const latestData = await VitalSigns.findOne().sort({ _id: -1 });
    res.json(latestData);
  } catch (error) {
    res.status(500).send("Error al obtener los datos de vital signs.");
  }
});

app.listen(5000, () => { 
    console.log("Server started on port 5000");
});

module.exports = { VitalSigns, app }; // Exportar para usar en csvImporter.js