import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    LayoutAnimation,
    Platform,
    Pressable,
    StatusBar as RNStatusBar,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Mock ImageViewing to avoid problematic import on web
const ImageViewing = ({ visible, onRequestClose }: any) => {
    React.useEffect(() => {
        if (visible && Platform.OS === 'web') onRequestClose?.();
    }, [visible]);
    return null;
};

import DeliveryCheck from '../../components/ui/DeliveryCheck';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { checkItemInCart } from '../../services/cart.service';
import { getProductDetail } from '../../services/product.service';
import { getProductReviews, getReviewStats, Review, ReviewStats } from '../../services/review.service';
import { addToWishlist, isInWishlist, removeFromWishlist } from '../../services/wishlist.service';
import { Dimensions } from '../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Static width removed - using useWindowDimensions inside components

const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    return (
        <View style={styles.sectionContainer}>
            <TouchableOpacity onPress={toggle} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <MaterialIcons name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#878787" />
            </TouchableOpacity>
            {isOpen && <View style={styles.sectionContent}>{children}</View>}
        </View>
    );
};

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();
    const { refreshCartCount, addToCart } = useCart();
    const { showToast } = useToast();
    const flatListRef = React.useRef<FlatList>(null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [activeSpecTab, setActiveSpecTab] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        loadProduct(null);
    }, [id]);

    useEffect(() => {
        if (data?.selected?.variant_id) {
            setActiveImageIndex(0);
            if (flatListRef.current && data?.images && data.images.length > 0) {
                try {
                    flatListRef.current.scrollToIndex({ index: 0, animated: false });
                } catch (e) {
                    // Ignore scroll errors on unmounted/remounting versions
                }
            }
        }
    }, [data?.selected?.variant_id]);

    const loadProduct = async (variantId: number | null) => {
        if (!id) return;
        if (!data) setLoading(true);
        const result = await getProductDetail(Number(id), variantId);
        if (result) {
            setData(result);
            // Ensure indicators and carousel reset when data changes (handled by useEffect on result.images)
            const currentVariantId = result.selected?.variant_id || null;
            checkCartStatus(Number(id), currentVariantId);
            checkWishlistStatus();
            loadReviews(Number(id));
            const desc = result.description || result.selected?.description;
            if (Array.isArray(desc) && desc.length > 0 && typeof desc[0] === 'object' && desc[0].title) {
                setActiveSpecTab(desc[0].title);
            }
        }
        setLoading(false);
    };

    const loadReviews = async (productId: number) => {
        const [reviewsData, stats] = await Promise.all([
            getProductReviews(productId),
            getReviewStats(productId)
        ]);
        setReviews(reviewsData);
        setReviewStats(stats);
    };

    const checkCartStatus = async (pId: number, vId: number | null) => {
        const exists = await checkItemInCart(pId, vId);
        setIsInCart(exists);
    };

    const checkWishlistStatus = async () => {
        if (!user?.id || !id) return;
        const currentVariantId = data?.selected?.variant_id || null;
        const wishlisted = await isInWishlist(user.id, Number(id), currentVariantId);
        setIsWishlisted(wishlisted);
    };

    const handleWishlistToggle = async () => {
        if (!user?.id) {
            Alert.alert('Login Required', 'Please login to add items to wishlist.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/auth/login') }
            ]);
            return;
        }
        setWishlistLoading(true);
        const currentVariantId = data?.selected?.variant_id || null;
        try {
            if (isWishlisted) {
                await removeFromWishlist(user.id, Number(id), currentVariantId);
                setIsWishlisted(false);
                showToast('Removed from wishlist');
            } else {
                await addToWishlist(user.id, Number(id), currentVariantId);
                setIsWishlisted(true);
                showToast('Added to wishlist');
            }
        } catch (error) {
            showToast('Failed to update wishlist', 'error');
        }
        setWishlistLoading(false);
    };

    const handleShare = async () => {
        const productName = data?.name || 'Check out this product';
        try {
            await Share.share({
                message: `Check out ${productName} on Horibol App!`,
                title: productName,
            });
        } catch (error) {
        }
    };

    const handleBuyNow = () => {
        if (selected && selected.variant_id) {
            router.push({
                pathname: '/order-summary',
                params: {
                    isBuyNow: 'true',
                    variantId: selected.variant_id,
                    qty: 1
                }
            });
        }
    };

    const handleColorSelect = (variantId: number) => loadProduct(variantId);
    const handleOptionSelect = (variantId: number) => loadProduct(variantId);

    const handleAddToCart = async () => {
        if (isInCart) {
            router.push('/(tabs)/cart');
            return;
        }
        if (!data) return;
        setAddingToCart(true);
        try {
            const variantId = data.selected.variant_id || null;
            await addToCart(data, variantId);
            setIsInCart(true);
            showToast('Item added to cart');
        } catch (error: any) {
            if (error.message.includes("Please log in")) {
                Alert.alert("Login Required", "You need to login to add items to cart.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => router.push('/auth/login') }
                ]);
            } else {
                Alert.alert("Error", error.message || "Could not add to cart");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FFD700" /></View>;
    if (!data) return <View style={styles.center}><Text>Product not found</Text></View>;

    const { selected, colours, options, images } = data;
    const isOutOfStock = selected.stock === 0;
    const footerImages = images?.map((img: string) => ({ uri: img })) || [];
    const productWeight = selected.weight_kg ? Number(selected.weight_kg) : 0.5;

    const highlightsData = data.highlight || selected.highlight || [];
    const descriptionData = data.description || selected.description || [];
    const isComplexSpec = Array.isArray(descriptionData) && descriptionData.length > 0 && typeof descriptionData[0] === 'object' && 'title' in descriptionData[0];
    const isObjectSpec = !Array.isArray(descriptionData) && typeof descriptionData === 'object' && descriptionData !== null;
    const activeSpecData = isComplexSpec ? descriptionData.find((d: any) => d.title === activeSpecTab)?.data_list || [] : [];

    const getAttributeSummary = (attrs: any) => {
        if (!attrs) return '';
        const { ram, storage } = attrs;
        return [ram, storage].filter(Boolean).join(' + ');
    };

    const ramStorage = getAttributeSummary(selected.attributes);
    const colour = selected.attributes?.colour;

    const optLabel = ramStorage;

    const dynamicProductName = `${data.name}${colour ? ` (${colour})` : ''}${ramStorage ? ` (${ramStorage})` : ''}`;



    const renderHeader = () => (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchContainer} onPress={() => router.push('/search')} activeOpacity={0.9}>
                <Feather name="search" size={18} color="#777" style={styles.searchIcon} />
                <Text style={styles.searchText}>Search for products...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => router.push('/(tabs)/cart')}>
                <Ionicons name="cart-outline" size={24} color="#000" />
            </TouchableOpacity>
        </View>
    );

    const isWeb = false; // Forced false to keep mobile styling on web per user request
    const isDesktop = windowWidth >= 768 && !isWeb; // Only consider desktop if not forcing mobile layout
    const contentWidth = Math.min(windowWidth, 768); // Use 768 for web, windowWidth for mobile
    const carouselWidth = isDesktop ? contentWidth * 0.45 : windowWidth;

    return (
        <View style={{ flex: 1, backgroundColor: '#f1f2f4' }}>
            <RNStatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View style={[isDesktop ? styles.productRow : styles.mobileFull, { backgroundColor: '#fff' }]}>
                    <View style={isDesktop ? { width: carouselWidth } : styles.mobileFull}>
                        <View style={[styles.carouselContainer, isDesktop && { height: 500 }]}>
                            <FlatList
                                ref={flatListRef}
                                key={`carousel-${selected.variant_id}-${isDesktop}`}
                                data={images || []}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => `${index}-${item}`}
                                getItemLayout={(_, index) => ({
                                    length: carouselWidth,
                                    offset: carouselWidth * index,
                                    index,
                                })}
                                renderItem={({ item, index }) => (
                                    <Pressable
                                        onPress={() => { setCurrentImageIndex(index); setIsVisible(true); }}
                                        style={[styles.imageWrapper, { width: carouselWidth, height: isDesktop ? 480 : 380, overflow: 'hidden' }]}
                                    >
                                        <Image
                                            source={{ uri: item }}
                                            style={{ width: '100%', height: '100%' }}
                                            contentFit="contain"
                                            cachePolicy="disk"
                                            transition={300}
                                        />
                                    </Pressable>
                                )}
                                onScroll={(e) => {
                                    const x = e.nativeEvent.contentOffset.x;
                                    const index = Math.round(x / carouselWidth);
                                    if (index !== activeImageIndex) {
                                        setActiveImageIndex(index);
                                    }
                                }}
                                scrollEventThrottle={16}
                            />

                            {/* Modern Line-based Indicators */}
                            {images && images.length > 1 && (
                                <View style={styles.paginationWrapper}>
                                    {images.map((_: any, i: number) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.paginationLine,
                                                activeImageIndex === i && styles.paginationLineActive
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}

                            {/* Wishlist & Share Icons Overlay */}
                            <View style={styles.actionIconsOverlay}>
                                <TouchableOpacity
                                    style={styles.actionIconButton}
                                    onPress={handleWishlistToggle}
                                    disabled={wishlistLoading}
                                >
                                    {wishlistLoading ? (
                                        <ActivityIndicator size="small" color="#FF6B6B" />
                                    ) : (
                                        <Ionicons
                                            name={isWishlisted ? 'heart' : 'heart-outline'}
                                            size={24}
                                            color={isWishlisted ? '#FF6B6B' : '#666'}
                                        />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionIconButton}
                                    onPress={handleShare}
                                >
                                    <Ionicons name="share-social-outline" size={22} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={isDesktop ? styles.desktopInfo : styles.mobileFull}>
                        <View style={styles.infoContainer}>
                            {selected.attributes?.colour ? (
                                <Text style={styles.selectedColorText}>
                                    Selected Colour: <Text style={{ fontWeight: 'bold', color: 'black' }}>{selected.attributes.colour}</Text>
                                </Text>
                            ) : null}

                            {colours && colours.length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                                    {colours.map((c: any, index: number) => {
                                        const variantColour = c.attributes?.colour;
                                        const isActive = variantColour === selected.attributes?.colour;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => handleColorSelect(c.variant_id)}
                                                style={[styles.colorChip, isActive && styles.colorChipSelected]}
                                            >
                                                <Image
                                                    source={{ uri: c.image }}
                                                    style={styles.colorChipImage}
                                                    contentFit="contain"
                                                    cachePolicy="disk"
                                                />
                                                {variantColour && <Text style={styles.colorChipText}>{variantColour}</Text>}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            ) : null}

                            {options && options.length > 0 ? (
                                <View style={{ marginTop: 20 }}>
                                    <Text style={styles.sectionLabel}>Variant: <Text style={{ fontWeight: 'bold' }}>{optLabel}</Text></Text>
                                    <View style={styles.optionsGrid}>
                                        {options.map((opt: any, index: number) => {
                                            const isActive = opt.variant_id === selected.variant_id || opt.variant_id === selected.id;
                                            const optAttributes = opt.attributes
                                                ? [opt.attributes.ram, opt.attributes.storage].filter(Boolean).join(' + ')
                                                : '';

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => handleOptionSelect(opt.variant_id)}
                                                    disabled={!opt.in_stock}
                                                    style={[styles.optionBox, isActive && styles.optionBoxSelected, !opt.in_stock && styles.optionBoxDisabled]}
                                                >
                                                    <Text style={styles.optionTitle}>{optAttributes || 'Standard'}</Text>
                                                    <Text style={styles.optionPrice}>₹{opt.price}</Text>
                                                    {opt.in_stock ? (
                                                        opt.discount_percentage > 0 ? (
                                                            <Text style={styles.optionDiscount}>{opt.discount_percentage}% Off</Text>
                                                        ) : null
                                                    ) : (
                                                        <Text style={styles.outOfStockText}>Out of stock</Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : null}

                            <View style={styles.mainInfoBlock}>
                                <Text style={styles.brandTitle}>{data.brand_name || data.brand?.name}</Text>
                                <Text style={styles.productName}>{dynamicProductName}</Text>
                                <View style={styles.priceRow}>
                                    <View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.bigDiscount}>{selected.discount_percentage}% OFF</Text>
                                            <Text style={styles.mrpText}>MRP: {selected.mrp}</Text>
                                        </View>
                                        <Text style={styles.finalPrice}>₹{selected.price}</Text>
                                    </View>
                                </View>

                                {isDesktop && (
                                    <View style={styles.desktopActions}>
                                        <TouchableOpacity
                                            style={[styles.amazonButton, styles.amazonCartButton, isInCart && { backgroundColor: '#eaffea', borderColor: '#4caf50' }]}
                                            disabled={isOutOfStock || addingToCart}
                                            onPress={handleAddToCart}
                                        >
                                            {addingToCart ? (
                                                <ActivityIndicator size="small" color="#000" />
                                            ) : (
                                                <Text style={styles.amazonButtonText}>{isInCart ? 'In Cart' : 'Add to Cart'}</Text>
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.amazonButton, styles.amazonBuyButton]}
                                            disabled={isOutOfStock}
                                            onPress={handleBuyNow}
                                        >
                                            <Text style={styles.amazonButtonText}>Buy Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Simple Offers Banner */}
                        <TouchableOpacity
                            style={{
                                marginHorizontal: 16,
                                marginBottom: 16,
                                padding: 12,
                                backgroundColor: '#FFF8E1',
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="pricetag" size={18} color="#F59E0B" />
                                <Text style={{ color: '#92400E', fontSize: 13, fontWeight: '500' }}>
                                    Bank offers available at checkout
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#92400E" />
                        </TouchableOpacity>
                    </View>
                </View>

                <DeliveryCheck
                    weight={productWeight}
                    length={selected.length}
                    breadth={selected.breadth}
                    height={selected.height}
                    isCod={data.is_cod ?? selected.is_cod}
                />

                <View style={isDesktop && styles.productRow}>
                    <View style={isDesktop ? { flex: 1.5 } : styles.mobileFull}>
                        {highlightsData && (Array.isArray(highlightsData) ? highlightsData.length > 0 : Object.keys(highlightsData).length > 0) && (
                            <CollapsibleSection title="Product Highlights" defaultOpen={true}>
                                <View style={styles.highlightContainer}>
                                    {Array.isArray(highlightsData) ? highlightsData.map((item: any, index: number) => {
                                        const label = item.key || item.label;
                                        const value = item.value;
                                        return (
                                            <View key={index} style={styles.highlightRow}>
                                                {label && <Text style={styles.highlightLabel}>{label}</Text>}
                                                <Text style={styles.highlightValue}>{String(value || item)}</Text>
                                            </View>
                                        )
                                    }) : Object.entries(highlightsData).map(([key, value], index) => (
                                        <View key={index} style={styles.highlightRow}>
                                            <Text style={styles.highlightLabel}>{key}</Text>
                                            <Text style={styles.highlightValue}>{String(value)}</Text>
                                        </View>
                                    ))}
                                </View>
                            </CollapsibleSection>
                        )}
                    </View>

                    <View style={isDesktop ? { flex: 2 } : styles.mobileFull}>
                        {descriptionData ? (
                            <CollapsibleSection title="Specifications" defaultOpen={isDesktop}>
                                {isComplexSpec ? (
                                    <View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
                                            {descriptionData.map((cat: any, index: number) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[styles.tabItem, activeSpecTab === cat.title && styles.activeTabItem]}
                                                    onPress={() => setActiveSpecTab(cat.title)}
                                                >
                                                    <Text style={[styles.tabText, activeSpecTab === cat.title && styles.activeTabText]}>
                                                        {cat.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                        <View style={styles.specsTable}>
                                            {activeSpecData.map((row: any, idx: number) => (
                                                <View key={idx} style={styles.specRow}>
                                                    <Text style={styles.specLabel}>{row.label}</Text>
                                                    <Text style={styles.specValue}>{row.value}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ) : isObjectSpec ? (
                                    <View style={styles.specsTable}>
                                        {Object.entries(descriptionData).map(([key, value], idx) => (
                                            <View key={idx} style={styles.specRow}>
                                                <Text style={styles.specLabel}>{key}</Text>
                                                <Text style={styles.specValue}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View>
                                        {Array.isArray(descriptionData) ? (
                                            descriptionData.map((para: any, index: number) => (
                                                <Text key={index} style={styles.descriptionText}>{String(para)}</Text>
                                            ))
                                        ) : (
                                            <Text style={styles.descriptionText}>{String(descriptionData)}</Text>
                                        )}
                                    </View>
                                )}
                            </CollapsibleSection>
                        ) : null}
                    </View>
                </View>

                {/* Reviews Section */}
                <CollapsibleSection title="Ratings & Reviews" defaultOpen={false}>
                    {/* Review Stats */}
                    {reviewStats && reviewStats.totalReviews > 0 ? (
                        <View style={styles.statsContainer}>
                            <View style={styles.ratingBigContainer}>
                                <Text style={styles.ratingBig}>{reviewStats.averageRating}</Text>
                                <View style={styles.ratingStarsRow}>
                                    <Ionicons name="star" size={16} color="#FFB800" />
                                    <Text style={styles.totalReviewsText}>{reviewStats.totalReviews} ratings</Text>
                                </View>
                            </View>

                            <View style={styles.distributionContainer}>
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = reviewStats.ratingDistribution[star as keyof typeof reviewStats.ratingDistribution] || 0;
                                    const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                                    return (
                                        <View key={star} style={styles.distributionRow}>
                                            <Text style={styles.starLabel}>{star} <Ionicons name="star" size={10} color="#666" /></Text>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                                            </View>
                                            <Text style={styles.countLabel}>{count}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyReviews}>
                            <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                            <Text style={styles.emptyReviewsSubText}>Be the first to review this product</Text>
                        </View>
                    )}

                    {/* Reviews List */}
                    {reviews.map((review) => (
                        <View key={review.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerInfo}>
                                    <View style={styles.reviewerAvatar}>
                                        <Text style={styles.reviewerInitials}>
                                            {(review.user_name || 'U').charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.reviewerName}>{review.user_name || 'Verified User'}</Text>
                                        <View style={styles.reviewRatingRow}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Ionicons
                                                    key={s}
                                                    name={s <= review.rating ? "star" : "star-outline"}
                                                    size={12}
                                                    color={s <= review.rating ? "#FFB800" : "#ddd"}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.reviewDate}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            {review.comment && (
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            )}
                        </View>
                    ))}

                    {reviews.length > 0 && (
                        <TouchableOpacity style={styles.viewAllReviewsBtn}>
                            <Text style={styles.viewAllReviewsText}>View all reviews</Text>
                            <Ionicons name="chevron-forward" size={16} color="#666" />
                        </TouchableOpacity>
                    )}
                </CollapsibleSection>
            </ScrollView>

            {!isDesktop && (
                <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, alignSelf: 'center', maxWidth: Dimensions.webMaxWidth }]}>
                    <TouchableOpacity
                        style={[styles.cartButton, isInCart && { backgroundColor: '#eaffea', borderColor: '#4caf50' }]}
                        disabled={isOutOfStock || addingToCart}
                        onPress={handleAddToCart}
                    >
                        {addingToCart ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.cartButtonText}>{isInCart ? 'In Cart' : 'Add to Cart'}</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.amazonBuyButton, styles.cartButton, isOutOfStock && styles.disabledButton]}
                        disabled={isOutOfStock}
                        onPress={handleBuyNow}
                    >
                        <Text style={[styles.buyButtonText, isOutOfStock && { color: '#666' }]}>
                            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <ImageViewing
                images={images || []}
                imageIndex={currentImageIndex}
                visible={isVisible}
                backgroundColor="#FFFFFF"
                onRequestClose={() => setIsVisible(false)}
                swipeToCloseEnabled={true}
                doubleTapToZoomEnabled={true}
                HeaderComponent={() => (
                    <View style={{ paddingTop: insets.top + 10, paddingRight: 20, alignItems: 'flex-end', width: '100%', zIndex: 999 }}>
                        <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

// ... styles remain the same ...
const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', elevation: 2, zIndex: 100 },
    headerIconButton: { padding: 8 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f2f4', borderRadius: 6, paddingHorizontal: 12, height: 40, marginHorizontal: 12, borderWidth: 1, borderColor: '#e0e0e0' },
    searchIcon: { marginRight: 8 },
    searchText: { color: '#888', fontSize: 14 },
    carouselContainer: { height: 400, backgroundColor: '#fff', position: 'relative' as const },
    imageWrapper: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    mainImage: { width: '100%', height: '100%' },
    infoContainer: { padding: 16 },
    selectedColorText: { fontSize: 14, color: '#555', marginBottom: 10 },
    selectorScroll: { flexDirection: 'row', marginBottom: 10 },
    colorChip: { marginRight: 12, alignItems: 'center', padding: 4, borderWidth: 1, borderColor: '#eee', borderRadius: 8, backgroundColor: '#fff' },
    colorChipSelected: { borderColor: '#FFD700', borderWidth: 2, backgroundColor: '#FFFDF5' },
    colorChipImage: { width: 50, height: 60, marginBottom: 4 },
    colorChipText: { fontSize: 10, color: '#333' },
    sectionLabel: { fontSize: 14, color: '#000', marginBottom: 10 },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionBox: { width: '48%', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', backgroundColor: '#fff', marginBottom: 10 },
    optionBoxSelected: { borderColor: '#FFD700', backgroundColor: '#FFFDF5' },
    optionBoxDisabled: { opacity: 0.5, backgroundColor: '#f9f9f9' },
    optionTitle: { fontSize: 12, fontWeight: '400', color: '#666', marginBottom: 4 },
    optionPrice: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    optionDiscount: { fontSize: 11, color: '#388E3C', fontWeight: 'bold', marginTop: 2 },
    outOfStockText: { fontSize: 12, color: 'red', marginTop: 2 },
    mainInfoBlock: { marginTop: 20 },
    brandTitle: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    productName: { fontSize: 16, color: '#555', marginTop: 2 },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    bigDiscount: { fontSize: 18, color: '#008080', fontWeight: 'bold', marginRight: 10 },
    mrpText: { fontSize: 14, color: '#999', textDecorationLine: 'line-through', marginRight: 10 },
    finalPrice: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', elevation: 20 },
    cartButton: { flex: 1, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 6, borderWidth: 1, borderColor: '#ddd' },
    buyButton: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    disabledButton: { backgroundColor: '#ccc', borderColor: '#ccc' },
    cartButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    buyButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    desktopActions: { marginTop: 24, gap: 12 },
    amazonButton: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    amazonCartButton: {
        backgroundColor: '#FFD814',
        borderColor: '#FCD200',
        borderWidth: 1,
    },
    amazonBuyButton: {
        backgroundColor: '#FFA41C',
        borderColor: '#FF8F00',
        borderWidth: 1,
    },
    amazonButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0F1111',
    },
    closeButton: { marginTop: 10, backgroundColor: '#f0f0f0', borderRadius: 20, padding: 8 },
    sectionContainer: { backgroundColor: '#fff', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 4 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
    sectionContent: { paddingBottom: 12 },
    highlightContainer: { marginTop: 4, gap: 12 },
    highlightRow: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingBottom: 8 },
    highlightLabel: { width: 100, fontSize: 13, color: '#878787', fontWeight: '500' },
    highlightValue: { flex: 1, fontSize: 13, color: '#212121', lineHeight: 18 },
    tabScroll: { marginBottom: 16, marginTop: 4 },
    tabItem: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 4, marginRight: 10, backgroundColor: '#fff' },
    activeTabItem: { backgroundColor: '#212121', borderColor: '#212121' },
    tabText: { fontSize: 14, color: '#212121', fontWeight: '500' },
    activeTabText: { color: '#ffffff', fontWeight: '600' },
    specsTable: { marginTop: 4 },
    specRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    specLabel: { flex: 1, fontSize: 14, color: '#878787' },
    specValue: { flex: 2, fontSize: 14, color: '#212121' },
    descriptionText: { fontSize: 14, color: '#212121', lineHeight: 22, marginBottom: 8 },
    actionIconsOverlay: { position: 'absolute', top: 12, right: 12, flexDirection: 'column', gap: 10 },
    actionIconButton: { backgroundColor: 'rgba(255,255,255,0.95)', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
    paginationWrapper: { position: 'absolute', bottom: 12, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
    paginationLine: { width: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)' },
    paginationLineActive: { width: 24, backgroundColor: '#FFD700' },

    // Review Styles
    statsContainer: { flexDirection: 'row', marginBottom: 20 },
    ratingBigContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#f0f0f0' },
    ratingBig: { fontSize: 36, fontWeight: 'bold', color: '#212121' },
    ratingStarsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    totalReviewsText: { fontSize: 12, color: '#666' },
    distributionContainer: { flex: 2, paddingLeft: 20 },
    distributionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    starLabel: { width: 30, fontSize: 12, color: '#666' },
    progressBarBg: { flex: 1, height: 4, backgroundColor: '#f0f0f0', borderRadius: 2, marginHorizontal: 8 },
    progressBarFill: { height: 4, backgroundColor: '#FFB800', borderRadius: 2 },
    countLabel: { width: 20, fontSize: 12, color: '#999', textAlign: 'right' },
    emptyReviews: { alignItems: 'center', padding: 20 },
    emptyReviewsText: { fontSize: 16, fontWeight: '600', color: '#212121' },
    emptyReviewsSubText: { fontSize: 14, color: '#666', marginTop: 4 },
    reviewItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center' },
    reviewerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    reviewerInitials: { fontSize: 14, fontWeight: 'bold', color: '#666' },
    reviewerName: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 2 },
    reviewRatingRow: { flexDirection: 'row' },
    reviewDate: { fontSize: 12, color: '#999' },
    reviewComment: { fontSize: 14, color: '#444', lineHeight: 20 },
    viewAllReviewsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    viewAllReviewsText: { fontSize: 14, fontWeight: '600', color: '#666', marginRight: 4 },
    productRow: { flexDirection: "row", gap: 24, alignItems: "flex-start" },
    mobileFull: { width: "100%" },
    desktopInfo: { flex: 1, paddingLeft: 0, paddingRight: 0 },
});