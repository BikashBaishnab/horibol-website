/**
 * Write Review Screen
 * 
 * Premium review submission screen with star rating selector,
 * text input, and optional image upload.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

// Services
import { submitReview } from '../../services/review.service';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function WriteReviewScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const productId = parseInt(params.productId as string || '0', 10);
    const productName = params.productName as string || 'Product';

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating');
            return;
        }

        setSubmitting(true);
        const result = await submitReview(productId, rating, comment || undefined);
        setSubmitting(false);

        if (result.success) {
            Alert.alert(
                'Thank You!',
                'Your review has been submitted successfully.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } else {
            Alert.alert('Error', result.error || 'Failed to submit review');
        }
    };

    const renderStar = (starNumber: number) => {
        const filled = starNumber <= rating;
        return (
            <TouchableOpacity
                key={starNumber}
                onPress={() => setRating(starNumber)}
                style={styles.starButton}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={filled ? 'star' : 'star-outline'}
                    size={44}
                    color={filled ? '#FFB800' : Colors.border.default}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Write a Review</Text>
                <View style={styles.headerRight} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Product Info */}
                    <View style={styles.productCard}>
                        <Text style={styles.productLabel}>Reviewing</Text>
                        <Text style={styles.productName} numberOfLines={2}>
                            {productName}
                        </Text>
                    </View>

                    {/* Star Rating */}
                    <View style={styles.ratingSection}>
                        <Text style={styles.sectionTitle}>Your Rating</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map(renderStar)}
                        </View>
                        {rating > 0 && (
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingLabel}>{STAR_LABELS[rating]}</Text>
                            </View>
                        )}
                    </View>

                    {/* Review Text */}
                    <View style={styles.reviewSection}>
                        <Text style={styles.sectionTitle}>Your Review (Optional)</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Share your experience with this product..."
                                placeholderTextColor={Colors.text.tertiary}
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                            <Text style={styles.charCount}>{comment.length}/500</Text>
                        </View>
                    </View>

                    {/* Tips */}
                    <View style={styles.tipsCard}>
                        <Ionicons name="bulb-outline" size={20} color={Colors.accent} />
                        <View style={styles.tipsContent}>
                            <Text style={styles.tipsTitle}>Review Tips</Text>
                            <Text style={styles.tipsText}>
                                • Share what you liked or didn&apos;t like{'\n'}
                                • Mention quality, fit, or performance{'\n'}
                                • Be honest and helpful to other buyers
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit Button */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity
                    style={[styles.submitButton, (rating === 0 || submitting) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={rating === 0 || submitting}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={rating > 0 && !submitting
                            ? [Colors.primary, Colors.primaryDark]
                            : ['#CCC', '#BBB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Text>
                        {!submitting && (
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background.surface,
        ...Shadows.sm,
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
        width: 32,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },

    // Product Card
    productCard: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
        marginBottom: Spacing.xl,
    },
    productLabel: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
        marginBottom: Spacing.xs,
    },
    productName: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },

    // Rating Section
    ratingSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
        alignSelf: 'flex-start',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    starButton: {
        padding: Spacing.xs,
    },
    ratingBadge: {
        backgroundColor: '#FFF8E7',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: '#FFE4B5',
    },
    ratingLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.accent,
    },

    // Review Text
    reviewSection: {
        marginBottom: Spacing.xl,
    },
    textInputContainer: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
        overflow: 'hidden',
    },
    textInput: {
        padding: Spacing.lg,
        fontSize: FontSize.md,
        color: Colors.text.primary,
        minHeight: 150,
    },
    charCount: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.md,
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
    },

    // Tips
    tipsCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F9FF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    tipsContent: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    tipsTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.accent,
        marginBottom: Spacing.xs,
    },
    tipsText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        lineHeight: 20,
    },

    // Bottom Bar
    bottomBar: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        backgroundColor: Colors.background.surface,
        ...Shadows.lg,
    },
    submitButton: {},
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    submitText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: '#fff',
    },
});
