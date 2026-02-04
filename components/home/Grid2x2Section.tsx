import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../theme';
import type { HomeSectionItem } from '../../types';
import SDUICard from './SDUICard';

interface Grid2x2SectionProps {
    items: HomeSectionItem[];
}

const Grid2x2Section: React.FC<Grid2x2SectionProps> = React.memo(({ items }) => {
    // Take exactly 4 items for 2x2 grid
    const displayItems = items.slice(0, 4);

    return (
        <View style={styles.container}>
            {displayItems.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                    <SDUICard
                        item={item}
                        width="100%"
                    />
                </View>
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
    },
    cardWrapper: {
        width: '48%',
        marginBottom: Spacing.sm,
    },
});

Grid2x2Section.displayName = 'Grid2x2Section';
export default Grid2x2Section;
