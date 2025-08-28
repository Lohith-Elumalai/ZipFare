
# Real-Time Fuel Pricing API Documentation

## Overview
This API provides real-time fuel pricing predictions using AI models trained on comprehensive market data including weather, traffic, economic indicators, and historical pricing patterns.

## Base URL
- Local Development: `http://localhost:8000`
- Production: `https://your-domain.com`

## Authentication
Currently using simulated authentication. In production, implement JWT tokens or API keys.

## Endpoints

### 1. System Health
```
GET /health
```
Returns system status, database connectivity, and model status.

**Response:**
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "models": {
    "petrol": "loaded",
    "diesel": "loaded"
  },
  "active_connections": 5,
  "last_update": "2025-08-28T12:30:00Z"
}
```

### 2. Get All Cities
```
GET /api/cities
```
Returns current fuel pricing data for all monitored cities.

**Response:**
```json
{
  "cities": [
    {
      "city": "Mumbai",
      "petrol_price": 106.23,
      "diesel_price": 98.45,
      "weather": "Clear",
      "temperature": 29,
      "traffic_index": 1.4,
      "prediction_confidence": 92.1,
      "last_update": "12:29"
    }
  ],
  "count": 30
}
```

### 3. City Price Prediction
```
GET /api/predict/{city}
```
Get AI-powered price predictions for a specific city.

**Parameters:**
- `city`: City name (e.g., "Mumbai", "Delhi")

**Response:**
```json
{
  "city": "Mumbai",
  "predictions": {
    "petrol": {
      "price": 106.45,
      "confidence": 91.2,
      "model": "Gradient Boosting"
    },
    "diesel": {
      "price": 98.67,
      "confidence": 94.1,
      "model": "Gradient Boosting"
    }
  },
  "factors": {
    "crude_oil": 87.5,
    "weather": {
      "temperature": 29,
      "humidity": 75,
      "condition": "Clear"
    },
    "timestamp": "2025-08-28T12:30:00Z"
  }
}
```

### 4. Dashboard Analytics
```
GET /api/analytics/dashboard
```
Returns comprehensive analytics for the dashboard.

**Response:**
```json
{
  "analytics": {
    "total_volume": 2847000,
    "avg_petrol": 104.2,
    "avg_diesel": 96.8,
    "cities_count": 30
  },
  "ai_models": {
    "petrol": {
      "accuracy": 91.2,
      "mae": 0.86,
      "status": "active"
    },
    "diesel": {
      "accuracy": 94.1,
      "mae": 0.66,
      "status": "active"
    }
  },
  "system_status": {
    "mongodb": "connected",
    "api_endpoints": "active",
    "real_time_updates": "running"
  }
}
```

### 5. Update Prices
```
POST /api/prices/update
```
Manually update fuel prices for a city.

**Request Body:**
```json
{
  "city": "Mumbai",
  "petrol_price": 106.50,
  "diesel_price": 98.75
}
```

**Response:**
```json
{
  "status": "success",
  "record_id": "66d5a1b8f0123456789abcde"
}
```

## WebSocket Connection

### Real-Time Updates
```
ws://localhost:8000/ws
```

The WebSocket connection provides real-time updates every 30 seconds with the following data structure:

```json
{
  "type": "real_time_update",
  "timestamp": "2025-08-28T12:30:00Z",
  "cities": [
    {
      "city": "Mumbai",
      "petrol": 106.23,
      "diesel": 98.45,
      "confidence": 92.1,
      "timestamp": "2025-08-28T12:30:00Z"
    }
  ],
  "economic": {
    "crude_oil_price": 87.5,
    "exchange_rate": 83.4,
    "last_update": "2025-08-28T12:30:00Z"
  },
  "system_status": {
    "mongodb": "connected",
    "models": "active",
    "predictions_today": 1247
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

Error responses include details:
```json
{
  "detail": "City not found: InvalidCity"
}
```

## Rate Limiting
- API calls: 1000 requests per hour per IP
- WebSocket connections: 10 concurrent connections per IP

## Data Models

### City Data Model
```json
{
  "city": "string",
  "state": "string",
  "region": "string",
  "petrol_price": "number",
  "diesel_price": "number",
  "weather": "string",
  "temperature": "number",
  "traffic_index": "number",
  "last_update": "datetime"
}
```

### Prediction Model
```json
{
  "price": "number",
  "confidence": "number (0-100)",
  "model": "string",
  "factors": "object"
}
```
