import { Modal, StyleSheet, Text, Image, TouchableOpacity, View, ScrollView, Dimensions, StatusBar, Animated, ToastAndroid } from 'react-native'
import React, { useContext, useState, useRef } from 'react'
import CartService from '../database/CartService';
import UserContext from '../context/UserContext';
import LinearGradient from 'react-native-linear-gradient';

import OrderAddress from './OrderAddress';
import OrderService from '../database/OrderService';
import ProductService from '../database/ProductService';
import OrderItemService from '../database/OrderItemService';
import { formatPrice } from '../utils/formatters'

const { width } = Dimensions.get('window');

const ItemDetails = ({ navigation, route }) => {
    console.log(route)
    const { product } = route.params;
    const data = product;

    if (!data) return null;

    const { userId, updateCartCount } = useContext(UserContext);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isVisible, setIsVisible] = useState(false);

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const onHandleAddToCart = async () => {
        animateButton();
        await CartService.addToCart(userId, data.id, 1);
        await updateCartCount();
        ToastAndroid.show("Added to Cart successfully", ToastAndroid.SHORT);
        // We stay on the page for better UX, allowing user to view details or buy now.
    };

    const HandleDirectOrder = async (Value) => {
        const price = data.is_flash_sale === 1 ? data.flash_price : data.selling_price;
        const discount = data.is_flash_sale === 1 ? data.flash_discount_amount : data.discount_amount;

        const OrderId = await OrderService.placeOrder({
            userId: userId,
            userName: Value.userName,
            mobile: Value.MobileNo,
            address: Value.Address,
            total_items: 1,
            mrp: data.mrp,
            discount: discount,
            total_amount: price,
            payment_mode: Value.paymentMode,
            payment_status: Value.paymentStatus
        });

        await OrderItemService.addOrderItem(OrderId, {
            id: data.id,
            name: data.name,
            qty: 1,
            mrp: data.mrp,
            price: price
        });

        await ProductService.reduceStock(data.id, 1);

        // No cart update needed as we didn't add to cart
        // await updateCartCount(); 

        setIsVisible(false);
        ToastAndroid.show('Order Placed Successfully!', ToastAndroid.LONG);
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header Actions */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: data.image_uri }} style={styles.image} />
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {/* Title & Badge */}
                    <View style={styles.titleRow}>
                        <Text style={styles.productName}>{data.name}</Text>
                    </View>

                    <View style={styles.categoryRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{data.category}</Text>
                        </View>
                        {data.is_flash_sale === 1 && (
                            <LinearGradient colors={['#EF4444', '#F87171']} style={styles.flashBadge}>
                                <Text style={styles.flashText}>⚡ Flash Sale</Text>
                            </LinearGradient>
                        )}
                    </View>

                    {/* Price Block */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.sellingPrice}>
                            {formatPrice(data.is_flash_sale === 1 ? data.flash_price : data.selling_price)}
                        </Text>
                        <View style={styles.discountBlock}>
                            <Text style={styles.mrp}>{formatPrice(data.mrp)}</Text>
                            <Text style={styles.discount}>
                                {data.is_flash_sale === 1 ? data.flash_discount_percent : data.discount_percent}% OFF
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Description */}
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{data.description}</Text>

                    {/* Meta Info */}
                    <View style={styles.stockInfo}>
                        <Text style={[styles.stockStatus, data.stock > 0 ? styles.inStock : styles.outStock]}>
                            {data.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Text>
                        <Text style={styles.stockCount}>Only {data.stock} items left</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View style={styles.bottomBar}>
                <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={[styles.btnAddToCart, data.stock === 0 && styles.btnDisabled]}
                        onPress={data.stock > 0 ? onHandleAddToCart : null}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={data.stock > 0 ? ['#111827', '#374151'] : ['#E5E7EB', '#D1D5DB']}
                            style={styles.gradientBtn}
                        >
                            <Text style={[styles.btnText, data.stock === 0 && styles.btnTextDisabled]}>
                                {data.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {data.stock > 0 && (
                    <TouchableOpacity style={styles.btnBuyNow} activeOpacity={0.9} onPress={() => setIsVisible(true)}>
                        <LinearGradient
                            colors={['#6366F1', '#4F46E5']}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.btnText}>Buy Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>

            <OrderAddress isVisible={isVisible} onClose={() => setIsVisible(false)} onSubmit={HandleDirectOrder} />
        </View>
    )
}

export default ItemDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    closeBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        width: width,
        height: 400,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    content: {
        padding: 24,
        marginTop: -30,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    titleRow: {
        marginBottom: 8,
    },
    productName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1F2937',
        lineHeight: 34,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    flashBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    flashText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        marginBottom: 24,
    },
    sellingPrice: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111827',
    },
    discountBlock: {
        paddingBottom: 4,
    },
    mrp: {
        fontSize: 16,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    discount: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 24,
        marginBottom: 24,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
    },
    stockStatus: {
        fontSize: 14,
        fontWeight: '700',
    },
    inStock: {
        color: '#059669',
    },
    outStock: {
        color: '#DC2626',
    },
    stockCount: {
        fontSize: 13,
        color: '#6B7280',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 30, // Safe area
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    gradientBtn: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnAddToCart: {
        flex: 1,
        borderRadius: 16,
    },
    btnBuyNow: {
        flex: 1,
        borderRadius: 16,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    btnDisabled: {
        opacity: 0.8,
    },
    btnTextDisabled: {
        color: '#9CA3AF',
    }
})