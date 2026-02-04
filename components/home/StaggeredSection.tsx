import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../theme';
import type { HomeSectionItem } from '../../types';
import SDUICard from './SDUICard';

interface StaggeredSectionProps {
    items: HomeSectionItem[];
}

const StaggeredSection: React.FC<StaggeredSectionProps> = React.memo(({ items }) => {
    // Split items into two columns
    const leftColumn = items.filter((_, i) => i % 2 === 0);
    const rightColumn = items.filter((_, i) => i % 2 !== 0);

    return (
        <View style={styles.container}>
            <View style={styles.column}>
                {leftColumn.map((item) => (
                    <View key={item.id} style={styles.cardWrapper}>
                        <SDUICard
                            item={item}
                            width="100%"
                        />
                    </View>
                ))}
            </View>
            <View style={styles.column}>
                {rightColumn.map((item) => (
                    <View key={item.id} style={styles.cardWrapper}>
                        <SDUICard
                            item={item}
                            width="100%"
                        />
                    </View>
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.sm,
        gap: Spacing.sm,
    },
    column: {
        flex: 1,
    },
    cardWrapper: {
        width: '100%',
        marginBottom: Spacing.sm,
    },
});

StaggeredSection.displayName = 'StaggeredSection';
export default StaggeredSection;
