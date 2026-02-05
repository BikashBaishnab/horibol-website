import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

interface LegalLayoutProps {
    title: string;
    lastUpdated?: string;
    children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, lastUpdated, children }) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + Spacing.huge }
                ]}
            >
                <View style={styles.contentWrapper}>
                    <Text style={styles.title}>{title}</Text>
                    {lastUpdated && (
                        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
                    )}
                    <View style={styles.childrenWrapper}>
                        {children}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    backButton: {
        padding: Spacing.xs,
        marginRight: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    contentWrapper: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    lastUpdated: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
        marginBottom: Spacing.xl,
    },
    childrenWrapper: {
        gap: Spacing.lg,
    },
});
