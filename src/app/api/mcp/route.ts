
import { mcpServer } from "@/lib/mcp";
import { NextRequest, NextResponse } from "next/server";

// In-memory store for active sessions. 
// Note: In a serverless environment like Vercel, this works only if the 
// POST request hits the same lambda instance as the GET request (SSE).
// For production scalable deployment, a shared store (Redis) is required.
const sessions = new Map<string, (message: any) => void>();

export async function GET(req: NextRequest) {
  const secret = process.env.MCP_SECRET;
  if (secret) {
    const apiKey = req.headers.get("x-mcp-key") || req.nextUrl.searchParams.get("key");
    if (apiKey !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sessionId = crypto.randomUUID();

  const transport = {
    onmessage: undefined as ((message: any) => void) | undefined,
    onclose: undefined as (() => void) | undefined,
    onerror: undefined as ((error: Error) => void) | undefined,
    
    start: async () => {
      // Send the endpoint event so the client knows where to send POST requests
      // The format is `event: endpoint\ndata: /api/mcp?sessionId=...\n\n`
      const endpoint = `/api/mcp?sessionId=${sessionId}`;
      const data = `event: endpoint\ndata: ${endpoint}\n\n`;
      await writer.write(encoder.encode(data));
    },
    
    send: async (message: any) => {
      const data = `event: message\ndata: ${JSON.stringify(message)}\n\n`;
      await writer.write(encoder.encode(data));
    },
    
    close: async () => {
      await writer.close();
      sessions.delete(sessionId);
      if (transport.onclose) {
        transport.onclose();
      }
    }
  };

  // Connect the server to this transport
  await mcpServer.connect(transport);

  // Store the onmessage handler to be called by POST requests
  if (transport.onmessage) {
    sessions.set(sessionId, transport.onmessage);
  }

  // Handle client disconnect
  req.signal.addEventListener("abort", () => {
    transport.close();
  });

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.MCP_SECRET;
  if (secret) {
    const apiKey = req.headers.get("x-mcp-key") || req.nextUrl.searchParams.get("key");
    if (apiKey !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const handleMessage = sessions.get(sessionId);

  if (!handleMessage) {
    return NextResponse.json({ error: "Session not found or inactive" }, { status: 404 });
  }

  try {
    const body = await req.json();
    handleMessage(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON or server error" }, { status: 500 });
  }
}
