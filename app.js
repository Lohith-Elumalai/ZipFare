// Zipfare AI-Driven Fuel Pricing Optimization Platform
// Modern React-inspired JavaScript Architecture

'use strict';

// Application Configuration
const CONFIG = {
    APP_NAME: 'Zipfare',
    VERSION: '2.0.0',
    MONGODB_URI: 'mongodb+srv://lohith0404:zftrain@cluster0.u7cxmci.mongodb.net/ZF-train',
    DATABASE: 'fuel_pricing_ai',
    API_BASE: 'http://localhost:8000',
    WEBSOCKET_URL: 'ws://localhost:8000/ws',
    UPDATE_INTERVAL: 30000, // 30 seconds
    CHART_COLORS: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
};

// Application Data Store (Simulating MongoDB data)
const DATA_STORE = {
    cities: [
        {id: 1, name: "Mumbai", state: "Maharashtra", region: "West", petrol: 106.23, diesel: 98.45, weather: "Clear", temp: 29, traffic: 1.4, confidence: 92.1, lat: 19.0760, lng: 72.8777},
        {id: 2, name: "Delhi", state: "Delhi", region: "North", petrol: 96.78, diesel: 89.23, weather: "Cloudy", temp: 31, traffic: 1.8, confidence: 90.8, lat: 28.7041, lng: 77.1025},
        {id: 3, name: "Bengaluru", state: "Karnataka", region: "South", petrol: 104.56, diesel: 95.67, weather: "Rain", temp: 22, traffic: 1.2, confidence: 93.5, lat: 12.9716, lng: 77.5946},
        {id: 4, name: "Chennai", state: "Tamil Nadu", region: "South", petrol: 102.34, diesel: 96.78, weather: "Clear", temp: 32, traffic: 1.3, confidence: 91.7, lat: 13.0827, lng: 80.2707},
        {id: 5, name: "Kolkata", state: "West Bengal", region: "East", petrol: 97.89, diesel: 92.34, weather: "Cloudy", temp: 28, traffic: 1.1, confidence: 89.4, lat: 22.5726, lng: 88.3639},
        {id: 6, name: "Hyderabad", state: "Telangana", region: "South", petrol: 103.45, diesel: 95.23, weather: "Clear", temp: 30, traffic: 1.25, confidence: 92.8, lat: 17.3850, lng: 78.4867},
        {id: 7, name: "Pune", state: "Maharashtra", region: "West", petrol: 107.12, diesel: 99.67, weather: "Thunderstorm", temp: 26, traffic: 0.9, confidence: 88.9, lat: 18.5204, lng: 73.8567},
        {id: 8, name: "Ahmedabad", state: "Gujarat", region: "West", petrol: 105.87, diesel: 98.23, weather: "Clear", temp: 33, traffic: 1.6, confidence: 91.3, lat: 23.0225, lng: 72.5714}
    ],
    aiModels: {
        petrol: { name: "Gradient Boosting Regressor", accuracy: 91.2, mae: 0.86, rmse: 1.06, r2_score: 0.912, status: "active", last_trained: "2025-08-28T10:15:00Z", predictions_today: 1247, features_count: 26 },
        diesel: { name: "Gradient Boosting Regressor", accuracy: 94.1, mae: 0.66, rmse: 0.82, r2_score: 0.941, status: "active", last_trained: "2025-08-28T10:15:00Z", predictions_today: 1156, features_count: 26 }
    },
    economicIndicators: {
        crude_oil_brent: 87.45, crude_oil_change: 1.23, crude_oil_change_percent: 1.43, inr_usd_rate: 83.42, currency_change: -0.15, currency_change_percent: -0.18, inflation_rate: 3.2, interest_rate: 6.5, last_update: "2025-08-28T14:05:00Z"
    },
    systemMetrics: {
        total_stations: 1247, active_stations: 1198, daily_volume_liters: 2847000, daily_revenue: 289470000, average_margin: 8.4, customer_satisfaction: 4.2, api_uptime: 99.97, mongodb_connection: "healthy", prediction_accuracy: 92.65
    },
    featureImportance: {
        region_encoded: 76.5, crude_oil_price: 10.3, demand_supply_ratio: 6.0, transport_cost: 4.9, weather_conditions: 1.2, traffic_index: 1.1, seasonal_factor: 0.8, competition_level: 0.7, inventory_status: 0.5
    },
    regionalPerformance: {
        North: {revenue: 89450000, margin: 8.2, volume: 890000, satisfaction: 4.1, growth: 5.2},
        South: {revenue: 95670000, margin: 8.6, volume: 920000, satisfaction: 4.3, growth: 6.8},
        West: {revenue: 87230000, margin: 8.1, volume: 850000, satisfaction: 4.0, growth: 4.1},
        East: {revenue: 67120000, margin: 7.8, volume: 660000, satisfaction: 4.2, growth: 3.9},
        Central: {revenue: 72580000, margin: 8.3, volume: 720000, satisfaction: 4.1, growth: 5.7}
    },
    historicalTrends: {
        dates: ["2025-08-22", "2025-08-23", "2025-08-24", "2025-08-25", "2025-08-26", "2025-08-27", "2025-08-28"],
        petrol_prices: [103.2, 103.8, 104.1, 103.9, 104.3, 104.7, 105.1],
        diesel_prices: [95.8, 96.2, 96.5, 96.1, 96.7, 97.0, 97.4],
        volumes: [2650000, 2720000, 2800000, 2680000, 2890000, 2950000, 2847000],
        revenues: [271000000, 278500000, 285200000, 273800000, 294700000, 301200000, 289470000]
    }
};

// Global Application State Management
class AppState {
    constructor() {
        this.state = {
            currentRoute: 'dashboard',
            isLoading: false,
            isConnected: false,
            websocketConnected: false,
            selectedCity: 'Mumbai',
            data: DATA_STORE,
            charts: {},
            realTimeData: {},
            notifications: [],
            errors: []
        };
        this.listeners = [];
        this.updateInterval = null;
        this.websocketSimulation = null;
    }

