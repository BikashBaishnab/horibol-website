import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../../theme';
import { Brand } from '../../types';

interface BrandWarrantySectionProps {
    brand?: Brand;
    warrantyInfo?: string;
    onPress?: () => void;
}

export default function BrandWarrantySection({ brand, warrantyInfo, onPress }: BrandWarrantySectionProps) {
    if (!brand && !warrantyInfo) return null;

    const displayWarranty = warrantyInfo || `${brand?.name || 'Manufacturer'} warranty for device and accessories`;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.contentRow}>
                {/* Brand Logo or Default Icon */}
                <View style={styles.iconContainer}>
                    {brand?.image ? (
                        <Image
                            source={{ uri: brand.image }}
                            style={styles.brandImage}
                            contentFit="contain"
                        />
                    ) : (
                        <Ionicons name="shield-checkmark" size={28} color={Colors.accent} />
                    )}
                </View>

                {/* Warranty Info */}
                <View style={styles.textContainer}>
                    <Text style={styles.warrantyTitle}>Brand Warranty</Text>
                    <Text style={styles.warrantyText} numberOfLines={2}>
                        {displayWarranty}
                    </Text>
                </View>

                {/* Chevron Arrow */}
                <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginTop: 10,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F0FF',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginRight: Spacing.md,
    },
    brandImage: {
        width: 36,
        height: 36,
    },
    textContainer: {
        flex: 1,
    },
    warrantyTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    warrantyText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        lineHeight: 18,
    },
});
