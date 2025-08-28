# Hyper-Localized Fuel Pricing Optimization - Backend Setup

## Project Structure

```
fuel-pricing-backend/
├── package.json
├── server.js
├── config/
│   └── database.js
├── models/
│   ├── Region.js
│   ├── Station.js
│   └── PriceHistory.js
├── routes/
│   ├── regions.js
│   ├── stations.js
│   └── simulation.js
├── controllers/
│   ├── regionController.js
│   ├── stationController.js
│   └── simulationController.js
├── middleware/
│   └── auth.js
└── data/
    └── seed.js
```

## Package.json

```json
{
  "name": "fuel-pricing-backend",
  "version": "1.0.0",
  "description": "Backend API for Hyper-Localized Fuel Pricing Optimization",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node data/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.4.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.8.1",
    "helmet": "^7.0.0",
    "joi": "^17.9.2",
    "moment": "^2.29.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Server.js (Main Entry Point)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
require('dotenv').config();

// Import routes
const regionRoutes = require('./routes/regions');
const stationRoutes = require('./routes/stations');
const simulationRoutes = require('./routes/simulation');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/regions', regionRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/simulation', simulationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Database Configuration (config/database.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 
      'mongodb+srv://lohith0404:zftrain@cluster0.u7cxmci.mongodb.net/ZF-train';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## Data Models

### Region Model (models/Region.js)

```javascript
const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  competitorMedian: {
    type: Number,
    required: true,
    min: 0
  },
  minPrice: {
    type: Number,
    required: true,
    min: 0
  },
  maxPrice: {
    type: Number,
    required: true,
    min: 0
  },
  surgeCap: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  profitTrend: [{
    type: Number
  }],
  demandTrend: [{
    type: Number
  }],
  marginTrend: [{
    type: Number
  }]
}, {
  timestamps: true
});

// Validation
regionSchema.pre('save', function(next) {
  if (this.minPrice >= this.maxPrice) {
    return next(new Error('Min price must be less than max price'));
  }
  if (this.basePrice < this.minPrice || this.basePrice > this.maxPrice) {
    return next(new Error('Base price must be within min and max price range'));
  }
  next();
});

module.exports = mongoose.model('Region', regionSchema);
```

### Station Model (models/Station.js)

```javascript
const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  stationId: {
    type: String,
    required: true,
    unique: true
  },
  region: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  yesterdayPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    min: 0
  },
  competitorMedian: {
    type: Number,
    required: true,
    min: 0
  },
  trafficIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  dailyExpense: {
    type: Number,
    required: true,
    min: 0
  },
  demand: {
    type: Number,
    required: true,
    min: 0
  },
  suggestedPrice: {
    type: Number,
    min: 0
  },
  expectedProfit: {
    type: Number,
    default: 0
  },
  expectedVolume: {
    type: Number,
    default: 0
  },
  autoApplyAI: {
    type: Boolean,
    default: false
  },
  profitPriceCurve: [{
    price: {
      type: Number,
      required: true
    },
    profit: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
stationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema);
```

### Price History Model (models/PriceHistory.js)

```javascript
const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    ref: 'Station'
  },
  region: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  competitorAvg: {
    type: Number,
    default: 0
  },
  trafficIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
