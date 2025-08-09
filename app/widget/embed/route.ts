import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get('businessId')
  const color = searchParams.get('color') || '#0891b2'
  
  if (!businessId) {
    return new NextResponse('Business ID is required', { status: 400 })
  }

  // Create the HTML content for the widget
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Widget</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
    </style>
</head>
<body>
    <iframe 
        src="/widget/chat?businessId=${encodeURIComponent(businessId)}&color=${encodeURIComponent(color)}"
        width="100%" 
        height="100%" 
        style="border: none; overflow: hidden;">
    </iframe>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      // No X-Frame-Options header = allows all embedding
      'Content-Security-Policy': 'frame-ancestors *',
    },
  })
}