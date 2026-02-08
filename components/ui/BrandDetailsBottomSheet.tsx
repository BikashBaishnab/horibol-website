import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';
import { Brand } from '../../types';

interface BrandDetailsBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    brand?: Brand;
    warrantyInfo?: string;
}

export default function BrandDetailsBottomSheet({ visible, onClose, brand, warrantyInfo }: BrandDetailsBottomSheetProps) {
    if (!brand && !warrantyInfo) return null;

    const handleCall = () => {
        if (brand?.support_contact) {
            Linking.openURL(`tel:${brand.support_contact}`);
        }
    };

    const handleWebsite = () => {
        if (brand?.website_url) {
            Linking.openURL(brand.website_url);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.brandRow}>
                        {brand?.image && (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: brand.image }}
                                    style={styles.brandImage}
                                    contentFit="contain"
                                />
                            </View>
                        )}
                        <View style={styles.warrantySummaryContainer}>
                            <Text style={styles.warrantySummaryText}>
                                {warrantyInfo || `${brand?.name} manufacturer warranty for device and accessories from the date of purchase`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Manufacturer information</Text>
                        <Text style={styles.descriptionText}>
                            {brand?.brand_description || 'Making quality technology accessible to everyone.'}
                        </Text>

                        <Text style={styles.brandNameText}>{brand?.name}</Text>

                        {brand?.support_contact && (
                            <View style={styles.contactSection}>
                                <Text style={styles.contactLabel}>For any warranty related issues, please call the {brand.name} Customer Support -</Text>
                                <TouchableOpacity onPress={handleCall} activeOpacity={0.7}>
                                    <Text style={styles.contactValue}>{brand.support_contact}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {brand?.website_url && (
                            <TouchableOpacity style={styles.websiteButton} onPress={handleWebsite} activeOpacity={0.7}>
                                <Ionicons name="globe-outline" size={20} color={Colors.accent} />
                                <Text style={styles.websiteText}>Visit Website</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.background.modal
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.xl,
        ...Shadows.xl,
        maxHeight: '80%',
        paddingTop: Spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingBottom: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    imageContainer: {
        width: 64,
        height: 64,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        padding: 8,
        marginRight: Spacing.lg,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandImage: {
        width: '100%',
        height: '100%',
    },
    warrantySummaryContainer: {
        flex: 1,
    },
    warrantySummaryText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        lineHeight: 22,
    },
    infoSection: {
        gap: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    descriptionText: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        lineHeight: 22,
    },
    brandNameText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginTop: Spacing.sm,
    },
    contactSection: {
        marginTop: Spacing.md,
    },
    contactLabel: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        lineHeight: 22,
    },
    contactValue: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginTop: 4,
    },
    websiteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.accent,
        alignSelf: 'flex-start',
    },
    websiteText: {
        color: Colors.accent,
        fontWeight: FontWeight.bold,
        marginLeft: Spacing.sm,
        fontSize: FontSize.md,
    }
});
