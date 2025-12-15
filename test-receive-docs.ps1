$body = @{
    received_documents = @("Commercial Invoice", "Packing List", "Bill of Lading")
    receiver_remarks = "Documents received and verified"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/master-lc/2/documents/receive" `
        -Method PUT `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    Write-Host "Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}
