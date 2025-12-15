$body = @{
    shipping_date = "2025-12-12"
    carrier = "DHL Express"
    bill_of_lading_no = "BL123456"
    vessel_name = "MV Test Ship"
    port_of_loading = "Shanghai"
    port_of_discharge = "Los Angeles"
    shipper_remarks = "Test shipment"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/master-lc/2/ship-goods" `
    -Method PUT `
    -ContentType "application/json" `
    -Body $body `
    -ErrorAction Stop

Write-Host "Success!" -ForegroundColor Green
$response | ConvertTo-Json -Depth 10
