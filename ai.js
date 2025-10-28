  ai.defineTool({
    name: "getOrderInfo",
    description: "retrieves order info",
    inputSchema: z.object({
      orderId: z.string().describe("Order ID. Format: A-XXX-XXX, ex. A-123-456"),
    }),
    outputSchema: OrderSchema.optional(),
    async (input) => {
      const doc = await firestore.collection("orders").doc(input.orderId).get();
      return doc.data() as z.infer<typeof OrderSchema>;
    },
  });
