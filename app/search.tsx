import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// ✅ IMPORT EXPO-IMAGE
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our new helper files
import HighlightedText from '../components/ui/HighlightedText';
import { searchProducts, SearchResultItem } from '../lib/typesense';

export default function SearchScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timerId = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                setLoading(true);
                const data = await searchProducts(searchQuery);
                setResults(data);
                setLoading(false);
            } else {
                setResults([]);
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchQuery]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search for products, brands and more"
                        placeholderTextColor="#999"
                        autoFocus={true}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#000" />
                </View>
            )}

            <FlatList
                data={results}
                keyExtractor={(item) => item.product_id || Math.random().toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.resultItem}
                        onPress={() => router.push(`/search-results?query=${encodeURIComponent(item.product_name || item.brand_name || searchQuery)}` as any)}
                    >
                        {/* ✅ UPDATED TO EXPO-IMAGE WITH DISK CACHING */}
                        <Image
                            source={{ uri: item.main_image }}
                            style={styles.thumbnail}
                            contentFit="contain"
                            cachePolicy="disk"
                            transition={200}
                        />

                        <View style={styles.textContainer}>
                            <HighlightedText
                                text={item.brand_name}
                                highlight={item.highlight?.brand_name}
                                style={styles.brandText}
                                highlightStyle={styles.highlight}
                            />

                            <HighlightedText
                                text={item.product_name}
                                highlight={item.highlight?.product_name}
                                style={styles.productText}
                                highlightStyle={styles.highlight}
                            />
                        </View>

                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !loading && searchQuery.length > 2 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No results found</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { marginRight: 10, padding: 4 },
    inputContainer: { flex: 1, backgroundColor: '#f5f7fa', borderRadius: 4, height: 40, justifyContent: 'center' },
    input: { flex: 1, paddingHorizontal: 12, fontSize: 16, color: '#000' },
    loaderContainer: { paddingVertical: 20 },
    resultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    thumbnail: { width: 48, height: 48, borderRadius: 4, backgroundColor: '#f0f0f0', marginRight: 12 },
    textContainer: { flex: 1, justifyContent: 'center' },
    brandText: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 2 },
    productText: { fontSize: 14, color: '#333', lineHeight: 20 },
    highlight: { backgroundColor: '#FFF2CD', color: '#000' },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 14 },
});