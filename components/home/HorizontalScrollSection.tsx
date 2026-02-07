import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Spacing } from '../../theme';
import type { HomeSectionItem } from '../../types';
import SDUICard from './SDUICard';

interface HorizontalScrollSectionProps {
    items: HomeSectionItem[];
}

const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = React.memo(({ items }) => {
    const { width: windowWidth } = useWindowDimensions();
    const isDesktop = windowWidth >= 768;
    const cardWidth = isDesktop ? 180 : 130;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {items.map((item, index) => (
                <SDUICard
                    key={item.id}
                    item={item}
                    width={cardWidth}
                />
            ))}
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.sm,
        gap: Spacing.sm,
        paddingBottom: Spacing.xs,
    },
});

HorizontalScrollSection.displayName = 'HorizontalScrollSection';
export default HorizontalScrollSection;
