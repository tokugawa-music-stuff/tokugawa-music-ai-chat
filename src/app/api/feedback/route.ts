export async function POST(req: Request) {
  const body = await req.json();

  const response = await fetch(process.env.GAS_FEEDBACK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return Response.json({
    success: response.ok,
  });
}