    // State management methods
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Data mutation methods with real-time simulation
    updateCityData(cityName, updates) {
        const city = this.state.data.cities.find(c => c.name === cityName);
        if (city) {
            Object.assign(city, updates);
            this.setState({ data: { ...this.state.data } });
        }
    }

    addNotification(notification) {
        const notifications = [...this.state.notifications, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...notification
        }];
        this.setState({ notifications });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.setState({
                notifications: this.state.notifications.filter(n => n.id !== notification.id)
            });
        }, 5000);
    }

    simulateRealTimeUpdates() {
        // Simulate real-time price fluctuations
        this.state.data.cities.forEach(city => {
            const priceVariation = (Math.random() - 0.5) * 0.3;
            city.petrol = Math.max(90, city.petrol + priceVariation);
            city.diesel = Math.max(85, city.diesel + priceVariation * 0.8);
            city.confidence = Math.min(95, Math.max(85, city.confidence + (Math.random() - 0.5) * 1.5));
        });

        // Update economic indicators
        this.state.data.economicIndicators.crude_oil_brent += (Math.random() - 0.5) * 0.5;
        this.state.data.economicIndicators.inr_usd_rate += (Math.random() - 0.5) * 0.1;

        this.setState({ 
            data: { ...this.state.data },
            realTimeData: { lastUpdate: new Date().toISOString() }
        });
    }
}

// MongoDB Connection Simulator
class MongoDBService {
    constructor() {
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
    }

    async connect() {
        appState.setState({ isLoading: true });
        this.connectionAttempts++;
        
        // Simulate connection process
        const loadingSteps = [
            { text: 'Connecting to MongoDB cluster...', progress: 20 },
            { text: 'Authenticating credentials...', progress: 40 },
            { text: 'Loading fuel pricing data...', progress: 60 },
            { text: 'Initializing AI models...', progress: 80 },
            { text: 'Starting real-time updates...', progress: 100 }
        ];

        for (let step of loadingSteps) {
            await this.updateLoadingProgress(step.text, step.progress);
            await this.delay(800);
        }

        if (this.connectionAttempts <= this.maxRetries && Math.random() > 0.1) {
            this.isConnected = true;
            appState.setState({ 
                isLoading: false, 
                isConnected: true,
                data: DATA_STORE 
            });
            
            this.updateConnectionStatus(true);
            this.startWebSocketSimulation();
            
            return { success: true, data: DATA_STORE };
        } else {
            this.isConnected = false;
            appState.setState({ isLoading: false, isConnected: false });
            this.updateConnectionStatus(false);
            throw new Error('Failed to connect to MongoDB cluster');
        }
    }

    async updateLoadingProgress(text, progress) {
        const loadingText = document.getElementById('loadingText');
        const progressBar = document.getElementById('loadingProgress');
        
        if (loadingText) loadingText.textContent = text;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('mongoStatus');
        const textElement = document.getElementById('connectionText');
        
        if (statusElement && textElement) {
            if (connected) {
                statusElement.classList.add('connected');
                textElement.textContent = 'MongoDB Connected';
            } else {
                statusElement.classList.add('error');
                textElement.textContent = 'Connection Failed';
            }
        }
    }

    startWebSocketSimulation() {
        const wsStatus = document.getElementById('websocketStatus');
        const wsStatusText = document.getElementById('wsStatusText');
        const wsIndicator = document.querySelector('.ws-indicator');
        
        setTimeout(() => {
            appState.setState({ websocketConnected: true });
            if (wsStatusText) wsStatusText.textContent = 'Connected';
            if (wsIndicator) wsIndicator.classList.add('connected');
        }, 2000);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchData(collection) {
        if (!this.isConnected) {
            throw new Error('MongoDB not connected');
        }
        
        // Simulate API latency
        await this.delay(200);
        return { success: true, data: DATA_STORE };
    }

    async updateData(collection, data) {
        if (!this.isConnected) {
            throw new Error('MongoDB not connected');
        }
        
        await this.delay(150);
        return { success: true, updated: true };
    }
}

// Utility Functions
const Utils = {
    formatCurrency: (amount, decimals = 2) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount);
    },

    formatNumber: (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    },

    formatLargeNumber: (num) => {
        if (num >= 10000000) {
            return (num / 10000000).toFixed(1) + 'Cr';
        } else if (num >= 100000) {
            return (num / 100000).toFixed(1) + 'L';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    getCurrentTime: () => {
        return new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    },

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Toast Notification System
class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
    }

    show(message, type = 'info', duration = 4000) {
        if (!this.container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
            </div>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        return toast;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
}

// Navigation Router - Fixed Implementation
class Router {
    constructor() {
        this.currentRoute = 'dashboard';
        this.routes = ['dashboard', 'pricing', 'analytics', 'operations'];
        this.initialized = false;
    }

    initialize() {
        console.log('Initializing Router...');
        this.initializeNavigation();
        this.initialized = true;
    }

    initializeNavigation() {
        const navButtons = document.querySelectorAll('.nav-button');
        console.log(`Found ${navButtons.length} navigation buttons`);
        
        navButtons.forEach((button, index) => {
            const route = button.getAttribute('data-route');
            console.log(`Setting up navigation for button ${index}: ${route}`);
            
            // Remove any existing listeners
            button.replaceWith(button.cloneNode(true));
            const newButton = document.querySelectorAll('.nav-button')[index];
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Navigation button clicked: ${route}`);
                this.navigateTo(route);
            });
        });
    }

    navigateTo(route) {
        console.log(`Navigating to: ${route}`);
        
        if (!this.routes.includes(route)) {
            console.warn(`Invalid route: ${route}`);
            return false;
        }

        try {
            // Update navigation state
            const navButtons = document.querySelectorAll('.nav-button');
            navButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`[data-route="${route}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
                console.log(`Set active navigation button for: ${route}`);
            }

            // Show/hide sections
            const allSections = document.querySelectorAll('.page-section');
            console.log(`Found ${allSections.length} page sections`);
            
            allSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });

            const targetSection = document.getElementById(route);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.style.display = 'block';
                console.log(`Activated section: ${route}`);
            } else {
                console.error(`Target section not found: ${route}`);
                return false;
            }

            this.currentRoute = route;
            appState.setState({ currentRoute: route });

            // Initialize route-specific components
            setTimeout(() => {
                this.initializeRoute(route);
            }, 100);
            
            return true;
            
        } catch (error) {
            console.error('Navigation error:', error);
            return false;
        }
    }

    initializeRoute(route) {
        console.log(`Initializing route components for: ${route}`);
        
        try {
            switch (route) {
                case 'dashboard':
                    DashboardComponent.initialize();
                    break;
                case 'pricing':
                    PricingComponent.initialize();
                    break;
                case 'analytics':
                    AnalyticsComponent.initialize();
                    break;
                case 'operations':
                    OperationsComponent.initialize();
                    break;
            }
        } catch (error) {
            console.error(`Error initializing route ${route}:`, error);
        }
    }
}