priceHistorySchema.index({ stationId: 1, date: -1 });
priceHistorySchema.index({ region: 1, date: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
```

## API Routes

### Region Routes (routes/regions.js)

```javascript
const express = require('express');
const router = express.Router();
const {
  getAllRegions,
  getRegionById,
  updateRegion,
  getRegionAnalytics
} = require('../controllers/regionController');

// GET /api/regions
router.get('/', getAllRegions);

// GET /api/regions/:id
router.get('/:id', getRegionById);

// PUT /api/regions/:id
router.put('/:id', updateRegion);

// GET /api/regions/:id/analytics
router.get('/:id/analytics', getRegionAnalytics);

module.exports = router;
```

### Station Routes (routes/stations.js)

```javascript
const express = require('express');
const router = express.Router();
const {
  getAllStations,
  getStationById,
  updateStation,
  getStationsByRegion,
  updateStationInputs,
  toggleAutoApply
} = require('../controllers/stationController');

// GET /api/stations
router.get('/', getAllStations);

// GET /api/stations/:id
router.get('/:id', getStationById);

// PUT /api/stations/:id
router.put('/:id', updateStation);

// GET /api/stations/region/:region
router.get('/region/:region', getStationsByRegion);

// POST /api/stations/:id/inputs
router.post('/:id/inputs', updateStationInputs);

// POST /api/stations/:id/toggle-auto
router.post('/:id/toggle-auto', toggleAutoApply);

module.exports = router;
```

### Simulation Routes (routes/simulation.js)

```javascript
const express = require('express');
const router = express.Router();
const {
  runSimulation,
  getSimulationHistory
} = require('../controllers/simulationController');

// POST /api/simulation/run
router.post('/run', runSimulation);

// GET /api/simulation/history
router.get('/history', getSimulationHistory);

module.exports = router;
```

## Controllers

### Region Controller (controllers/regionController.js)

```javascript
const Region = require('../models/Region');
const PriceHistory = require('../models/PriceHistory');

// GET /api/regions
const getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find().sort({ name: 1 });
    res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching regions',
      error: error.message
    });
  }
};

// GET /api/regions/:id
const getRegionById = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found'
      });
    }
    res.json({
      success: true,
      data: region
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching region',
      error: error.message
    });
  }
};

// PUT /api/regions/:id
const updateRegion = async (req, res) => {
  try {
    const { basePrice, minPrice, maxPrice, surgeCap } = req.body;
    
    const region = await Region.findByIdAndUpdate(
      req.params.id,
      { basePrice, minPrice, maxPrice, surgeCap },
      { new: true, runValidators: true }
    );
    
    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found'
      });
    }
    
    res.json({
      success: true,
      data: region
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating region',
      error: error.message
    });
  }
};

// GET /api/regions/:id/analytics
const getRegionAnalytics = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found'
      });
    }

    // Get recent price history for analytics
    const priceHistory = await PriceHistory
      .find({ region: region.name })
      .sort({ date: -1 })
      .limit(30);

    const analytics = {
      region: region.name,
      currentMetrics: {
        avgPrice: region.basePrice,
        competitorGap: region.basePrice - region.competitorMedian,
        surgeCap: region.surgeCap
      },
      trends: {
        profit: region.profitTrend,
        demand: region.demandTrend,
        margin: region.marginTrend
      },
      priceHistory: priceHistory.slice(0, 7) // Last 7 days
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

module.exports = {
  getAllRegions,
  getRegionById,
  updateRegion,
  getRegionAnalytics
};
```

### Station Controller (controllers/stationController.js)

```javascript
const Station = require('../models/Station');
const Region = require('../models/Region');

// AI Pricing Algorithm
const calculateOptimalPrice = (station, region) => {
  const { competitorMedian, trafficIndex, dailyExpense, demand } = station;
  const { basePrice, surgeCap } = region;
  
  // Simple AI algorithm considering multiple factors
  let optimalPrice = basePrice;
  
  // Traffic factor (higher traffic allows higher prices)
  const trafficFactor = (trafficIndex - 50) / 50 * 0.02; // ±2% based on traffic
  optimalPrice += optimalPrice * trafficFactor;
  
  // Competition factor (stay competitive)
  const competitionGap = optimalPrice - competitorMedian;
  if (competitionGap > 1) {
    optimalPrice = competitorMedian + 0.5; // Stay within 50 paisa of competition
  }
  
  // Demand factor
  const demandFactor = Math.min(demand / 3000, 1) * 0.015; // Up to 1.5% increase for high demand
  optimalPrice += optimalPrice * demandFactor;
  
  // Apply surge cap
  const maxSurgePrice = basePrice * (1 + surgeCap / 100);
  optimalPrice = Math.min(optimalPrice, maxSurgePrice);
  
  return Math.round(optimalPrice * 100) / 100; // Round to 2 decimal places
};

// Calculate expected profit and volume
const calculateExpectedMetrics = (station, suggestedPrice) => {
  const { dailyExpense, demand, competitorMedian } = station;
  
  // Price elasticity simulation
  const priceElasticity = -0.8; // 1% price increase = 0.8% volume decrease
  const priceChange = (suggestedPrice - competitorMedian) / competitorMedian;
  const volumeChange = priceChange * priceElasticity;
  
  const expectedVolume = Math.max(demand * (1 + volumeChange), 0);
  const revenue = expectedVolume * suggestedPrice;
  const expectedProfit = revenue - dailyExpense;
  
  return {
    expectedProfit: Math.round(expectedProfit),
    expectedVolume: Math.round(expectedVolume)
  };
};

// GET /api/stations
const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find().sort({ name: 1 });
    res.json({
      success: true,
      data: stations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations',
      error: error.message
    });
  }
};

