# Test webhook with sample call data
# Usage: Edit the $webhookToken variable, then run: .\test-webhook.ps1

# REPLACE THIS with your actual webhook token from the UI
$webhookToken = "YOUR_WEBHOOK_TOKEN_HERE"

$url = "http://localhost:3000/api/webhooks/calls/wh_6P2ma_Mlvr9_jchZeBYhH70wQZqCNnjn"

$body = @{
    transcript = "Hi, I'm calling about pricing for your enterprise plan. We're a company of about 50 people and we need to know if you offer volume discounts. Also, do you provide dedicated support? We'd like to schedule a demo if possible. What's your typical response time for support tickets?"
    caller = @{
        name = "John Smith"
        phone = "+1-555-123-4567"
    }
    duration = 180
    timestamp = (Get-Date).ToString("o")
    audio_url = "https://example.com/recording.mp3"
    metadata = @{
        call_id = "test_call_001"
        agent_version = "v2.1"
    }
} | ConvertTo-Json

Write-Host "Testing webhook: $url" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sending test call data..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Call ID: $($response.call_id)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Now check the Calls tab in your project to see the call record!" -ForegroundColor Yellow
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}