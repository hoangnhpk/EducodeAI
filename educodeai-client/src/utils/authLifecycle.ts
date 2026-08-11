let sessionGeneration = 0;
let loggingOut = false;

export const getSessionGeneration = (): number => sessionGeneration;
export const isLoggingOut = (): boolean => loggingOut;

export const beginLogout = (): number => {
  loggingOut = true;
  sessionGeneration += 1;
  return sessionGeneration;
};

export const finishLogout = (): void => {
  loggingOut = false;
  sessionGeneration += 1;
};

export const invalidatePendingAuthWork = (): number => {
  sessionGeneration += 1;
  return sessionGeneration;
};