// Dashboard Component
class DashboardComponent {
    static initialize() {
        console.log('Initializing Dashboard Component');
        this.renderPriceTicker();
        this.renderEconomicIndicators();
        this.renderPredictionCenter();
        this.renderKPIGrid();
        this.renderAlerts();
        this.renderTrendsChart();
        this.setupEventListeners();
    }

    static renderPriceTicker() {
        const container = document.getElementById('priceTicker');
        if (!container) return;

        const { cities } = appState.getState().data;
        
        container.innerHTML = cities.slice(0, 6).map(city => {
            const change = (Math.random() - 0.5) * 1.0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSymbol = change >= 0 ? '+' : '';
            
            return `
                <div class="price-item" data-city="${city.name}" style="cursor: pointer;">
                    <div class="price-city">${city.name}</div>
                    <div class="price-value">₹${city.petrol.toFixed(2)}</div>
                    <div class="price-change ${changeClass}">${changeSymbol}${change.toFixed(2)}</div>
                    <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 4px;">
                        AI: ${city.confidence.toFixed(1)}%
                    </div>
                </div>
            `;
        }).join('');

        // Add hover effects
        container.querySelectorAll('.price-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const cityName = e.currentTarget.getAttribute('data-city');
                appState.setState({ selectedCity: cityName });
                this.updatePredictionDisplay();
                toastManager.success(`Selected ${cityName} for detailed analysis`);
            });
        });
    }

    static renderEconomicIndicators() {
        const container = document.getElementById('economicIndicators');
        const lastUpdateElement = document.getElementById('economicLastUpdate');
        
        if (!container) return;

        const { economicIndicators } = appState.getState().data;
        
        container.innerHTML = `
            <div class="economic-item">
                <span class="economic-label">Crude Oil (Brent)</span>
                <div>
                    <span class="economic-value">$${economicIndicators.crude_oil_brent.toFixed(2)}</span>
                    <span class="price-change ${economicIndicators.crude_oil_change >= 0 ? 'positive' : 'negative'}">
                        ${economicIndicators.crude_oil_change >= 0 ? '+' : ''}${economicIndicators.crude_oil_change.toFixed(2)}
                    </span>
                </div>
            </div>
            <div class="economic-item">
                <span class="economic-label">INR/USD</span>
                <div>
                    <span class="economic-value">₹${economicIndicators.inr_usd_rate.toFixed(2)}</span>
                    <span class="price-change ${economicIndicators.currency_change >= 0 ? 'positive' : 'negative'}">
                        ${economicIndicators.currency_change >= 0 ? '+' : ''}${economicIndicators.currency_change.toFixed(2)}
                    </span>
                </div>
            </div>
            <div class="economic-item">
                <span class="economic-label">Inflation Rate</span>
                <span class="economic-value">${economicIndicators.inflation_rate}%</span>
            </div>
            <div class="economic-item">
                <span class="economic-label">Interest Rate</span>
                <span class="economic-value">${economicIndicators.interest_rate}%</span>
            </div>
        `;

        if (lastUpdateElement) {
            lastUpdateElement.textContent = `Updated: ${Utils.getCurrentTime()}`;
        }
    }

    static renderPredictionCenter() {
        const container = document.getElementById('predictionDisplay');
        const citySelector = document.getElementById('predictionCity');
        
        if (!container || !citySelector) return;

        const { cities } = appState.getState().data;
        const selectedCity = appState.getState().selectedCity;

        // Populate city selector and make it functional
        citySelector.innerHTML = cities.map(city => 
            `<option value="${city.name}" ${city.name === selectedCity ? 'selected' : ''}>${city.name}</option>`
        ).join('');

        // Setup change handler - remove existing listeners first
        const newSelector = citySelector.cloneNode(true);
        citySelector.parentNode.replaceChild(newSelector, citySelector);
        
        newSelector.addEventListener('change', (e) => {
            console.log('City selector changed to:', e.target.value);
            appState.setState({ selectedCity: e.target.value });
            this.updatePredictionDisplay();
        });

        this.updatePredictionDisplay();
    }

    static updatePredictionDisplay() {
        const container = document.getElementById('predictionDisplay');
        if (!container) return;

        const { cities } = appState.getState().data;
        const selectedCity = appState.getState().selectedCity;
        const city = cities.find(c => c.name === selectedCity) || cities[0];

        const petrolPrediction = city.petrol + (Math.random() - 0.4) * 0.8;
        const dieselPrediction = city.diesel + (Math.random() - 0.4) * 0.6;

        container.innerHTML = `
            <div class="prediction-item">
                <div class="prediction-fuel">
                    <span>Petrol Prediction (24h)</span>
                    <span class="economic-value">₹${petrolPrediction.toFixed(2)}</span>
                </div>
                <div class="prediction-confidence">
                    Model Confidence: ${city.confidence.toFixed(1)}%
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${city.confidence}%"></div>
                    </div>
                </div>
            </div>
            <div class="prediction-item">
                <div class="prediction-fuel">
                    <span>Diesel Prediction (24h)</span>
                    <span class="economic-value">₹${dieselPrediction.toFixed(2)}</span>
                </div>
                <div class="prediction-confidence">
                    Key Factors: Weather (${city.weather}), Traffic (${city.traffic}x)
                </div>
            </div>
        `;
    }

    static renderKPIGrid() {
        const container = document.getElementById('kpiGrid');
        if (!container) return;

        const { systemMetrics } = appState.getState().data;
        
        const kpis = [
            { label: 'Active Stations', value: Utils.formatNumber(systemMetrics.active_stations), change: '+12 today', positive: true },
            { label: 'Daily Volume', value: Utils.formatLargeNumber(systemMetrics.daily_volume_liters) + 'L', change: '+5.2%', positive: true },
            { label: 'Revenue Today', value: Utils.formatLargeNumber(systemMetrics.daily_revenue), change: '+8.1%', positive: true },
            { label: 'Avg Margin', value: systemMetrics.average_margin.toFixed(1) + '%', change: '+0.3%', positive: true },
            { label: 'AI Accuracy', value: systemMetrics.prediction_accuracy.toFixed(1) + '%', change: '+1.2%', positive: true }
        ];

        container.innerHTML = kpis.map(kpi => `
            <div class="kpi-item">
                <div class="kpi-value">${kpi.value}</div>
                <div class="kpi-label">${kpi.label}</div>
                <div class="kpi-change ${kpi.positive ? 'positive' : 'negative'}">${kpi.change}</div>
            </div>
        `).join('');
    }

    static renderAlerts() {
        const container = document.getElementById('alertsList');
        const countElement = document.getElementById('alertCount');
        
        if (!container) return;

        const alerts = [
            { type: 'critical', city: 'Mumbai', message: 'Price volatility detected', time: Utils.getCurrentTime() },
            { type: 'warning', city: 'Chennai', message: 'Heavy rain expected - demand surge likely', time: Utils.getCurrentTime() },
            { type: 'info', city: 'System', message: 'AI models updated with latest data', time: Utils.getCurrentTime() },
            { type: 'critical', city: 'Delhi', message: 'Competitor price change detected', time: Utils.getCurrentTime() }
        ];

        if (countElement) {
            countElement.textContent = alerts.filter(a => a.type === 'critical').length;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-content">
                    <strong>${alert.city}</strong> - ${alert.message}
                </div>
                <span class="alert-time">${alert.time}</span>
            </div>
        `).join('');
    }

    static renderTrendsChart() {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        const { historicalTrends } = appState.getState().data;
        
        // Destroy existing chart
        if (appState.getState().charts.trends) {
            appState.getState().charts.trends.destroy();
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historicalTrends.dates.map(date => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                }),
                datasets: [
                    {
                        label: 'Petrol Avg Price',
                        data: historicalTrends.petrol_prices,
                        borderColor: CONFIG.CHART_COLORS[0],
                        backgroundColor: `${CONFIG.CHART_COLORS[0]}20`,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: 'Diesel Avg Price',
                        data: historicalTrends.diesel_prices,
                        borderColor: CONFIG.CHART_COLORS[1],
                        backgroundColor: `${CONFIG.CHART_COLORS[1]}20`,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: CONFIG.CHART_COLORS[0],
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price (₹)'
                        }
                    }
                }
            }
        });

        // Store chart reference
        appState.setState({
            charts: { ...appState.getState().charts, trends: chart }
        });
    }

    static setupEventListeners() {
        // Chart period toggles
        const chartToggles = document.querySelectorAll('.chart-toggle');
        chartToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                chartToggles.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const period = e.target.getAttribute('data-period');
                toastManager.info(`Switched to ${period} view`);
            });
        });
    }
}

// Pricing Component
class PricingComponent {
    static initialize() {
        console.log('Initializing Pricing Component');
        this.renderCityMap();
        this.renderPricingControls();
        this.renderDemandChart();
        this.renderImpactGrid();
        this.setupEventListeners();
    }

    static renderCityMap() {
        const container = document.getElementById('cityMap');
        if (!container) return;

        const { cities } = appState.getState().data;
        
        // City positions (approximate coordinates converted to percentages)
        const cityPositions = {
            'Mumbai': { top: '60%', left: '15%' },
            'Delhi': { top: '25%', left: '35%' },
            'Bengaluru': { top: '75%', left: '35%' },
            'Chennai': { top: '80%', left: '45%' },
            'Kolkata': { top: '40%', left: '70%' },
            'Hyderabad': { top: '65%', left: '40%' },
            'Pune': { top: '65%', left: '25%' },
            'Ahmedabad': { top: '45%', left: '20%' }
        };

        container.innerHTML = cities.map(city => {
            const position = cityPositions[city.name] || { top: '50%', left: '50%' };
            const priceClass = city.petrol > 105 ? 'high-price' : 
                              city.petrol > 100 ? 'medium-price' : 'low-price';
            
            return `
                <div class="city-marker ${priceClass}" 
                     style="top: ${position.top}; left: ${position.left}" 
                     data-city="${city.name}"
                     title="${city.name}: ₹${city.petrol.toFixed(2)} | ${city.weather} ${city.temp}°C">
                    ${city.name.substring(0, 3)}
                </div>
            `;
        }).join('');

        // Add click handlers
        container.querySelectorAll('.city-marker').forEach(marker => {
            marker.addEventListener('click', (e) => {
                const cityName = e.target.getAttribute('data-city');
                this.showCityDetails(cityName);
            });
        });
    }

    static showCityDetails(cityName) {
        const { cities } = appState.getState().data;
        const city = cities.find(c => c.name === cityName);
        if (!city) return;

        toastManager.success(`${city.name} Details: Petrol: ₹${city.petrol.toFixed(2)}, Diesel: ₹${city.diesel.toFixed(2)}, Weather: ${city.weather} ${city.temp}°C, Traffic: ${city.traffic}x normal, AI Confidence: ${city.confidence.toFixed(1)}%`);
    }

    static renderPricingControls() {
        const container = document.getElementById('pricingControls');
        if (!container) return;

        const { cities } = appState.getState().data;
        const topCities = cities.slice(0, 4);

        container.innerHTML = topCities.map(city => {
            const aiRecommendation = city.petrol + (Math.random() - 0.5) * 0.8;
            
            return `
                <div class="price-control-item">
                    <div class="price-control-header">
                        <span><strong>${city.name}</strong></span>
                        <span>Current: ₹${city.petrol.toFixed(2)}</span>
                    </div>
                    <input type="range" 
                           class="price-slider" 
                           min="${(city.petrol - 3).toFixed(2)}" 
                           max="${(city.petrol + 3).toFixed(2)}" 
                           step="0.01" 
                           value="${city.petrol.toFixed(2)}"
                           data-city="${city.name}">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--color-text-secondary); margin-top: 8px;">
                        <span>AI Rec: ₹${aiRecommendation.toFixed(2)}</span>
                        <span>Confidence: ${city.confidence.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    static renderDemandChart() {
        const ctx = document.getElementById('demandChart');
        if (!ctx) return;

        if (appState.getState().charts.demand) {
            appState.getState().charts.demand.destroy();
        }

        const forecastData = {
            labels: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Predicted Demand Index',
                    data: [100, 105, 98, 112, 108, 95, 102],
                    borderColor: CONFIG.CHART_COLORS[2],
                    backgroundColor: `${CONFIG.CHART_COLORS[2]}20`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Weather Impact',
                    data: [0, 5, -2, 8, 3, -10, -3],
                    borderColor: CONFIG.CHART_COLORS[4],
                    backgroundColor: `${CONFIG.CHART_COLORS[4]}20`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: forecastData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Index / Impact (%)'
                        }
                    }
                }
            }
        });

        appState.setState({
            charts: { ...appState.getState().charts, demand: chart }
        });
    }

    static renderImpactGrid() {
        const container = document.getElementById('impactGrid');
        if (!container) return;

        const { cities } = appState.getState().data;
        const avgTemp = cities.reduce((sum, city) => sum + city.temp, 0) / cities.length;
        const avgTraffic = cities.reduce((sum, city) => sum + city.traffic, 0) / cities.length;

        container.innerHTML = `
            <div class="impact-item" style="padding: 16px; background: var(--color-bg-1); border-radius: 8px; margin-bottom: 12px;">
                <h4 style="margin: 0 0 12px 0;">Weather Impact</h4>
                <div class="impact-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Avg Temperature</span>
                    <span>${avgTemp.toFixed(1)}°C</span>
                </div>
                <div class="impact-metric" style="display: flex; justify-content: space-between;">
                    <span>Rain Affected Cities</span>
                    <span>${cities.filter(c => c.weather === 'Rain').length}</span>
                </div>
            </div>
            <div class="impact-item" style="padding: 16px; background: var(--color-bg-2); border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0;">Traffic Impact</h4>
                <div class="impact-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Avg Traffic Index</span>
                    <span>${avgTraffic.toFixed(2)}x</span>
                </div>
                <div class="impact-metric" style="display: flex; justify-content: space-between;">
                    <span>High Traffic Cities</span>
                    <span>${cities.filter(c => c.traffic > 1.5).length}</span>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // Map overlay controls
        const overlayButtons = document.querySelectorAll('.map-overlay');
        overlayButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                overlayButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const overlay = e.target.getAttribute('data-overlay');
                toastManager.info(`Switched to ${overlay} overlay`);
            });
        });

        // Pricing sliders
        const priceSliders = document.querySelectorAll('.price-slider');
        priceSliders.forEach(slider => {
            slider.addEventListener('input', Utils.debounce((e) => {
                const cityName = e.target.getAttribute('data-city');
                const newPrice = parseFloat(e.target.value);
                
                appState.updateCityData(cityName, { petrol: newPrice });
                toastManager.success(`Updated ${cityName} price to ₹${newPrice.toFixed(2)}`);
            }, 300));
        });

        // AI Auto-pricing toggle
        const aiModeToggle = document.getElementById('aiMode');
        if (aiModeToggle) {
            aiModeToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                toastManager.info(`AI Auto-pricing ${enabled ? 'enabled' : 'disabled'}`);
            });
        }
    }
}

// Analytics Component
class AnalyticsComponent {
    static initialize() {
        console.log('Initializing Analytics Component');
        this.renderModelMetrics();
        this.renderFeatureChart();
        this.renderRegionalPerformance();
        this.renderScenarios();
        this.renderHistoricalMetrics();
        this.setupEventListeners();
    }

    static renderModelMetrics() {
        const container = document.getElementById('modelMetrics');
        if (!container) return;

        const { aiModels } = appState.getState().data;
        
        container.innerHTML = `
            <div class="model-card" style="padding: 16px; background: var(--color-bg-1); border-radius: 8px; border: 1px solid var(--color-border);">
                <div class="model-title" style="font-weight: bold; margin-bottom: 12px; color: var(--color-text);">Petrol Price Model</div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Algorithm:</span>
                    <span>${aiModels.petrol.name}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Accuracy:</span>
                    <span>${aiModels.petrol.accuracy}%</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>MAE:</span>
                    <span>${aiModels.petrol.mae}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>RMSE:</span>
                    <span>${aiModels.petrol.rmse}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>R² Score:</span>
                    <span>${aiModels.petrol.r2_score}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between;">
                    <span>Predictions Today:</span>
                    <span>${Utils.formatNumber(aiModels.petrol.predictions_today)}</span>
                </div>
            </div>
            <div class="model-card" style="padding: 16px; background: var(--color-bg-2); border-radius: 8px; border: 1px solid var(--color-border);">
                <div class="model-title" style="font-weight: bold; margin-bottom: 12px; color: var(--color-text);">Diesel Price Model</div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Algorithm:</span>
                    <span>${aiModels.diesel.name}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Accuracy:</span>
                    <span>${aiModels.diesel.accuracy}%</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>MAE:</span>
                    <span>${aiModels.diesel.mae}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>RMSE:</span>
                    <span>${aiModels.diesel.rmse}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>R² Score:</span>
                    <span>${aiModels.diesel.r2_score}</span>
                </div>
                <div class="model-stat" style="display: flex; justify-content: space-between;">
                    <span>Predictions Today:</span>
                    <span>${Utils.formatNumber(aiModels.diesel.predictions_today)}</span>
                </div>
            </div>
        `;
    }

    static renderFeatureChart() {
        const ctx = document.getElementById('featureChart');
        if (!ctx) return;

        if (appState.getState().charts.features) {
            appState.getState().charts.features.destroy();
        }

        const { featureImportance } = appState.getState().data;
        const features = Object.entries(featureImportance).sort(([,a], [,b]) => b - a);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: features.map(([name]) => name.replace('_', ' ').toUpperCase()),
                datasets: [{
                    label: 'Feature Importance (%)',
                    data: features.map(([, importance]) => importance),
                    backgroundColor: CONFIG.CHART_COLORS,
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Importance (%)'
                        }
                    }
                }
            }
        });

        appState.setState({
            charts: { ...appState.getState().charts, features: chart }
        });
    }

    static renderRegionalPerformance() {
        const container = document.getElementById('regionalPerformance');
        if (!container) return;

        const { regionalPerformance } = appState.getState().data;

        container.innerHTML = Object.entries(regionalPerformance).map(([region, data]) => `
            <div class="regional-item" style="padding: 16px; background: var(--color-bg-3); border-radius: 8px; border: 1px solid var(--color-border); text-align: center;">
                <div class="regional-title" style="font-weight: bold; margin-bottom: 12px; color: var(--color-text);">${region}</div>
                <div class="regional-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Revenue:</span>
                    <span>${Utils.formatLargeNumber(data.revenue)}</span>
                </div>
                <div class="regional-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Margin:</span>
                    <span>${data.margin}%</span>
                </div>
                <div class="regional-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Volume:</span>
                    <span>${Utils.formatLargeNumber(data.volume)}L</span>
                </div>
                <div class="regional-stat" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Satisfaction:</span>
                    <span>${data.satisfaction}/5 ⭐</span>
                </div>
                <div class="regional-stat" style="display: flex; justify-content: space-between;">
                    <span>Growth:</span>
                    <span class="${data.growth >= 0 ? 'positive' : 'negative'}">${data.growth >= 0 ? '+' : ''}${data.growth}%</span>
                </div>
            </div>
        `).join('');
    }

    static renderScenarios() {
        const container = document.getElementById('scenarioResults');
        if (!container) return;

        this.updateScenarioResults('current');
    }

    static updateScenarioResults(scenario) {
        const container = document.getElementById('scenarioResults');
        
        const scenarioData = {
            'current': {
                'Revenue Impact': { value: '+2.5%', positive: true },
                'Volume Change': { value: '+1.8%', positive: true },
                'Margin Effect': { value: '+0.3%', positive: true },
                'Risk Level': { value: 'Low', positive: true },
                'Customer Impact': { value: 'Neutral', positive: true }
            },
            'oil_spike': {
                'Revenue Impact': { value: '-5.2%', positive: false },
                'Volume Change': { value: '-8.1%', positive: false },
                'Margin Effect': { value: '+2.1%', positive: true },
                'Risk Level': { value: 'High', positive: false },
                'Customer Impact': { value: 'Negative', positive: false }
            },
            'economic_downturn': {
                'Revenue Impact': { value: '-12.3%', positive: false },
                'Volume Change': { value: '-15.6%', positive: false },
                'Margin Effect': { value: '-1.2%', positive: false },
                'Risk Level': { value: 'Critical', positive: false },
                'Customer Impact': { value: 'Severe', positive: false }
            },
            'monsoon': {
                'Revenue Impact': { value: '+3.1%', positive: true },
                'Volume Change': { value: '+4.2%', positive: true },
                'Margin Effect': { value: '+0.8%', positive: true },
                'Risk Level': { value: 'Medium', positive: true },
                'Customer Impact': { value: 'Positive', positive: true }
            },
            'festival_season': {
                'Revenue Impact': { value: '+8.7%', positive: true },
                'Volume Change': { value: '+12.3%', positive: true },
                'Margin Effect': { value: '+1.5%', positive: true },
                'Risk Level': { value: 'Low', positive: true },
                'Customer Impact': { value: 'Very Positive', positive: true }
            }
        };

        const data = scenarioData[scenario];
        container.innerHTML = Object.entries(data).map(([key, value]) => `
            <div class="scenario-item" style="padding: 16px; background: var(--color-bg-4); border-radius: 8px; border: 1px solid var(--color-border); text-align: center;">
                <div class="scenario-impact ${value.positive ? 'positive' : 'negative'}" style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${value.value}</div>
                <div class="metric-label" style="font-size: 12px; color: var(--color-text-secondary);">${key}</div>
            </div>
        `).join('');
    }

    static renderHistoricalMetrics() {
        const container = document.getElementById('historicalMetrics');
        if (!container) return;

        const { aiModels } = appState.getState().data;
        const lastWeekAccuracy = 89.5;
        const lastMonthAccuracy = 87.8;

        container.innerHTML = `
            <div class="historical-item" style="padding: 16px; background: var(--color-bg-5); border-radius: 8px; border: 1px solid var(--color-border);">
                <h4 style="margin: 0 0 16px 0;">Accuracy Trends</h4>
                <div class="historical-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Current:</span>
                    <span class="positive">${((aiModels.petrol.accuracy + aiModels.diesel.accuracy) / 2).toFixed(1)}%</span>
                </div>
                <div class="historical-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Last Week:</span>
                    <span>${lastWeekAccuracy}%</span>
                </div>
                <div class="historical-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Last Month:</span>
                    <span>${lastMonthAccuracy}%</span>
                </div>
                <div class="historical-metric" style="display: flex; justify-content: space-between;">
                    <span>Improvement:</span>
                    <span class="positive">+${(((aiModels.petrol.accuracy + aiModels.diesel.accuracy) / 2) - lastMonthAccuracy).toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // Regional metric selector
        const regionalMetric = document.getElementById('regionalMetric');
        if (regionalMetric) {
            regionalMetric.addEventListener('change', (e) => {
                this.renderRegionalPerformance();
                toastManager.info(`Switched to ${e.target.value} view`);
            });
        }

        // Scenario selector
        const scenarioSelector = document.getElementById('scenarioSelector');
        if (scenarioSelector) {
            scenarioSelector.addEventListener('change', (e) => {
                this.updateScenarioResults(e.target.value);
                toastManager.info(`Analyzing ${e.target.value.replace('_', ' ')} scenario`);
            });
        }

        // Refresh features button
        const refreshFeatures = document.getElementById('refreshFeatures');
        if (refreshFeatures) {
            refreshFeatures.addEventListener('click', () => {
                this.renderFeatureChart();
                toastManager.success('Feature importance analysis refreshed');
            });
        }
    }
}

