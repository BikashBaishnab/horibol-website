import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';
import type { HomeSection } from '../../types';
import BannerSection from './BannerSection';
import Grid2x2Section from './Grid2x2Section';
import HorizontalScrollSection from './HorizontalScrollSection';
import StaggeredSection from './StaggeredSection';

interface SectionRendererProps {
    section: HomeSection;
}

const SectionRenderer: React.FC<SectionRendererProps> = React.memo(({ section }) => {
    const { items = [] } = section;

    const renderLayout = () => {
        switch (section.layout_type) {
            case 'scroll_horizontal':
                return <HorizontalScrollSection items={items} />;
            case 'grid_2x2':
                return <Grid2x2Section items={items} />;
            case 'staggered':
                return <StaggeredSection items={items} />;
            case 'banner':
                return <BannerSection items={items} />;
            default:
                return null;
        }
    };

    const hasHeader = section.title && section.title.trim() !== '';

    return (
        <View style={[styles.container, { backgroundColor: section.bg_color }]}>
            {/* Header Background Decoration (Optional) */}
            {section.header_bg_image && (
                <Image
                    source={{ uri: section.header_bg_image }}
                    style={styles.headerBgImage}
                    contentFit="cover"
                />
            )}

            {/* Section Header */}
            {hasHeader && (
                <View style={styles.header}>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.title}>{section.title}</Text>
                        {section.subtitle && (
                            <Text style={styles.subtitle}>{section.subtitle}</Text>
                        )}
                    </View>
                </View>
            )}

            {/* Layout Content */}
            <View style={styles.content}>
                {renderLayout()}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.lg,
        marginBottom: Spacing.sm,
        position: 'relative',
        overflow: 'hidden',
    },
    headerBgImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    headerTitleContainer: {
        flex: 1,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    content: {
        width: '100%',
    },
});

export default SectionRenderer;
