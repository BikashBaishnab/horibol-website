import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Spacing } from '../../theme';
import type { HomeSectionItem } from '../../types';
import SDUICard from './SDUICard';

interface Grid2x2SectionProps {
    items: HomeSectionItem[];
}

const Grid2x2Section: React.FC<Grid2x2SectionProps> = React.memo(({ items }) => {
    const { width: windowWidth } = useWindowDimensions();
    const isDesktop = windowWidth >= 768;

    // Take 4 items for grid, but can be more if we want to show a longer row on desktop
    const displayItems = isDesktop ? items.slice(0, 6) : items.slice(0, 4);

    return (
        <View style={styles.container}>
            {displayItems.map((item) => (
                <View
                    key={item.id}
                    style={[
                        styles.cardWrapper,
                        { width: isDesktop ? (displayItems.length > 4 ? '15.5%' : '24%') : '48%' }
                    ]}
                >
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
        justifyContent: 'flex-start', // Use start and gap for consistency
        paddingHorizontal: Spacing.sm,
        gap: Spacing.sm,
    },
    cardWrapper: {
        marginBottom: Spacing.sm,
    },
});

Grid2x2Section.displayName = 'Grid2x2Section';
export default Grid2x2Section;
