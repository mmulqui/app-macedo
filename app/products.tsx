import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Pencil, Plus, Search, Trash2 } from 'lucide-react-native';
import { isAuthError } from '@/services/api';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '@/services/products';
import { clearSession } from '@/lib/session';
import { Product, ProductInput } from '@/types/product';

const GREEN = '#10B883';
const GREEN_SOFT = '#D5F5EA';

// Input con solo línea inferior, igual que en el login y el registro
function LineInput({ light, style, ...props }: TextInputProps & { light?: boolean }) {
  const [focused, setFocused] = useState(false);
  const idle = light ? 'rgba(255,255,255,0.6)' : '#B5B5B5';
  const active = light ? '#FFFFFF' : GREEN;
  return (
    <TextInput
      placeholderTextColor={light ? 'rgba(255,255,255,0.75)' : '#B5ADA8'}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={[
        {
          height: 40,
          fontSize: 14,
          color: light ? '#FFFFFF' : '#16332E',
          borderBottomWidth: focused ? 2 : 1,
          borderBottomColor: focused ? active : idle,
          outlineStyle: 'none',
        } as any,
        style,
      ]}
    />
  );
}

// Confirmación que funciona tanto en celular como en web
function confirmAction(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Formulario de alta / edición
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Si el token venció o no existe, se vuelve al login
  async function handleApiError(e: unknown, fallback: string) {
    if (isAuthError(e)) {
      await clearSession();
      router.replace('/');
      return;
    }
    setError(e instanceof Error ? e.message : fallback);
  }

  async function loadProducts(searchText = search) {
    try {
      setLoading(true);
      setError(null);
      const response = await listProducts(1, 50, searchText);
      setProducts(response.data);
    } catch (e) {
      await handleApiError(e, 'Error al cargar productos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('0');
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setName(product.name);
    setDescription(product.description ?? '');
    setPrice(String(Number(product.price)));
    setStock(String(product.stock));
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setFormError(null);
  }

  async function handleSave() {
    const numericPrice = Number(price.replace(',', '.'));
    const numericStock = Number(stock);

    if (name.trim().length < 2 || name.trim().length > 160) {
      setFormError('El nombre debe tener entre 2 y 160 caracteres.');
      return;
    }
    if (description.trim().length > 5000) {
      setFormError('La descripción no puede superar los 5000 caracteres.');
      return;
    }
    if (
      price.trim() === '' ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0 ||
      numericPrice > 9999999999 ||
      Math.round(numericPrice * 100) / 100 !== numericPrice
    ) {
      setFormError('Ingresá un precio válido (hasta 2 decimales).');
      return;
    }
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setFormError('El stock debe ser un entero mayor o igual a 0.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      if (editing) {
        // PATCH: se envían solo los campos que cambiaron
        const changes: Partial<ProductInput> = {};
        if (name.trim() !== editing.name) changes.name = name.trim();
        if (description.trim() !== (editing.description ?? '')) {
          changes.description = description.trim();
        }
        if (numericPrice !== Number(editing.price)) changes.price = numericPrice;
        if (numericStock !== editing.stock) changes.stock = numericStock;

        if (Object.keys(changes).length > 0) {
          await updateProduct(editing.id, changes);
        }
      } else {
        // POST: nunca se envían id, owner_id, created_at ni updated_at
        await createProduct({
          name: name.trim(),
          description: description.trim(),
          price: numericPrice,
          stock: numericStock,
        });
      }

      closeForm();
      await loadProducts();
    } catch (e) {
      if (isAuthError(e)) {
        await clearSession();
        router.replace('/');
        return;
      }
      setFormError(e instanceof Error ? e.message : 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const ok = await confirmAction(
      'Eliminar producto',
      `¿Seguro que querés eliminar "${product.name}"?`
    );
    if (!ok) return;

    try {
      setError(null);
      await deleteProduct(product.id);
      await loadProducts();
    } catch (e) {
      await handleApiError(e, 'No se pudo eliminar el producto.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5E5]">
      <View className="flex-1 w-full max-w-[720px] self-center bg-white px-6 py-6">
        {/* Encabezado */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeft size={34} color={GREEN} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text className="text-[22px] font-bold text-black">Productos</Text>
          <TouchableOpacity
            accessibilityLabel="Nuevo producto"
            onPress={openCreate}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: GREEN }}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Búsqueda */}
        <View className="flex-row items-end mb-5">
          <LineInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => loadProducts()}
            placeholder="Buscar por nombre o descripción"
            returnKeyType="search"
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            accessibilityLabel="Buscar"
            onPress={() => loadProducts()}
            className="w-10 h-10 items-center justify-center ml-2">
            <Search size={20} color={GREEN} />
          </TouchableOpacity>
        </View>

        {/* Formulario de alta / edición (panel verde) */}
        {showForm && (
          <View
            style={{
              backgroundColor: GREEN,
              borderRadius: 24,
              borderTopLeftRadius: 56,
              borderBottomLeftRadius: 56,
              paddingVertical: 24,
              paddingRight: 24,
              paddingLeft: 32,
              marginBottom: 16,
            }}>
            <Text className="text-white font-bold text-lg mb-4">
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </Text>

            <Text className="text-white text-[13px]">Nombre</Text>
            <LineInput light value={name} onChangeText={setName} style={{ marginBottom: 14 }} />

            <Text className="text-white text-[13px]">Descripción (opcional)</Text>
            <LineInput
              light
              value={description}
              onChangeText={setDescription}
              style={{ marginBottom: 14 }}
            />

            <View className="flex-row gap-5">
              <View className="flex-1">
                <Text className="text-white text-[13px]">Precio</Text>
                <LineInput
                  light
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  style={{ marginBottom: 14 }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-white text-[13px]">Stock</Text>
                <LineInput
                  light
                  value={stock}
                  onChangeText={(t) => setStock(t.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  style={{ marginBottom: 14 }}
                />
              </View>
            </View>

            {formError && (
              <View className="bg-white rounded-xl px-4 py-2 mb-3 self-start">
                <Text className="text-[#A93E2B] text-xs">{formError}</Text>
              </View>
            )}

            <View className="flex-row justify-end gap-3 mt-1">
              <TouchableOpacity
                onPress={closeForm}
                disabled={saving}
                className="px-6 h-11 rounded-full border border-white items-center justify-center">
                <Text className="text-white">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="px-8 h-11 rounded-full bg-white items-center justify-center"
                style={{ opacity: saving ? 0.7 : 1 }}>
                <Text className="font-bold" style={{ color: GREEN }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {error && (
          <View className="bg-[#FFF7F5] border border-[#F0C9C1] rounded-xl p-4 mb-4">
            <Text className="text-[#A93E2B] mb-2">{error}</Text>
            <TouchableOpacity onPress={() => loadProducts()}>
              <Text className="font-bold" style={{ color: GREEN }}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && products.length === 0 && (
          <ActivityIndicator color={GREEN} className="mt-6" />
        )}

        {/* Lista */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={() => loadProducts()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            !loading && !error ? (
              <Text className="text-[#6B6B6B] text-center mt-6">
                No hay productos.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View className="bg-white border border-[#E5E5E5] rounded-2xl p-4 mb-3 flex-row items-center">
              <View className="flex-1 pr-3">
                <Text className="text-black font-bold text-base">{item.name}</Text>
                <Text className="font-bold mt-1" style={{ color: GREEN }}>
                  ${Number(item.price).toLocaleString('es-AR')}
                </Text>
                <Text className="text-[#6B6B6B] mt-1">Stock: {item.stock}</Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="Editar"
                onPress={() => openEdit(item)}
                className="w-10 h-10 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: GREEN_SOFT }}>
                <Pencil size={17} color={GREEN} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Eliminar"
                onPress={() => handleDelete(item)}
                className="w-10 h-10 bg-[#FDECE8] rounded-full items-center justify-center">
                <Trash2 size={17} color="#D95D41" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}