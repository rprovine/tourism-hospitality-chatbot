import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get('businessId') || 'demo'
  const color = searchParams.get('color') || '#0891b2'
  
  // Full HTML page that loads the chat widget
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LeniLani Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { 
            height: 100%; 
            width: 100%;
            overflow: hidden;
        }
        #chat-root {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="chat-root">
        <iframe 
            src="/widget/chat?businessId=${encodeURIComponent(businessId)}&color=${encodeURIComponent(color)}"
            style="width: 100%; height: 100%; border: none;"
            allow="microphone; camera"
        ></iframe>
    </div>
</body>
</html>`

  // Return with no restrictive headers
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Don't set X-Frame-Options at all to allow embedding
      // Allow all origins
      'Content-Security-Policy': "frame-ancestors *",
      // Disable other security features for this endpoint
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '0',
    },
  })
}

// Also handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}