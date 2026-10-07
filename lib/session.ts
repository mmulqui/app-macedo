import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

export async function saveSession(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN, accessToken],
    [REFRESH_TOKEN, refreshToken],
  ]);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN]);
}