import AsyncStorage from '@react-native-async-storage/async-storage';

let token = null;

export const setToken = (id) => {
    token = id;
};

export const getToken = async () => {
    if (token) return token;
    try {
        const saved = await AsyncStorage.getItem('token');
        if (saved) {
            token = saved;
            return saved;
        }
    } catch {}
    return null;
};
