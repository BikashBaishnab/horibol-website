import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

interface LegalSectionProps {
    title?: string;
    content?: string;
    items?: string[];
    children?: React.ReactNode;
}

export const LegalSection: React.FC<LegalSectionProps> = ({ title, content, items, children }) => {
    return (
        <View style={styles.section}>
            {title && <Text style={styles.sectionTitle}>{title}</Text>}
            {content && <Text style={styles.sectionContent}>{content}</Text>}
            {items && (
                <View style={styles.itemsContainer}>
                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.itemText}>{item}</Text>
                        </View>
                    ))}
                </View>
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    sectionContent: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        lineHeight: 22,
    },
    itemsContainer: {
        marginTop: Spacing.sm,
        gap: Spacing.xs,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
        marginRight: Spacing.sm,
        marginTop: 2,
    },
    itemText: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        lineHeight: 22,
    },
});
