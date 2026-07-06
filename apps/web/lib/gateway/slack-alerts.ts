export async function sendSlackAlerts(
  webhookUrl: string,
  alerts: { level: string; message: string }[]
): Promise<void> {
  if (!webhookUrl || alerts.length === 0) return;

  const text = alerts
    .map((a) => `[${a.level.toUpperCase()}] ${a.message}`)
    .join("\n");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `Gercep AI Gateway Alerts\n${text}` }),
    });
  } catch (err) {
    console.error("Slack alert failed:", err);
  }
}
