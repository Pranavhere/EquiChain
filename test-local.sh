#!/bin/bash

# Test local backend
echo "🧪 Testing local backend..."
curl -X GET http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "🧪 Testing local health endpoint..."
curl -X GET http://localhost:8000/health \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "🧪 Testing local register..."
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -w "\n\nStatus: %{http_code}\n"
