import { routeForAuthStatus } from '../route-state';

describe('auth route decisions', () => {
  it.each([
    ['bootstrapping', null],
    ['anonymous', '/(auth)/login'],
    ['authenticated', '/(tabs)/account'],
    ['sessionExpired', '/(auth)/session-expired'],
    ['roleRejected', '/(auth)/role-rejected'],
  ] as const)('%s maps to %s', (status, route) => {
    expect(routeForAuthStatus(status)).toBe(route);
  });
});
