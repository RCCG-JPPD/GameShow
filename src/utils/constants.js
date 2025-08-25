export const TEAM_COLORS = ["red", "blue", "green", "yellow", "orange"]; // fixed
export const MAX_CATEGORIES = 8;
export const MAX_QUESTIONS_PER_CATEGORY = 6;

export const DISPLAY_VIEWS = ["board", "question", "answer", "scoreboard"];
export const GAME_STATUS = DISPLAY_VIEWS; // we mirror this for simplicity

export const PHASE = {
  IDLE: "idle",
  FIRST: "firstAttempt",
  STEAL: "steal",
};

export const TIMER_MODE = {
  FIRST: "firstAttempt",
  STEAL: "steal",
};
