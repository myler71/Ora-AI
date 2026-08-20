const ANON_COUNT_KEY = "dentalAiAnonymousPredictCount";
const WELCOME_DISMISSED_KEY = "dentalAiTrialWelcomeDismissed";

export const AI_TOOL_FREE_TRIAL_LIMIT = 3;

export function getIsLoggedIn(): boolean {
  return !!localStorage.getItem("accessToken");
}

export function getAnonymousPredictCount(): number {
  const v = localStorage.getItem(ANON_COUNT_KEY);
  const n = v ? parseInt(v, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function incrementAnonymousPredictCount(): void {
  const n = getAnonymousPredictCount() + 1;
  localStorage.setItem(ANON_COUNT_KEY, String(n));
}

export function isTrialWelcomeDismissed(): boolean {
  return localStorage.getItem(WELCOME_DISMISSED_KEY) === "1";
}

export function dismissTrialWelcome(): void {
  localStorage.setItem(WELCOME_DISMISSED_KEY, "1");
}

export function hasAnonymousTrialsLeft(): boolean {
  return getAnonymousPredictCount() < AI_TOOL_FREE_TRIAL_LIMIT;
}

export function isAnonymousTrialExhausted(): boolean {
  return !getIsLoggedIn() && getAnonymousPredictCount() >= AI_TOOL_FREE_TRIAL_LIMIT;
}

export function openAuthDialog(
  view: "login" | "register" = "login",
): void {
  window.dispatchEvent(
    new CustomEvent<{ view: "login" | "register" }>("open-auth-dialog", {
      detail: { view },
    }),
  );
}