// Operations Component
class OperationsComponent {
    static initialize() {
        console.log('Initializing Operations Component');
        this.renderSystemHealth();
        this.renderInventoryStatus();
        this.renderFinancialMetrics();
        this.renderAlertCenter();
        this.renderROIMetrics();
        this.setupEventListeners();
    }

    static renderSystemHealth() {
        const container = document.getElementById('systemHealth');
        const uptimeElement = document.getElementById('systemUptime');
        
        if (!container) return;

        const { systemMetrics } = appState.getState().data;

        const healthItems = [
            { name: 'MongoDB', status: 'healthy', details: 'Connected' },
            { name: 'Weather API', status: 'healthy', details: 'Active' },
            { name: 'AI Engine', status: 'healthy', details: 'Running' },
            { name: 'Data Pipeline', status: 'healthy', details: 'Streaming' },
            { name: 'WebSocket', status: appState.getState().websocketConnected ? 'healthy' : 'warning', details: appState.getState().websocketConnected ? 'Connected' : 'Connecting' },
            { name: 'Backup System', status: 'healthy', details: 'Synced' }
        ];

        container.innerHTML = healthItems.map(item => `
            <div class="health-item">
                <div class="health-status ${item.status}"></div>
                <div class="metric-label">${item.name}</div>
                <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 4px;">
                    ${item.details}
                </div>
            </div>
        `).join('');

        if (uptimeElement) {
            uptimeElement.textContent = `${systemMetrics.api_uptime}%`;
        }
    }

