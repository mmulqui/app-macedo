import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { login } from '@/services/auth';

const GREEN = '#10B883';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login(email.trim(), password);
      router.replace('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field: 'email' | 'password') =>
    ({
      height: 44,
      fontSize: 14,
      color: '#16332E',
      borderBottomWidth: 1,
      borderBottomColor: focusedField === field ? GREEN : '#B5B5B5',
      outlineStyle: 'none',
    }) as any;

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5E5]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow justify-center"
          keyboardShouldPersistTaps="handled">
          {/* Tarjeta */}
          <View
            className="w-full self-center bg-white overflow-hidden"
            style={{
              maxWidth: isWide ? 900 : 440,
              flexDirection: isWide ? 'row' : 'column',
            }}>
            {/* Lado del formulario */}
            <View
              className="justify-center px-10 py-14"
              style={{ flex: isWide ? 1.3 : undefined }}>
              <View className="w-full max-w-[320px] self-center">
                <Text
                  className="text-[28px] font-bold text-center mb-2"
                  style={{ color: GREEN }}>
                  ViBlio
                </Text>
                <Text className="text-black text-[22px] font-bold text-center mb-12">
                  Iniciar Sesion
                </Text>

                <TextInput
                  style={inputStyle('email')}
                  placeholder="E-mail"
                  placeholderTextColor="#B5ADA8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />

                <View style={{ height: 36 }} />

                <TextInput
                  style={inputStyle('password')}
                  placeholder="Contraseña"
                  placeholderTextColor="#B5ADA8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="password"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />

                {error && (
                  <Text className="text-[#A93E2B] text-sm text-center mt-4">
                    {error}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                  className="rounded-full h-11 items-center justify-center mt-8 mx-5"
                  style={{ backgroundColor: GREEN, opacity: loading ? 0.7 : 1 }}>
                  <Text className="text-white text-base">
                    {loading ? 'Ingresando...' : 'Iniciar'}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row flex-wrap justify-center mt-10">
                  <Text className="text-black text-sm mr-1">
                    ¿Has olvidado tu Contraseña?
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-[#0000EE] text-sm underline">
                      Recordarme
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Panel verde de Registrarse */}
            <View
              className="items-center justify-center px-8 py-14"
              style={{
                flex: isWide ? 1 : undefined,
                backgroundColor: GREEN,
                ...(isWide
                  ? {
                      borderTopLeftRadius: 220,
                      borderBottomLeftRadius: 220,
                    }
                  : {
                      borderTopLeftRadius: 60,
                      borderTopRightRadius: 60,
                    }),
              }}>
              <Text className="text-white text-[26px] font-bold text-center">
                Registrarse
              </Text>
              <Text className="text-white text-sm text-center mt-3 mb-7 max-w-[220px]">
                ¿No tienes una cuenta? Crea una para empezar.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/signup')}
                activeOpacity={0.8}
                className="rounded-full h-11 px-10 items-center justify-center border-2 border-white">
                <Text className="text-white text-base font-semibold">
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
