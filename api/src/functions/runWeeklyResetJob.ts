import { weeklyReset } from "./weeklyReset.js";
import { sendWeeklyResetNotifications } from "./sendWeeklyResetNotifications.js";

await weeklyReset();
await sendWeeklyResetNotifications();
