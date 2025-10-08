# Test webhook with a call that should trigger workflows
# This call is designed to need follow-up (poor quality, unresolved questions)

$webhookToken = "wh_6P2ma_Mlvr9_jchZeBYhH70wQZqCNnjn"
$url = "http://localhost:3000/api/webhooks/calls/$webhookToken"

$body = @{
    transcript = "Hi, I'm calling because I'm having a major issue with my account. I can't log in and I've tried resetting my password three times. I'm getting really frustrated because I need to access my files urgently for a meeting tomorrow. Can someone please help me? I've been trying to reach support for hours. Is there anyone available? I really need this resolved ASAP. What are my options here?"
    caller = @{
        name = "Sarah Johnson"
        phone = "+1-555-987-6543"
    }
    duration = 240
    timestamp = (Get-Date).ToString("o")
    audio_url = "https://example.com/urgent-call.mp3"
    metadata = @{
        call_id = "urgent_call_002"
        agent_version = "v2.1"
        issue_type = "account_access"
    }
} | ConvertTo-Json

Write-Host "Testing webhook with URGENT call (should trigger follow-up workflow)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Sending to: $url" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Call ID: $($response.call_id)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Waiting for AI analysis to complete (5-10 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    Write-Host ""
    Write-Host "Analysis should be complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now check:" -ForegroundColor Yellow
    Write-Host "  1. Calls tab - Should show this urgent call" -ForegroundColor White
    Write-Host "  2. Call should be marked as needing follow-up" -ForegroundColor White
    Write-Host "  3. Tasks tab - Should have a new auto-created task!" -ForegroundColor White
    Write-Host "  4. Workflow execution logs - Should show successful execution" -ForegroundColor White
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')