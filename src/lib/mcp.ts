
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const mcpServer = new McpServer({
  name: "Robux Store Stateless MCP Server",
  version: "1.0.0",
});

// Tool: calculate_price
mcpServer.tool(
  "calculate_price",
  "Calculate the USD price for a given amount of Robux",
  {
    robux_amount: z.number().describe("Amount of Robux to calculate price for"),
  },
  async ({ robux_amount }) => {
    // Logic: 1000 Robux = $6.50
    // Gross amount = Desired * 1.3
    const totalToBuy = Math.ceil(robux_amount * 1.3);
    const price = (totalToBuy * (6.5 / 1000));
    return {
      content: [{ type: "text", text: `Price for ${robux_amount} Robux (Gross: ${totalToBuy}) is $${price.toFixed(2)} USD` }],
    };
  }
);

