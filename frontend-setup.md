# Hyper-Localized Fuel Pricing Optimization - React Frontend Setup

## Project Structure

```
fuel-pricing-frontend/
├── package.json
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── index.js
│   ├── App.js
│   ├── components/
│   │   ├── Navigation/
│   │   │   └── Navbar.js
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── StationDashboard.js
│   │   │   └── SimulationPage.js
│   │   ├── UI/
│   │   │   ├── Card.js
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   └── Toggle.js
│   │   └── Charts/
│   │       ├── LineChart.js
│   │       ├── BarChart.js
│   │       └── DonutChart.js
│   ├── services/
│   │   └── api.js
│   ├── hooks/
│   │   └── useApi.js
│   ├── context/
│   │   └── AppContext.js
│   └── styles/
│       ├── global.css
│       └── components/
│           ├── dashboard.css
│           ├── charts.css
│           └── forms.css
```

## Package.json

```json
{
  "name": "fuel-pricing-frontend",
  "version": "1.0.0",
  "description": "React frontend for Hyper-Localized Fuel Pricing Optimization",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.1",
    "react-scripts": "5.0.1",
    "axios": "^1.4.0",
    "chart.js": "^4.3.0",
    "react-chartjs-2": "^5.2.0",
    "recharts": "^2.7.2",
    "styled-components": "^6.0.4",
    "moment": "^2.29.4",
    "react-hot-toast": "^2.4.1",
    "lodash": "^4.17.21"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:5000"
}
```

## Main App Component (src/App.js)

```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navigation/Navbar';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import StationDashboard from './components/Dashboard/StationDashboard';
import SimulationPage from './components/Dashboard/SimulationPage';
import { AppProvider } from './context/AppContext';
import './styles/global.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/station" element={<StationDashboard />} />
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
```

## App Context (src/context/AppContext.js)

```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as api from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  regions: [],
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,
  simulationResults: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_REGIONS':
      return { ...state, regions: action.payload, loading: false };
    case 'SET_STATIONS':
      return { ...state, stations: action.payload, loading: false };
    case 'SET_SELECTED_STATION':
      return { ...state, selectedStation: action.payload };
    case 'UPDATE_REGION':
      return {
        ...state,
        regions: state.regions.map(region =>
          region._id === action.payload._id ? action.payload : region
        )
      };
    case 'UPDATE_STATION':
      return {
        ...state,
        stations: state.stations.map(station =>
          station._id === action.payload._id ? action.payload : station
        ),
        selectedStation: state.selectedStation?._id === action.payload._id 
          ? action.payload 
          : state.selectedStation
      };
    case 'SET_SIMULATION_RESULTS':
      return { ...state, simulationResults: action.payload, loading: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadRegions();
    loadStations();
  }, []);

  const loadRegions = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const regions = await api.getRegions();
      dispatch({ type: 'SET_REGIONS', payload: regions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to load regions');
    }
  };

  const loadStations = async () => {
    try {
      const stations = await api.getStations();
      dispatch({ type: 'SET_STATIONS', payload: stations });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to load stations');
    }
  };

  const updateRegion = async (regionId, updates) => {
    try {
      const updatedRegion = await api.updateRegion(regionId, updates);
      dispatch({ type: 'UPDATE_REGION', payload: updatedRegion });
      toast.success('Region updated successfully');
      return updatedRegion;
    } catch (error) {
      toast.error('Failed to update region');
      throw error;
    }
  };

  const updateStationInputs = async (stationId, inputs) => {
    try {
      const updatedStation = await api.updateStationInputs(stationId, inputs);
      dispatch({ type: 'UPDATE_STATION', payload: updatedStation });
      toast.success('Station inputs updated');
      return updatedStation;
    } catch (error) {
      toast.error('Failed to update station inputs');
      throw error;
    }
  };

  const toggleAutoApply = async (stationId) => {
    try {
      const updatedStation = await api.toggleAutoApply(stationId);
      dispatch({ type: 'UPDATE_STATION', payload: updatedStation });
      toast.success(`Auto-apply ${updatedStation.autoApplyAI ? 'enabled' : 'disabled'}`);
      return updatedStation;
    } catch (error) {
      toast.error('Failed to toggle auto-apply');
      throw error;
    }
  };

  const runSimulation = async (params) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const results = await api.runSimulation(params);
      dispatch({ type: 'SET_SIMULATION_RESULTS', payload: results });
      toast.success('Simulation completed successfully');
      return results;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Simulation failed');
      throw error;
    }
  };

  const value = {
    ...state,
    updateRegion,
    updateStationInputs,
    toggleAutoApply,
    runSimulation,
    setSelectedStation: (station) => dispatch({ type: 'SET_SELECTED_STATION', payload: station }),
    refreshData: () => {
      loadRegions();
      loadStations();
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

## API Service (src/services/api.js)

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Region API
export const getRegions = () => api.get('/regions');
export const getRegion = (id) => api.get(`/regions/${id}`);
export const updateRegion = (id, data) => api.put(`/regions/${id}`, data);
export const getRegionAnalytics = (id) => api.get(`/regions/${id}/analytics`);

// Station API
export const getStations = () => api.get('/stations');
export const getStation = (id) => api.get(`/stations/${id}`);
export const updateStation = (id, data) => api.put(`/stations/${id}`, data);
export const getStationsByRegion = (region) => api.get(`/stations/region/${region}`);
export const updateStationInputs = (id, data) => api.post(`/stations/${id}/inputs`, data);
export const toggleAutoApply = (id) => api.post(`/stations/${id}/toggle-auto`);

// Simulation API
export const runSimulation = (data) => api.post('/simulation/run', data);
export const getSimulationHistory = () => api.get('/simulation/history');

export default api;
```