    static renderInventoryStatus() {
        const container = document.getElementById('inventoryStatus');
        if (!container) return;

        const inventoryData = [
            { name: 'Petrol Stock', level: 85, status: 'high', details: '2.1M liters' },
            { name: 'Diesel Stock', level: 72, status: 'medium', details: '1.8M liters' },
            { name: 'Supply Chain', level: 91, status: 'high', details: 'All suppliers active' },
            { name: 'Distribution', level: 68, status: 'medium', details: '4 routes delayed' },
            { name: 'Emergency Reserve', level: 45, status: 'low', details: 'Needs replenishment' },
            { name: 'Quality Control', level: 98, status: 'high', details: 'All tests passed' }
        ];

        container.innerHTML = inventoryData.map(item => `
            <div class="inventory-item">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="metric-label">${item.name}</span>
                        <span style="font-weight: bold;">${item.level}%</span>
                    </div>
                    <div style="font-size: 10px; color: var(--color-text-secondary); margin: 4px 0;">
                        ${item.details}
                    </div>
                </div>
                <div class="inventory-level">
                    <div class="inventory-fill ${item.status}" style="width: ${item.level}%"></div>
                </div>
            </div>
        `).join('');
    }

    static renderFinancialMetrics() {
        const container = document.getElementById('financialMetrics');
        if (!container) return;

        const { systemMetrics } = appState.getState().data;
        const operatingCost = systemMetrics.daily_revenue * 0.75;
        const netProfit = systemMetrics.daily_revenue - operatingCost;
        const roi = ((netProfit / operatingCost) * 100);

        const metrics = [
            { label: 'Daily Revenue', value: Utils.formatLargeNumber(systemMetrics.daily_revenue), trend: '+8.1%' },
            { label: 'Operating Cost', value: Utils.formatLargeNumber(operatingCost), trend: '+2.3%' },
            { label: 'Gross Margin', value: `${systemMetrics.average_margin}%`, trend: '+0.4%' },
            { label: 'Net Profit', value: Utils.formatLargeNumber(netProfit), trend: '+12.8%' },
            { label: 'ROI', value: `${roi.toFixed(1)}%`, trend: '+3.2%' },
            { label: 'Cash Flow', value: '+₹8.9Cr', trend: '+15.6%' }
        ];

        container.innerHTML = metrics.map(metric => `
            <div class="financial-item">
                <div class="financial-value">${metric.value}</div>
                <div class="financial-label">${metric.label}</div>
                <div style="font-size: 10px; margin-top: 4px;" class="positive">${metric.trend}</div>
            </div>
        `).join('');
    }

