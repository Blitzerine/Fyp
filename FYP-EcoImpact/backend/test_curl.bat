@echo off
echo Testing FastAPI /api/simulate endpoint...
echo.

curl -X POST "http://localhost:8000/api/simulate" ^
  -H "Content-Type: application/json" ^
  -d "{\"country\":\"Pakistan\",\"policy_type\":\"Carbon Tax\",\"carbon_price\":10,\"duration\":5}"

echo.
echo.
echo Test completed!