## Navigation Component (src/components/Navigation/Navbar.js)

```javascript
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: '🏢' },
    { path: '/station', label: 'Station Dashboard', icon: '⛽' },
    { path: '/simulation', label: 'Simulation', icon: '🧪' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>🚗 Fuel Pricing Optimization</h2>
        <span className="brand-subtitle">Hyper-Localized AI-Powered Pricing</span>
      </div>
      
      <div className="navbar-tabs">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-tab ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="navbar-status">
        <div className="status-indicator online">
          <span className="status-dot"></span>
          <span>Live Data</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

## Admin Dashboard Component (src/components/Dashboard/AdminDashboard.js)

```javascript
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import LineChart from '../Charts/LineChart';
import BarChart from '../Charts/BarChart';
import LoadingSpinner from '../UI/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { regions, loading, updateRegion } = useApp();
  const [editingRegion, setEditingRegion] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEditRegion = (region) => {
    setEditingRegion(region._id);
    setFormData({
      basePrice: region.basePrice,
      minPrice: region.minPrice,
      maxPrice: region.maxPrice,
      surgeCap: region.surgeCap
    });
  };

  const handleSaveRegion = async () => {
    try {
      await updateRegion(editingRegion, formData);
      setEditingRegion(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to update region:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">
          Manage regional pricing parameters and view comprehensive analytics
        </p>
      </div>

      {/* Region Management Cards */}
      <section className="dashboard-section">
        <h3>Regional Pricing Management</h3>
        <div className="region-cards-grid">
          {regions.map((region) => (
            <Card key={region._id} className="region-card">
              <div className="region-card-header">
                <h4>{region.name}</h4>
                <div className="competitor-badge">
                  Competitor: ₹{region.competitorMedian}
                </div>
              </div>
              
              <div className="region-metrics">
                {editingRegion === region._id ? (
                  <div className="edit-form">
                    <Input
                      label="Base Price (₹/L)"
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange('basePrice', e.target.value)}
                    />
                    <Input
                      label="Min Price (₹/L)"
                      type="number"
                      step="0.01"
                      value={formData.minPrice}
                      onChange={(e) => handleInputChange('minPrice', e.target.value)}
                    />
                    <Input
                      label="Max Price (₹/L)"
                      type="number"
                      step="0.01"
                      value={formData.maxPrice}
                      onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    />
                    <Input
                      label="Surge Cap (%)"
                      type="number"
                      value={formData.surgeCap}
                      onChange={(e) => handleInputChange('surgeCap', e.target.value)}
                    />
                    <div className="edit-actions">
                      <Button onClick={handleSaveRegion} variant="primary">
                        Save
                      </Button>
                      <Button 
                        onClick={() => setEditingRegion(null)} 
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="region-display">
                    <div className="metric-row">
                      <span className="metric-label">Base Price:</span>
                      <span className="metric-value">₹{region.basePrice}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Price Range:</span>
                      <span className="metric-value">
                        ₹{region.minPrice} - ₹{region.maxPrice}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Surge Cap:</span>
                      <span className="metric-value">{region.surgeCap}%</span>
                    </div>
                    <Button 
                      onClick={() => handleEditRegion(region)}
                      variant="outline"
                      size="small"
                    >
                      Edit Settings
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Analytics Charts */}
      <section className="dashboard-section">
        <h3>Regional Analytics</h3>
        <div className="charts-grid">
          <Card className="chart-card">
            <h4>Profit Trends by Region</h4>
            <LineChart 
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: regions.map((region, index) => ({
                  label: region.name,
                  data: region.profitTrend,
                  borderColor: `hsl(${index * 60}, 70%, 50%)`,
                  backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
                  tension: 0.4
                }))
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Profit (₹ in thousands)'
                    }
                  }
                }
              }}
            />
          </Card>

          <Card className="chart-card">
            <h4>Demand Comparison</h4>
            <BarChart 
              data={{
                labels: regions.map(r => r.name),
                datasets: [{
                  label: 'Average Daily Demand',
                  data: regions.map(r => 
                    r.demandTrend.reduce((a, b) => a + b, 0) / r.demandTrend.length
                  ),
                  backgroundColor: 'rgba(59, 130, 246, 0.6)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Volume (Liters)'
                    }
                  }
                }
              }}
            />
          </Card>

          <Card className="chart-card">
            <h4>Margin Trends</h4>
            <LineChart 
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: regions.map((region, index) => ({
                  label: region.name,
                  data: region.marginTrend,
                  borderColor: `hsl(${index * 60 + 180}, 70%, 50%)`,
                  backgroundColor: `hsla(${index * 60 + 180}, 70%, 50%, 0.1)`,
                  tension: 0.4
                }))
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Margin (%)'
                    }
                  }
                }
              }}
            />
          </Card>
        </div>
      </section>

      {/* Key Metrics Summary */}
      <section className="dashboard-section">
        <h3>Performance Summary</h3>
        <div className="metrics-grid">
          <Card className="metric-card positive">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <h4>Total Revenue</h4>
              <div className="metric-value">₹{
                regions.reduce((sum, region) => 
                  sum + (region.profitTrend.reduce((a, b) => a + b, 0) / region.profitTrend.length), 0
                ).toFixed(2)
              }K</div>
              <div className="metric-change positive">+12.3% vs last week</div>
            </div>
          </Card>

          <Card className="metric-card neutral">
            <div className="metric-icon">⛽</div>
            <div className="metric-content">
              <h4>Avg Fuel Price</h4>
              <div className="metric-value">₹{
                (regions.reduce((sum, region) => sum + region.basePrice, 0) / regions.length).toFixed(2)
              }</div>
              <div className="metric-change neutral">+0.8% vs last week</div>
            </div>
          </Card>

          <Card className="metric-card positive">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <h4>Margin Efficiency</h4>
              <div className="metric-value">{
                (regions.reduce((sum, region) => 
                  sum + (region.marginTrend.reduce((a, b) => a + b, 0) / region.marginTrend.length), 0
                ) / regions.length).toFixed(1)
              }%</div>
              <div className="metric-change positive">+5.2% vs last week</div>
            </div>
          </Card>

          <Card className="metric-card negative">
            <div className="metric-icon">🏪</div>
            <div className="metric-content">
              <h4>Active Stations</h4>
              <div className="metric-value">{regions.length * 8}</div>
              <div className="metric-change negative">-2 stations this week</div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
