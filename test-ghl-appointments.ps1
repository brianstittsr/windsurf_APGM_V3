# Test GHL Appointments Fetch
$ApiKey = "pit-aef2c2c9-8bb5-461b-a2d8-a25bcf42f6d7"
$LocationId = "kfGFMn1aPE1AhW18tpG8"

Write-Host "Testing GHL Appointments Fetch..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Version" = "2021-07-28"
}

# Get calendars first
Write-Host "Step 1: Fetching calendars..." -ForegroundColor Yellow
try {
    $calendarsUrl = "https://services.leadconnectorhq.com/calendars/?locationId=$LocationId"
    $calendarsResponse = Invoke-RestMethod -Uri $calendarsUrl -Headers $headers -Method Get
    
    Write-Host "Found $($calendarsResponse.calendars.Count) calendars" -ForegroundColor Green
    Write-Host ""
    
    foreach ($cal in $calendarsResponse.calendars) {
        Write-Host "Calendar: $($cal.name)" -ForegroundColor Cyan
        Write-Host "  ID: $($cal.id)" -ForegroundColor White
        Write-Host ""
        
        # Try to fetch appointments for this calendar
        Write-Host "  Fetching appointments..." -ForegroundColor Gray
        
        # Set date range (past 30 days to future 90 days)
        $startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        $endDate = (Get-Date).AddDays(90).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        # Try /calendars/events endpoint
        try {
            $eventsUrl = "https://services.leadconnectorhq.com/calendars/events?locationId=$LocationId&calendarId=$($cal.id)&startTime=$startDate&endTime=$endDate"
            Write-Host "  URL: $eventsUrl" -ForegroundColor Gray
            $eventsResponse = Invoke-RestMethod -Uri $eventsUrl -Headers $headers -Method Get
            
            if ($eventsResponse.events) {
                Write-Host "  Found $($eventsResponse.events.Count) events" -ForegroundColor Green
                
                foreach ($event in $eventsResponse.events) {
                    Write-Host "    - $($event.title) on $($event.startTime)" -ForegroundColor White
                }
            } else {
                Write-Host "  No events found" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  Failed to fetch events: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        
        # Try /calendars/events/appointments endpoint
        try {
            $appointmentsUrl = "https://services.leadconnectorhq.com/calendars/events/appointments?locationId=$LocationId&calendarId=$($cal.id)&startTime=$startDate&endTime=$endDate"
            Write-Host "  Trying appointments endpoint..." -ForegroundColor Gray
            Write-Host "  URL: $appointmentsUrl" -ForegroundColor Gray
            $appointmentsResponse = Invoke-RestMethod -Uri $appointmentsUrl -Headers $headers -Method Get
            
            if ($appointmentsResponse.appointments) {
                Write-Host "  Found $($appointmentsResponse.appointments.Count) appointments" -ForegroundColor Green
                
                foreach ($appt in $appointmentsResponse.appointments) {
                    Write-Host "    - $($appt.title) on $($appt.startTime)" -ForegroundColor White
                }
            } else {
                Write-Host "  No appointments found" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  Failed to fetch appointments: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "---" -ForegroundColor Gray
        Write-Host ""
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
