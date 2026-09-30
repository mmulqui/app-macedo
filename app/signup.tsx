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
import { ChevronLeft } from 'lucide-react-native';

const GREEN = '#10B883';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'words';
  maxLength?: number;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="mb-5">
      <Text className="text-white text-[13px] mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.75)"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
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

// Formatea los dígitos como dd/mm/aaaa mientras se escribe
function formatDate(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export default function SignupScreen() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [fecha, setFecha] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  function handleSignUp() {
    if (!nombre.trim() || !apellido.trim() || !dni.trim() || fecha.length < 10 || !email.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError(null);
    router.replace('/home');
  }

  const leftColumn = (
    <View style={{ flex: 1 }}>
      <Field label="Nombre" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
      <Field label="Apellido" value={apellido} onChangeText={setApellido} autoCapitalize="words" />
      <Field
        label="DNI"
        value={dni}
        onChangeText={(t) => setDni(t.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={9}
      />
      <Field
        label="Fecha de nacimiento"
        value={fecha}
        onChangeText={(t) => setFecha(formatDate(t))}
        placeholder="dd/mm/aaaa"
        keyboardType="numeric"
        maxLength={10}
      />
    </View>
  );

  const rightColumn = (
    <View style={{ flex: 1 }}>
      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Field label="Contraseña" value={password} onChangeText={setPassword} secure />
      <Field label="Confirmar Contraseña" value={confirm} onChangeText={setConfirm} secure />

      {error && (
        <View className="bg-white rounded-xl px-4 py-2 mb-3">
          <Text className="text-[#A93E2B] text-xs">{error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSignUp}
        activeOpacity={0.8}
        className="rounded-full h-11 px-12 items-center justify-center border border-white self-center mt-4">
        <Text className="text-white text-base">Registrarse</Text>
      </TouchableOpacity>
    </View>
  );

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
                paddingBottom: 40,
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
                {leftColumn}
                {rightColumn}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}