import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';

interface Notification {
    id: string;
    title: string;
    message: string;
    created_at: string;
    type: 'order' | 'offer' | 'info';
    unread: boolean;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

            return date.toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationItem, item.unread && styles.unreadItem]}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, styles[item.type]]}>
                <MaterialCommunityIcons
                    name={item.type === 'order' ? 'package-variant' : item.type === 'offer' ? 'tag-outline' : 'information-outline'}
                    size={24}
                    color={Colors.background.surface}
                />
            </View>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.time}>{formatTime(item.created_at)}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="bell-off-outline" size={60} color={Colors.text.disabled} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    headerRight: {
        width: 40,
    },
    listContent: {
        paddingVertical: Spacing.sm,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: Spacing.md,
        backgroundColor: Colors.background.surface,
        marginBottom: 1,
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: '#FFF9E1', // Subtle highlight for unread
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    order: { backgroundColor: '#FFA000' },
    offer: { backgroundColor: '#FF4081' },
    info: { backgroundColor: '#2196F3' },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    time: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
    },
    message: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primaryDark,
        marginLeft: Spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text.disabled,
    },
});
