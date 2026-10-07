import { Stack, router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#10B883';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <SafeAreaView className="flex-1 bg-[#E5E5E5] items-center justify-center px-6">
        <View
          className="w-full bg-white items-center px-8 py-12"
          style={{ maxWidth: 440 }}>
          <Text className="text-[26px] font-bold mb-3" style={{ color: GREEN }}>
            ViBlio
          </Text>
          <Text className="text-black text-lg font-bold text-center">
            Esta pantalla no existe.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
            className="rounded-full h-11 px-10 items-center justify-center mt-8"
            style={{ backgroundColor: GREEN }}>
            <Text className="text-white text-base">Ir al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}