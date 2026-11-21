//le lieux de residence de l'ip

import AsyncStorage from '@react-native-async-storage/async-storage'

const HOST_KEY = 'serverHost';
export const PORT_CATALOGUE = 8000;

export default function readHost(): Promise<string | null> {
    return AsyncStorage.getItem(HOST_KEY);
}

export async function writeHost(host: string): Promise<void> {
    await AsyncStorage.setItem(HOST_KEY, host.trim())
}