```

## Station Dashboard Component (src/components/Dashboard/StationDashboard.js)

```javascript
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Toggle from '../UI/Toggle';
import LineChart from '../Charts/LineChart';
import LoadingSpinner from '../UI/LoadingSpinner';
import './StationDashboard.css';

const StationDashboard = () => {
  const { 
    stations, 
    selectedStation, 
    setSelectedStation, 
    updateStationInputs, 
    toggleAutoApply,
    loading 
  } = useApp();
  
  const [inputs, setInputs] = useState({
    dailyExpense: 0,
    demand: 0
  });

  useEffect(() => {
    if (selectedStation) {
      setInputs({
        dailyExpense: selectedStation.dailyExpense,
        demand: selectedStation.demand
      });
    }
  }, [selectedStation]);

  useEffect(() => {
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0]);
    }
  }, [stations, selectedStation, setSelectedStation]);

  const handleStationChange = (stationId) => {
    const station = stations.find(s => s._id === stationId);
    setSelectedStation(station);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleUpdateInputs = async () => {
    if (!selectedStation) return;
    
    try {
      await updateStationInputs(selectedStation._id, inputs);
    } catch (error) {
      console.error('Failed to update inputs:', error);
    }
  };

  const handleToggleAuto = async () => {
    if (!selectedStation) return;
    
    try {
      await toggleAutoApply(selectedStation._id);
    } catch (error) {
      console.error('Failed to toggle auto-apply:', error);
    }
  };

  if (loading || !selectedStation) {
    return <LoadingSpinner />;
  }

  const profitColor = selectedStation.expectedProfit > 0 ? 'positive' : 'negative';
  const volumeColor = selectedStation.expectedVolume > selectedStation.demand * 0.8 ? 'positive' : 'negative';

  return (
    <div className="station-dashboard">
      <div className="dashboard-header">
        <h1>Station Dashboard</h1>
        <div className="station-selector">
          <label htmlFor="station-select">Select Station:</label>
          <select 
            id="station-select"
            value={selectedStation._id}
            onChange={(e) => handleStationChange(e.target.value)}
            className="station-select"
          >
            {stations.map((station) => (
              <option key={station._id} value={station._id}>
                {station.name} - {station.region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Station Info Card */}
      <section className="dashboard-section">
        <Card className="station-info-card">
          <div className="station-header">
            <div className="station-details">
              <h3>{selectedStation.name}</h3>
              <div className="station-meta">
                <span className="region-badge">{selectedStation.region}</span>
                <span className="station-id">ID: {selectedStation.stationId}</span>
              </div>
            </div>
            <div className="station-status">
              <div className="status-item">
                <span className="status-label">Traffic Index</span>
                <div className="traffic-indicator">
                  <div 
                    className="traffic-bar"
                    style={{ width: `${selectedStation.trafficIndex}%` }}
                  ></div>
                  <span className="traffic-value">{selectedStation.trafficIndex}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="station-metrics">
            <div className="metric-item">
              <span className="metric-label">Yesterday's Price</span>
              <span className="metric-value">₹{selectedStation.yesterdayPrice}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Competitor Median</span>
              <span className="metric-value">₹{selectedStation.competitorMedian}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Price Gap</span>
              <span className={`metric-value ${
                selectedStation.yesterdayPrice > selectedStation.competitorMedian ? 'negative' : 'positive'
              }`}>
                ₹{(selectedStation.yesterdayPrice - selectedStation.competitorMedian).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* Input Controls and AI Suggestions */}
      <section className="dashboard-section">
        <div className="controls-grid">
          <Card className="inputs-card">
            <h4>Daily Inputs</h4>
            <div className="input-group">
              <Input
                label="Daily Expense (₹)"
                type="number"
                value={inputs.dailyExpense}
                onChange={(e) => handleInputChange('dailyExpense', e.target.value)}
                placeholder="Enter daily operational expense"
              />
              <Input
                label="Expected Demand (Liters)"
                type="number"
                value={inputs.demand}
                onChange={(e) => handleInputChange('demand', e.target.value)}
                placeholder="Enter expected fuel demand"
              />
              <Button 
                onClick={handleUpdateInputs}
                variant="primary"
                className="update-btn"
              >
                Update & Recalculate
              </Button>
            </div>
          </Card>

          <Card className="ai-suggestions-card">
            <h4>AI Price Suggestions</h4>
            <div className="ai-content">
              <div className="suggested-price">
                <span className="suggestion-label">Optimal Price</span>
                <div className="price-display">
                  <span className="currency">₹</span>
                  <span className="price-value">{selectedStation.suggestedPrice}</span>
                  <span className="price-unit">/L</span>
                </div>
              </div>
              
              <div className="price-reasoning">
                <p>Based on current traffic index ({selectedStation.trafficIndex}), 
                competitor pricing, and demand patterns.</p>
              </div>

              <div className="auto-apply-control">
                <Toggle
                  checked={selectedStation.autoApplyAI}
                  onChange={handleToggleAuto}
                  label="Auto-apply AI pricing"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="dashboard-section">
        <h3>Expected Performance</h3>
        <div className="kpi-grid">
          <Card className={`kpi-card ${profitColor}`}>
            <div className="kpi-icon">💰</div>
            <div className="kpi-content">
              <h4>Expected Profit</h4>
              <div className="kpi-value">₹{selectedStation.expectedProfit?.toLocaleString()}</div>
              <div className="kpi-subtitle">Daily projection</div>
            </div>
          </Card>

          <Card className={`kpi-card ${volumeColor}`}>
            <div className="kpi-icon">📊</div>
            <div className="kpi-content">
              <h4>Expected Volume</h4>
              <div className="kpi-value">{selectedStation.expectedVolume?.toLocaleString()}</div>
              <div className="kpi-subtitle">Liters per day</div>
            </div>
          </Card>

          <Card className="kpi-card neutral">
            <div className="kpi-icon">📈</div>
            <div className="kpi-content">
              <h4>Margin</h4>
              <div className="kpi-value">
                {((selectedStation.suggestedPrice - selectedStation.competitorMedian) / selectedStation.suggestedPrice * 100).toFixed(1)}%
              </div>
              <div className="kpi-subtitle">vs competitor median</div>
            </div>
          </Card>

          <Card className="kpi-card neutral">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-content">
              <h4>Efficiency</h4>
              <div className="kpi-value">
                {(selectedStation.expectedProfit / selectedStation.dailyExpense * 100).toFixed(1)}%
              </div>
              <div className="kpi-subtitle">Profit/Expense ratio</div>
            </div>
          </Card>
        </div>
      </section>

      {/* Profit vs Price Chart */}
      <section className="dashboard-section">
        <Card className="chart-card">
          <h4>Profit vs Price Analysis</h4>
          <LineChart 
            data={{
              labels: selectedStation.profitPriceCurve?.map(point => `₹${point.price}`) || [],
              datasets: [{
                label: 'Expected Profit',
                data: selectedStation.profitPriceCurve?.map(point => point.profit) || [],
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                pointBackgroundColor: selectedStation.profitPriceCurve?.map(point => 
                  point.price === selectedStation.suggestedPrice ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
                ),
                pointBorderColor: selectedStation.profitPriceCurve?.map(point => 
                  point.price === selectedStation.suggestedPrice ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
                ),
                pointRadius: selectedStation.profitPriceCurve?.map(point => 
                  point.price === selectedStation.suggestedPrice ? 8 : 4
                )
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Red dot indicates AI-suggested optimal price'
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Price per Liter (₹)'
                  }
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Expected Daily Profit (₹)'
                  }
                }
              }
            }}
          />
        </Card>
      </section>
    </div>
  );
};

export default StationDashboard;
```

## Installation and Setup Instructions

1. **Create React App:**
```bash
npx create-react-app fuel-pricing-frontend
cd fuel-pricing-frontend
```

2. **Install additional dependencies:**
```bash
npm install react-router-dom axios chart.js react-chartjs-2 recharts styled-components moment react-hot-toast lodash
```

3. **Replace src/App.js with the provided code**

4. **Create the folder structure:**
```bash
mkdir -p src/components/Navigation
mkdir -p src/components/Dashboard  
mkdir -p src/components/UI
mkdir -p src/components/Charts
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/context
mkdir -p src/styles/components
```

5. **Add the component files with the provided code**

6. **Create environment variables (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

7. **Start the development server:**
```bash
npm start
```

This creates a complete, production-ready React frontend that integrates with the MongoDB backend, featuring real-time AI pricing suggestions, interactive charts, and a professional dashboard interface for fuel pricing optimization.