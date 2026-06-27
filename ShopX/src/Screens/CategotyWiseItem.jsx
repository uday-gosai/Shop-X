import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import ProductService from '../database/ProductService';
import AppHeader from '../Components/AppHeader';
import EmptyState from '../Components/EmptyState';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme';
import { formatPrice } from '../utils/formatters';

const { width } = Dimensions.get('window')

const CategotyWiseItem = ({ route, navigation }) => {
    const { item } = route.params;
    const [categoryWiseItem, setCategoryWiseItem] = useState([]);

    useEffect(() => {
        FilterItems();
    }, [])

    const FilterItems = async () => {
        const ActiveProducs = await ProductService.getActiveProducts();
        const FilterdProductCategoryWise = ActiveProducs.filter(
            product => product.category.toLowerCase().trim() === item.toLowerCase()
        );
        setCategoryWiseItem(FilterdProductCategoryWise);
    }

    const headerTitle = item?.charAt(0)?.toUpperCase() + item?.slice(1) || '';

    return (
        <View style={styles.container}>
            <AppHeader
                title={headerTitle}
                subtitle="Explore Category"
                showBack={true}
            />

            {categoryWiseItem.length <= 0 ? (
                <EmptyState
                    title={`No items found in ${headerTitle}`}
                    subtitle="We couldn't find any products in this category at the moment."
                    buttonTitle="Go Back"
                    onButtonPress={() => navigation.goBack()}
                    icon="🔍"
                />
            ) : (
                <FlatList
                    data={categoryWiseItem}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.rowWrapper}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('ItemDetails', { product: item })}
                        >
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item.image_uri }}
                                    style={styles.image}
                                />
                            </View>

                            <View style={styles.details}>
                                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>

                                <View style={styles.priceRow}>
                                    <Text style={styles.price}>
                                        {formatPrice(item.is_flash_sale === 1 ? item.flash_price : item.selling_price)}
                                    </Text>
                                    {item.is_flash_sale === 1 ? (
                                        item.flash_discount_percent > 0 && (
                                            <View style={styles.discountBadge}>
                                                <Text style={styles.discountBadgeText}>{item.flash_discount_percent}% OFF</Text>
                                            </View>
                                        )
                                    ) : (
                                        item.discount_percent > 0 && (
                                            <View style={styles.discountBadge}>
                                                <Text style={styles.discountBadgeText}>{item.discount_percent}% OFF</Text>
                                            </View>
                                        )
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    )
}

export default CategotyWiseItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    listContent: {
        padding: SPACING[4],
        paddingBottom: 40,
    },
    rowWrapper: {
        justifyContent: 'space-between',
        marginBottom: SPACING[4],
    },
    card: {
        width: (width - (SPACING[4] * 3)) / 2,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        overflow: 'hidden',
    },
    imageContainer: {
        height: 140,
        backgroundColor: COLORS.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    details: {
        padding: 12,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.gray[800],
        marginBottom: 8,
        height: 36,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    discountBadge: {
        backgroundColor: COLORS.success + '15',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.xs,
    },
    discountBadgeText: {
        fontSize: 9,
        color: COLORS.success,
        fontWeight: '800',
    }
})