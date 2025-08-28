#!/bin/bash
# Complete Real-Time Fuel Pricing System Setup Script

echo "🚀 Setting up Real-Time Fuel Pricing System..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv fuel_pricing_env
source fuel_pricing_env/bin/activate

# Install dependencies
echo "⬇️  Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file from example
echo "🔧 Creating environment configuration..."
cp .env.example .env

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: python realtime_fuel_backend.py"
echo "3. Open frontend application in browser"
echo "4. Monitor real-time fuel pricing data"
echo ""
echo "🌐 API will be available at: http://localhost:8000"
echo "📊 API Documentation: http://localhost:8000/docs"
echo "🔌 WebSocket endpoint: ws://localhost:8000/ws"