    static renderAlertCenter() {
        const container = document.getElementById('alertCenter');
        if (!container) return;

        const alerts = [
            { type: 'critical', icon: '⚠️', title: 'Price Volatility Alert', description: 'Mumbai prices fluctuating beyond normal range (+/- 2%)', time: Utils.getCurrentTime() },
            { type: 'warning', icon: '🌧️', title: 'Weather Impact Warning', description: 'Heavy rain in Chennai may increase demand by 15%', time: Utils.getCurrentTime() },
            { type: 'info', icon: '🤖', title: 'AI Model Update', description: 'Models retrained with 48 hours of fresh data', time: Utils.getCurrentTime() },
            { type: 'critical', icon: '💰', title: 'Revenue Milestone', description: 'Daily revenue target exceeded by 12% - ₹289.47Cr', time: Utils.getCurrentTime() },
            { type: 'warning', icon: '🚛', title: 'Supply Chain Delay', description: 'Eastern region delivery delays affecting 3 stations', time: Utils.getCurrentTime() },
            { type: 'info', icon: '📊', title: 'Performance Report', description: 'Weekly performance report generated and sent', time: Utils.getCurrentTime() }
        ];

        container.innerHTML = alerts.map(alert => `
            <div class="alert-center-item" data-type="${alert.type}">
                <div class="alert-icon ${alert.type}">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
                <div class="alert-time">${alert.time}</div>
            </div>
        `).join('');
    }

