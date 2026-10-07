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
import { signup } from '@/services/auth';
import { ChevronLeft } from 'lucide-react-native';

const GREEN = '#10B883';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address';
};

function Field({ label, value, onChangeText, secure, keyboardType = 'default' }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="mb-5">
      <Text className="text-white text-[13px] mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="rgba(255,255,255,0.75)"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={
          {
            height: 38,
            fontSize: 14,
            color: '#FFFFFF',
            borderBottomWidth: focused ? 2 : 1,
            borderBottomColor: focused ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
            outlineStyle: 'none',
          } as any
        }
      />
    </View>
  );
}

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  async function handleSignUp() {
    // El backend exige una contraseña de 8 a 72 caracteres
    if (!email.trim() || password.length < 8 || password.length > 72) {
      setError('Usá un correo válido y una contraseña de 8 a 72 caracteres.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await signup(email.trim(), password);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar.');
    } finally {
      setLoading(false);
    }
  }

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
            style={{ maxWidth: isWide ? 860 : 440 }}>
            {/* Flecha para volver */}
            <TouchableOpacity
              accessibilityLabel="Volver al inicio de sesión"
              onPress={() => router.replace('/')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ position: 'absolute', top: 24, left: 24, zIndex: 2 }}>
              <ChevronLeft size={34} color={GREEN} strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Panel verde */}
            <View
              style={{
                backgroundColor: GREEN,
                marginLeft: isWide ? 28 : 0,
                marginTop: isWide ? 0 : 64,
                paddingTop: 36,
                paddingBottom: 48,
                paddingRight: isWide ? 60 : 28,
                paddingLeft: isWide ? 80 : 28,
                ...(isWide
                  ? { borderTopLeftRadius: 240, borderBottomLeftRadius: 240 }
                  : { borderTopLeftRadius: 60, borderTopRightRadius: 60 }),
              }}>
              <Text className="text-white text-[22px] font-bold text-center mb-8">
                Registro
              </Text>

              <View style={{ flexDirection: isWide ? 'row' : 'column', gap: isWide ? 30 : 0 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secure
                  />
                </View>
              </View>

              {error && (
                <View className="bg-white rounded-xl px-4 py-2 mb-3 self-center">
                  <Text className="text-[#A93E2B] text-xs">{error}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
                className="rounded-full h-11 px-12 items-center justify-center border border-white self-center mt-4"
                style={{ opacity: loading ? 0.7 : 1 }}>
                <Text className="text-white text-base">
                  {loading ? 'Registrando...' : 'Registrarse'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
