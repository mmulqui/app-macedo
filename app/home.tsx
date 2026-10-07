import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getGreeting } from '@/lib/greeting';
import { LogOut, Sun, Moon, Sunset, CheckCircle2, Sparkles, Package } from 'lucide-react-native';
import { logout } from '@/services/auth';

const GREEN = '#10B883';
const GREEN_SOFT = '#D5F5EA';

export default function HomeScreen() {
  const greeting = getGreeting();
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 20;
  const Icon = isMorning ? Sun : isAfternoon ? Sunset : Moon;

  async function handleLogout() {
    try {
      await logout(); // cierra sesión en el backend y borra los tokens locales
    } catch {
      // si falla la request igualmente se vuelve al login
    } finally {
      router.replace('/');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5E5]">
      <ScrollView contentContainerClassName="flex-grow justify-center">
        {/* Tarjeta */}
        <View
          className="w-full self-center bg-white overflow-hidden px-8 py-10"
          style={{ maxWidth: 720 }}>
          {/* Encabezado */}
          <View className="flex-row items-center justify-between mb-10">
            <Text className="text-[26px] font-bold" style={{ color: GREEN }}>
              ViBlio
            </Text>
            <TouchableOpacity
              accessibilityLabel="Cerrar sesión"
              onPress={handleLogout}
              className="w-10 h-10 bg-white border border-[#E5E5E5] rounded-full items-center justify-center">
              <LogOut size={18} color="#6B6B6B" />
            </TouchableOpacity>
          </View>

          {/* Perfil */}
          <View className="mb-9">
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: GREEN_SOFT }}>
              <Icon size={26} color={GREEN} />
            </View>
            <Text className="text-[#6B6B6B] text-sm">{greeting}</Text>
            <Text className="text-black text-[30px] leading-9 font-bold mt-1">
              Usuario
            </Text>
          </View>

          {/* Panel verde */}
          <View
            className="mb-5"
            style={{
              backgroundColor: GREEN,
              borderRadius: 20,
              borderTopLeftRadius: 80,
              borderBottomLeftRadius: 80,
              paddingVertical: 28,
              paddingRight: 28,
              paddingLeft: 40,
            }}>
            <View className="flex-row items-center mb-3">
              <CheckCircle2 size={21} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-3">
                Todo está listo
              </Text>
            </View>
            <Text className="text-white text-sm leading-5">
              Has iniciado sesión correctamente. Desde aquí podrás acceder a toda tu información.
            </Text>
          </View>

          <View className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: GREEN_SOFT }}>
                <Sparkles size={19} color={GREEN} />
              </View>
              <View className="flex-1">
                <Text className="text-black text-sm font-bold">Una experiencia más simple</Text>
                <Text className="text-[#6B6B6B] text-xs leading-5 mt-1">
                  Tu espacio personal ya está activo.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/products')}
            activeOpacity={0.8}
            className="bg-white rounded-2xl p-5 mt-4"
            style={{ borderWidth: 1.5, borderColor: GREEN }}>
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: GREEN_SOFT }}>
                <Package size={19} color={GREEN} />
              </View>
              <View className="flex-1">
                <Text className="text-black text-sm font-bold">Gestionar productos</Text>
                <Text className="text-[#6B6B6B] text-xs leading-5 mt-1">
                  Consultar, crear, editar y eliminar productos.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}