// GET /api/stations/:id
const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Get region data for AI calculations
    const region = await Region.findOne({ name: station.region });
    
    // Calculate AI suggestions
    const suggestedPrice = calculateOptimalPrice(station, region);
    const expectedMetrics = calculateExpectedMetrics(station, suggestedPrice);
    
    // Update station with AI suggestions
    station.suggestedPrice = suggestedPrice;
    station.expectedProfit = expectedMetrics.expectedProfit;
    station.expectedVolume = expectedMetrics.expectedVolume;
    await station.save();

    res.json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station',
      error: error.message
    });
  }
};

// POST /api/stations/:id/inputs
const updateStationInputs = async (req, res) => {
  try {
    const { dailyExpense, demand } = req.body;
    
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { dailyExpense, demand },
      { new: true, runValidators: true }
    );
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Recalculate AI suggestions with new inputs
    const region = await Region.findOne({ name: station.region });
    const suggestedPrice = calculateOptimalPrice(station, region);
    const expectedMetrics = calculateExpectedMetrics(station, suggestedPrice);
    
    station.suggestedPrice = suggestedPrice;
    station.expectedProfit = expectedMetrics.expectedProfit;
    station.expectedVolume = expectedMetrics.expectedVolume;
    await station.save();
    
    res.json({
      success: true,
      data: station,
      message: 'Station inputs updated and AI recalculated'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating station inputs',
      error: error.message
    });
  }
};

