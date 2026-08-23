import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStorage, parseStoredSession, parseStudentUser } from '../lib/auth-storage';

jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => values.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => { values.set(key, value); }),
      removeItem: jest.fn(async (key: string) => { values.delete(key); }),
    },
  };
});

const user = { id: 1, taiKhoan: 'sv01', hoTen: 'Student', email: 'sv@example.com', vaiTro: 2 as const };
const session = { token: 'jwt', tokenExpiresAt: null, user };

describe('auth storage validation and migration', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem('@educodeai/auth-session');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  });

  it('accepts valid student session and rejects malformed roles', () => {
    expect(parseStudentUser(user)).toEqual(user);
    expect(parseStudentUser({ ...user, vaiTro: 1 })).toBeNull();
    expect(parseStudentUser({ ...user, vaiTro: '2' })).toBeNull();
    expect(parseStoredSession({ version: 1, ...session })).toEqual(session);
    expect(parseStoredSession({ version: 1, token: '', user })).toBeNull();
  });

  it('clears malformed JSON and legacy keys', async () => {
    await AsyncStorage.setItem('@educodeai/auth-session', '{bad');
    await AsyncStorage.setItem('token', 'legacy');
    await AsyncStorage.setItem('user', JSON.stringify(user));
    expect(await authStorage.getSession()).toBeNull();
    expect(await AsyncStorage.getItem('@educodeai/auth-session')).toBeNull();
    expect(await AsyncStorage.getItem('token')).toBeNull();
    expect(await AsyncStorage.getItem('user')).toBeNull();
  });

  it('persists and hydrates a valid session', async () => {
    await authStorage.setSession(session);
    expect(await authStorage.getSession()).toEqual(session);
  });
});