    static renderROIMetrics() {
        const container = document.getElementById('roiMetrics');
        if (!container) return;

        container.innerHTML = `
            <div class="roi-item" style="padding: 16px; background: var(--color-bg-6); border-radius: 8px; border: 1px solid var(--color-border);">
                <h4 style="margin: 0 0 16px 0;">AI Implementation ROI</h4>
                <div class="roi-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Implementation Cost:</span>
                    <span>₹2.5Cr</span>
                </div>
                <div class="roi-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Annual Savings:</span>
                    <span class="positive">₹8.7Cr</span>
                </div>
                <div class="roi-metric" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Payback Period:</span>
                    <span>3.4 months</span>
                </div>
                <div class="roi-metric" style="display: flex; justify-content: space-between;">
                    <span>3-Year ROI:</span>
                    <span class="positive">942%</span>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // System refresh button
        const refreshInventory = document.getElementById('refreshInventory');
        if (refreshInventory) {
            refreshInventory.addEventListener('click', () => {
                this.renderInventoryStatus();
                toastManager.success('Inventory status refreshed');
            });
        }

        // Financial period toggles
        const periodToggles = document.querySelectorAll('.period-toggle');
        periodToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                periodToggles.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const period = e.target.getAttribute('data-period');
                toastManager.info(`Switched to ${period} financial view`);
            });
        });

        // Alert filters
        const alertFilters = document.querySelectorAll('.alert-filter');
        alertFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                alertFilters.forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
                
                const type = e.target.getAttribute('data-type');
                const alertItems = document.querySelectorAll('.alert-center-item');
                
                alertItems.forEach(item => {
                    const itemType = item.getAttribute('data-type');
                    if (type === 'all' || itemType === type) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                toastManager.info(`Filtering ${type} alerts`);
            });
        });
    }
}

// Real-time Update Manager
class RealTimeManager {
    constructor() {
        this.updateInterval = null;
        this.isRunning = false;
    }

    startUpdates() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Starting real-time updates...');
        
        // Update every 30 seconds
        this.updateInterval = setInterval(() => {
            this.performUpdate();
        }, CONFIG.UPDATE_INTERVAL);

        // Update timestamp every second
        this.timestampInterval = setInterval(() => {
            this.updateTimestamp();
        }, 1000);

        // Initial update
        this.performUpdate();
    }

    performUpdate() {
        try {
            // Simulate real-time data changes
            appState.simulateRealTimeUpdates();
            
            // Update current page components
            const currentRoute = appState.getState().currentRoute;
            this.updateCurrentPage(currentRoute);
            
            console.log(`Real-time update completed at ${Utils.getCurrentTime()}`);
            
        } catch (error) {
            console.error('Error during real-time update:', error);
            toastManager.error('Real-time update failed');
        }
    }

    updateCurrentPage(route) {
        switch (route) {
            case 'dashboard':
                if (document.getElementById('dashboard').classList.contains('active')) {
                    DashboardComponent.renderPriceTicker();
                    DashboardComponent.renderEconomicIndicators();
                    DashboardComponent.renderKPIGrid();
                }
                break;
            case 'pricing':
                if (document.getElementById('pricing').classList.contains('active')) {
                    PricingComponent.renderCityMap();
                    PricingComponent.renderImpactGrid();
                }
                break;
            case 'analytics':
                if (document.getElementById('analytics').classList.contains('active')) {
                    AnalyticsComponent.renderModelMetrics();
                }
                break;
            case 'operations':
                if (document.getElementById('operations').classList.contains('active')) {
                    OperationsComponent.renderSystemHealth();
                    OperationsComponent.renderInventoryStatus();
                }
                break;
        }
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('lastUpdate');
        if (timestampElement) {
            timestampElement.textContent = `Last Updated: ${Utils.getCurrentTime()} IST`;
        }
    }

    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.timestampInterval) {
            clearInterval(this.timestampInterval);
            this.timestampInterval = null;
        }
        
        this.isRunning = false;
        console.log('Real-time updates stopped');
    }
}

// Main Application Class
class ZipfareApp {
    constructor() {
        this.mongodb = new MongoDBService();
        this.router = null;
        this.realTimeManager = new RealTimeManager();
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('Initializing Zipfare Application...');
            
            this.showLoadingOverlay();
            
            // Connect to MongoDB
            await this.mongodb.connect();
            
            // Initialize router after connection
            this.router = new Router();
            this.router.initialize();
            
            // Start real-time updates
            this.realTimeManager.startUpdates();
            
            // Initialize dashboard (default page)
            setTimeout(() => {
                DashboardComponent.initialize();
            }, 500);
            
            this.hideLoadingOverlay();
            this.isInitialized = true;
            
            // Show success notification
            setTimeout(() => {
                toastManager.success('Zipfare initialized successfully!');
            }, 1000);
            
            console.log('✅ Zipfare Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Zipfare:', error);
            this.handleInitializationError(error);
        }
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    handleInitializationError(error) {
        this.hideLoadingOverlay();
        toastManager.error(`Failed to initialize: ${error.message}`);
        
        // Retry button
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry Connection';
        retryButton.className = 'btn btn--primary';
        retryButton.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000;';
        retryButton.onclick = () => {
            retryButton.remove();
            this.initialize();
        };
        
        document.body.appendChild(retryButton);
    }

    destroy() {
        // Cleanup resources
        this.realTimeManager.stopUpdates();
        
        // Destroy all charts
        const { charts } = appState.getState();
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        console.log('Zipfare Application destroyed');
    }
}

// Global instances
let appState;
let toastManager;
let zipfareApp;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Zipfare - AI-Driven Fuel Pricing Optimization Platform');
    
    // Initialize global instances
    appState = new AppState();
    toastManager = new ToastManager();
    zipfareApp = new ZipfareApp();
    
    // Make available globally for debugging
    window.zipfare = {
        app: zipfareApp,
        state: appState,
        toast: toastManager,
        utils: Utils,
        config: CONFIG
    };
    
    // Initialize the application
    zipfareApp.initialize();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (zipfareApp) {
        zipfareApp.destroy();
    }
});

// Handle errors globally
window.addEventListener('error', (error) => {
    console.error('Global error:', error);
    if (toastManager) {
        toastManager.error('An unexpected error occurred');
    }
});

// Handle promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (toastManager) {
        toastManager.error('A system error occurred');
    }
    event.preventDefault();
});