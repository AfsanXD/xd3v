export async function handler(event: any) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      status: "online",
      engine: "xd3v-Browser-Core",
      timestamp: new Date().toISOString(),
    }),
  };
}
