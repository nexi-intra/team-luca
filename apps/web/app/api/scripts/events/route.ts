import { NextRequest } from "next/server";
import { getGlobalProcessManager } from "@monorepo/powershell-runner";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const manager = getGlobalProcessManager();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const eventHandler = (event: any) => {
        send(event);
      };

      manager.on("event", eventHandler);

      send({ type: "connected", timestamp: new Date() });

      request.signal.addEventListener("abort", () => {
        manager.off("event", eventHandler);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
