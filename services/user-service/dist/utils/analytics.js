import axios from "axios";
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL?.trim() || "";
export async function emitAnalyticsEvents(req, events, authHeaderOverride) {
    if (!ANALYTICS_SERVICE_URL || events.length === 0)
        return;
    const authHeader = authHeaderOverride || req.headers.authorization;
    if (!authHeader)
        return;
    try {
        await axios.post(`${ANALYTICS_SERVICE_URL}/api/analytics/events`, { events }, { headers: { Authorization: authHeader } });
    }
    catch (error) {
        console.warn("Failed to emit analytics events");
    }
}