// POST /api/stations/:id/toggle-auto
const toggleAutoApply = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    station.autoApplyAI = !station.autoApplyAI;
    
    // If auto-apply is enabled, set current price to suggested price
    if (station.autoApplyAI) {
      station.currentPrice = station.suggestedPrice;
    }
    
    await station.save();
    
    res.json({
      success: true,
      data: station,
      message: `Auto-apply AI ${station.autoApplyAI ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling auto-apply',
      error: error.message
    });
  }
};

module.exports = {
  getAllStations,
  getStationById,
  updateStationInputs,
  toggleAutoApply
};
```

### Simulation Controller (controllers/simulationController.js)

```javascript
const Station = require('../models/Station');
const Region = require('../models/Region');

// POST /api/simulation/run
const runSimulation = async (req, res) => {
  try {
    const { surgeCap, trafficIndex, competitorMedian, region } = req.body;
    
    // Get baseline data
    const regionData = await Region.findOne({ name: region });
    const stations = await Station.find({ region });
    
    if (!regionData || stations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Region or stations not found'
      });
    }

    // Simulate price changes
    const simulationResults = {
      baseline: {
        totalProfit: 0,
        totalVolume: 0,
        avgPrice: 0
      },
      simulated: {
        totalProfit: 0,
        totalVolume: 0,
        avgPrice: 0
      },
      stationResults: []
    };

    // Calculate baseline metrics
    for (const station of stations) {
      const baselineProfit = station.expectedProfit || 0;
      const baselineVolume = station.expectedVolume || 0;
      
      simulationResults.baseline.totalProfit += baselineProfit;
      simulationResults.baseline.totalVolume += baselineVolume;
      simulationResults.baseline.avgPrice += station.suggestedPrice || station.yesterdayPrice;
    }
    
    simulationResults.baseline.avgPrice /= stations.length;

    // Simulate with new parameters
    for (const station of stations) {
      // Create modified station object for simulation
      const simStation = {
        ...station.toObject(),
        trafficIndex: trafficIndex || station.trafficIndex,
        competitorMedian: competitorMedian || station.competitorMedian
      };
      
      const simRegion = {
        ...regionData.toObject(),
        surgeCap: surgeCap || regionData.surgeCap
      };

      // Calculate new optimal price
      const newOptimalPrice = calculateOptimalPrice(simStation, simRegion);
      const newMetrics = calculateExpectedMetrics(simStation, newOptimalPrice);
      
      simulationResults.simulated.totalProfit += newMetrics.expectedProfit;
      simulationResults.simulated.totalVolume += newMetrics.expectedVolume;
      simulationResults.simulated.avgPrice += newOptimalPrice;
      
      simulationResults.stationResults.push({
        stationId: station.stationId,
        stationName: station.name,
        currentPrice: station.suggestedPrice || station.yesterdayPrice,
        simulatedPrice: newOptimalPrice,
        currentProfit: station.expectedProfit || 0,
        simulatedProfit: newMetrics.expectedProfit,
        profitChange: newMetrics.expectedProfit - (station.expectedProfit || 0),
        volumeChange: newMetrics.expectedVolume - (station.expectedVolume || 0)
      });
    }
    
    simulationResults.simulated.avgPrice /= stations.length;
    
    // Calculate uplift percentages
    const profitUplift = ((simulationResults.simulated.totalProfit - simulationResults.baseline.totalProfit) / simulationResults.baseline.totalProfit) * 100;
    const volumeChange = ((simulationResults.simulated.totalVolume - simulationResults.baseline.totalVolume) / simulationResults.baseline.totalVolume) * 100;
    
    res.json({
      success: true,
      data: {
        ...simulationResults,
        summary: {
          profitUplift: Math.round(profitUplift * 100) / 100,
          volumeChange: Math.round(volumeChange * 100) / 100,
          avgPriceChange: simulationResults.simulated.avgPrice - simulationResults.baseline.avgPrice
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error running simulation',
      error: error.message
    });
  }
};

// Helper functions (same as in stationController)
const calculateOptimalPrice = (station, region) => {
  const { competitorMedian, trafficIndex, dailyExpense, demand } = station;
  const { basePrice, surgeCap } = region;
  
  let optimalPrice = basePrice;
  
  const trafficFactor = (trafficIndex - 50) / 50 * 0.02;
  optimalPrice += optimalPrice * trafficFactor;
  
  const competitionGap = optimalPrice - competitorMedian;
  if (competitionGap > 1) {
    optimalPrice = competitorMedian + 0.5;
  }
  
  const demandFactor = Math.min(demand / 3000, 1) * 0.015;
  optimalPrice += optimalPrice * demandFactor;
  
  const maxSurgePrice = basePrice * (1 + surgeCap / 100);
  optimalPrice = Math.min(optimalPrice, maxSurgePrice);
  
  return Math.round(optimalPrice * 100) / 100;
};

const calculateExpectedMetrics = (station, suggestedPrice) => {
  const { dailyExpense, demand, competitorMedian } = station;
  
  const priceElasticity = -0.8;
  const priceChange = (suggestedPrice - competitorMedian) / competitorMedian;
  const volumeChange = priceChange * priceElasticity;
  
  const expectedVolume = Math.max(demand * (1 + volumeChange), 0);
  const revenue = expectedVolume * suggestedPrice;
  const expectedProfit = revenue - dailyExpense;
  
  return {
    expectedProfit: Math.round(expectedProfit),
    expectedVolume: Math.round(expectedVolume)
  };
};

module.exports = {
  runSimulation
};
```

## Data Seeding Script (data/seed.js)

```javascript
const mongoose = require('mongoose');
const Region = require('../models/Region');
const Station = require('../models/Station');
const PriceHistory = require('../models/PriceHistory');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 
      'mongodb+srv://lohith0404:zftrain@cluster0.u7cxmci.mongodb.net/ZF-train');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedRegions = async () => {
  const regions = [
    {
      name: "Mumbai",
      basePrice: 106.50,
      competitorMedian: 105.80,
      minPrice: 95.00,
      maxPrice: 115.00,
      surgeCap: 15,
      profitTrend: [4.2, 4.5, 4.8, 4.6, 5.1, 4.9, 5.3],
      demandTrend: [850, 920, 780, 890, 950, 820, 940],
      marginTrend: [8.2, 8.5, 8.1, 8.7, 9.1, 8.8, 9.3]
    },
    {
      name: "Delhi",
      basePrice: 105.20,
      competitorMedian: 104.90,
      minPrice: 94.00,
      maxPrice: 112.00,
      surgeCap: 12,
      profitTrend: [3.8, 4.1, 4.3, 4.0, 4.7, 4.4, 4.9],
      demandTrend: [780, 850, 720, 810, 880, 750, 860],
      marginTrend: [7.8, 8.1, 7.9, 8.3, 8.7, 8.4, 8.9]
    },
    {
      name: "Bangalore",
      basePrice: 108.30,
      competitorMedian: 107.60,
      minPrice: 96.00,
      maxPrice: 118.00,
      surgeCap: 18,
      profitTrend: [4.5, 4.8, 5.0, 4.7, 5.4, 5.1, 5.6],
      demandTrend: [900, 980, 820, 920, 1000, 850, 980],
      marginTrend: [8.5, 8.8, 8.6, 9.0, 9.4, 9.1, 9.6]
    },
    {
      name: "Chennai",
      basePrice: 107.80,
      competitorMedian: 107.20,
      minPrice: 95.50,
      maxPrice: 116.00,
      surgeCap: 16,
      profitTrend: [4.0, 4.3, 4.5, 4.2, 4.9, 4.6, 5.2],
      demandTrend: [820, 890, 750, 850, 920, 780, 900],
      marginTrend: [8.0, 8.3, 8.1, 8.5, 8.9, 8.6, 9.2]
    },
    {
      name: "Kolkata",
      basePrice: 104.90,
      competitorMedian: 104.30,
      minPrice: 93.50,
      maxPrice: 110.00,
      surgeCap: 14,
      profitTrend: [3.6, 3.9, 4.1, 3.8, 4.5, 4.2, 4.8],
      demandTrend: [720, 790, 680, 760, 830, 700, 820],
      marginTrend: [7.6, 7.9, 7.7, 8.1, 8.5, 8.2, 8.8]
    }
  ];

  await Region.deleteMany({});
  await Region.insertMany(regions);
  console.log('Regions seeded successfully');
};

const seedStations = async () => {
  const stations = [
    {
      name: "IOCL Station - Bandra",
      stationId: "station-001",
      region: "Mumbai",
      location: { type: "Point", coordinates: [72.8377, 19.0596] },
      yesterdayPrice: 106.20,
      competitorMedian: 105.80,
      trafficIndex: 87,
      dailyExpense: 15000,
      demand: 2500,
      profitPriceCurve: [
        { price: 104, profit: 8000 },
        { price: 105, profit: 10000 },
        { price: 106, profit: 11500 },
        { price: 107, profit: 12500 },
        { price: 108, profit: 13000 },
        { price: 109, profit: 12800 },
        { price: 110, profit: 12200 }
      ]
    },
    {
      name: "HPCL Station - Connaught Place",
      stationId: "station-002",
      region: "Delhi",
      location: { type: "Point", coordinates: [77.2167, 28.6333] },
      yesterdayPrice: 105.00,
      competitorMedian: 104.90,
      trafficIndex: 92,
      dailyExpense: 18000,
      demand: 2800,
      profitPriceCurve: [
        { price: 103, profit: 9500 },
        { price: 104, profit: 11200 },
        { price: 105, profit: 13000 },
        { price: 106, profit: 14200 },
        { price: 107, profit: 14800 },
        { price: 108, profit: 14500 },
        { price: 109, profit: 13900 }
      ]
    },
    {
      name: "BPCL Station - Koramangala",
      stationId: "station-003",
      region: "Bangalore",
      location: { type: "Point", coordinates: [77.6309, 12.9279] },
      yesterdayPrice: 108.10,
      competitorMedian: 107.60,
      trafficIndex: 89,
      dailyExpense: 16500,
      demand: 2600,
      profitPriceCurve: [
        { price: 106, profit: 9800 },
        { price: 107, profit: 11500 },
        { price: 108, profit: 13000 },
        { price: 109, profit: 13800 },
        { price: 110, profit: 14200 },
        { price: 111, profit: 13900 },
        { price: 112, profit: 13400 }
      ]
    },
    {
      name: "Shell Station - T. Nagar",
      stationId: "station-004",
      region: "Chennai",
      location: { type: "Point", coordinates: [80.2340, 13.0389] },
      yesterdayPrice: 107.60,
      competitorMedian: 107.20,
      trafficIndex: 85,
      dailyExpense: 17200,
      demand: 2400,
      profitPriceCurve: [
        { price: 105, profit: 8900 },
        { price: 106, profit: 10600 },
        { price: 107, profit: 12100 },
        { price: 108, profit: 12900 },
        { price: 109, profit: 13300 },
        { price: 110, profit: 13000 },
        { price: 111, profit: 12500 }
      ]
    },
    {
      name: "Reliance Petrol - Salt Lake",
      stationId: "station-005",
      region: "Kolkata",
      location: { type: "Point", coordinates: [88.3476, 22.5958] },
      yesterdayPrice: 104.70,
      competitorMedian: 104.30,
      trafficIndex: 78,
      dailyExpense: 14800,
      demand: 2200,
      profitPriceCurve: [
        { price: 102, profit: 7800 },
        { price: 103, profit: 9400 },
        { price: 104, profit: 10800 },
        { price: 105, profit: 11600 },
        { price: 106, profit: 12000 },
        { price: 107, profit: 11700 },
        { price: 108, profit: 11200 }
      ]
    }
  ];

  await Station.deleteMany({});
  await Station.insertMany(stations);
  console.log('Stations seeded successfully');
};

const seedData = async () => {
  await connectDB();
  
  try {
    await seedRegions();
    await seedStations();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
```

## Environment Variables (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://lohith0404:zftrain@cluster0.u7cxmci.mongodb.net/ZF-train
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

## Installation Instructions

1. **Initialize the backend project:**
```bash
mkdir fuel-pricing-backend
cd fuel-pricing-backend
npm init -y
```

2. **Install dependencies:**
```bash
npm install express mongoose cors dotenv express-rate-limit helmet joi moment
npm install --save-dev nodemon
```

3. **Create project structure:**
```bash
mkdir config models routes controllers middleware data
```

4. **Set up environment variables:**
Create `.env` file with the provided configuration

5. **Seed the database:**
```bash
npm run seed
```

6. **Start the development server:**
```bash
npm run dev
```

## API Endpoints Summary

### Regions
- `GET /api/regions` - Get all regions
- `GET /api/regions/:id` - Get region by ID
- `PUT /api/regions/:id` - Update region settings
- `GET /api/regions/:id/analytics` - Get region analytics

### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/:id` - Get station by ID with AI suggestions
- `POST /api/stations/:id/inputs` - Update daily inputs (expense, demand)
- `POST /api/stations/:id/toggle-auto` - Toggle auto-apply AI pricing

### Simulation
- `POST /api/simulation/run` - Run pricing simulation
- `GET /api/simulation/history` - Get simulation history

This complete backend provides a robust foundation for the fuel pricing optimization platform with MongoDB integration, real-time AI pricing calculations, and comprehensive API endpoints for the frontend dashboard.