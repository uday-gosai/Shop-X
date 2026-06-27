import { FlatList, Image, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import CartService from '../database/CartService';
import UserContext from '../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import OrderAddress from '../Components/OrderAddress'
import OrderService from '../database/OrderService';
import ProductService from '../database/ProductService';
import OrderItemService from '../database/OrderItemService';
import AppHeader from '../Components/AppHeader';
import AppButton from '../Components/AppButton';
import EmptyState from '../Components/EmptyState';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme';
import { formatPrice } from '../utils/formatters';

const CartPage = ({ navigation }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalMRP, setTotalMRP] = useState(0);
    const [discountAmmount, setDiscountAmmount] = useState(0);
    const [totalAmmount, setTotalAmmount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const { userId, updateCartCount } = useContext(UserContext);

    useFocusEffect(
        useCallback(() => {
            loadCart();
        }, [])
    )

    const loadCart = async () => {
        let cartData = await CartService.getUserCart(userId);
        let Total = 0;
        let Discount = 0;
        let Final_Price = 0;

        for (const currentData of cartData) {
            if (currentData.stock < currentData.qty) {
                await CartService.UpdateQty(userId, currentData.id, currentData.stock)
                cartData = await CartService.getUserCart(userId);
            }
            else {
                Total = Total + (currentData.mrp * currentData.qty);
                Discount = Discount + ((currentData.is_flash_sale === 1 ? currentData.flash_discount_amount : currentData.discount_amount) * currentData.qty);
                Final_Price = Final_Price + ((currentData.is_flash_sale === 1 ? currentData.flash_price : currentData.selling_price) * currentData.qty)
            }
        }

        setCartItems(cartData)
        setTotalMRP(Total)
        setDiscountAmmount(Discount)
        setTotalAmmount(Final_Price)
        if (cartData) updateCartCount();
    }

    const onHandleRemoveButton = async (item) => {
        await CartService.RemoveItem(userId, item.id);
        await loadCart();
        await updateCartCount();
    }

    const IncrementItem = async (item) => {
        if (item.stock > 0 && item.qty < item.stock) {
            await CartService.incrementQty(userId, item.id);
            await loadCart();
        }
        else {
            ToastAndroid.show(`Current Available ${item.stock}`, ToastAndroid.TOP)
        }
    }

    const DecrementItem = async (item) => {
        if (item.qty > 1) {
            await CartService.decrementQty(userId, item.id);
            await loadCart();
        }
        else {
            if (item.stock == 0) {
                await CartService.UpdateQty(userId, item.id, item.stock);
                await loadCart();
                ToastAndroid.show(`Out Of Stock`, ToastAndroid.TOP)
            }
            else {
                ToastAndroid.show(`Minimum 1 Qty Compulsory`, ToastAndroid.TOP)
            }
        }
    }

    const HandleModelData = async (Value) => {
        const newCartItems = cartItems.filter(item => item.qty > 0);

        if (newCartItems.length > 0) {
            const OrderId = await OrderService.placeOrder({
                userId: userId,
                userName: Value.userName,
                mobile: Value.MobileNo,
                address: Value.Address,
                total_items: newCartItems.length,
                mrp: totalMRP,
                discount: discountAmmount,
                total_amount: totalAmmount,
                payment_mode: Value.paymentMode,
                payment_status: Value.paymentStatus
            });

            for (const orderItem of newCartItems) {
                const price = orderItem.is_flash_sale === 1
                    ? orderItem.flash_price
                    : orderItem.selling_price;

                await OrderItemService.addOrderItem(OrderId, {
                    id: orderItem.id,
                    name: orderItem.name,
                    qty: orderItem.qty,
                    mrp: orderItem.mrp,
                    price: price
                });

                await ProductService.reduceStock(orderItem.id, orderItem.qty);
                await CartService.RemoveItem(userId, orderItem.id);
            }

            await loadCart();
            await updateCartCount();
            ToastAndroid.show('Order Placed Successfully!', ToastAndroid.LONG);
            setIsVisible(false);
            navigation.goBack();
        }
    }

    const CartItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Image source={{ uri: item.image_uri }} style={styles.image} />
                <View style={styles.details}>
                    <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
                    <Text numberOfLines={1} style={styles.description}>{item.description}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.sellingPrice}>
                            {formatPrice(item.is_flash_sale === 1 ? item.flash_price : item.selling_price)}
                        </Text>
                        <Text style={styles.mrp}>{formatPrice(item.mrp)}</Text>
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>
                                {item.is_flash_sale === 1 ? item.flash_discount_percent : item.discount_percent}% OFF
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.stockText, { color: item.stock <= 10 ? COLORS.danger : COLORS.success }]}>
                        {item.stock <= 10 ? `Only ${item.stock} left!` : 'In Stock'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => DecrementItem(item)}>
                        <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => IncrementItem(item)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.removeBtn} onPress={() => onHandleRemoveButton(item)}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <View style={styles.container}>
                <AppHeader title="My Cart" showBack={true} />
                <EmptyState
                    title="Your cart is empty"
                    subtitle="Looks like you haven't added anything yet."
                    buttonTitle="Start Shopping"
                    onButtonPress={() => navigation.navigate('Homepage')}
                    icon="🛒"
                />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <AppHeader title="My Cart" subtitle={`${cartItems.length} Items`} showBack={true} />

            <FlatList
                data={cartItems}
                keyExtractor={item => item.cart_id.toString()}
                renderItem={({ item }) => <CartItem item={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.billingContainer}>
                <View style={styles.billingRow}>
                    <Text style={styles.billingLabel}>MRP Total</Text>
                    <Text style={styles.billingValue}>{formatPrice(totalMRP)}</Text>
                </View>
                <View style={[styles.billingRow, styles.discountRow]}>
                    <Text style={styles.billingLabel}>Product Discount</Text>
                    <Text style={styles.discountValue}>-{formatPrice(discountAmmount)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.billingRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>{formatPrice(totalAmmount)}</Text>
                </View>

                {discountAmmount > 0 && (
                    <View style={styles.savingsBanner}>
                        <Text style={styles.savingsText}>🎉 You are saving {formatPrice(discountAmmount)} on this order</Text>
                    </View>
                )}

                <AppButton
                    title="Place Order"
                    onPress={() => setIsVisible(true)}
                    variant="success"
                    style={styles.checkoutBtn}
                />
            </View>

            <OrderAddress isVisible={isVisible} onClose={() => setIsVisible(false)} onSubmit={HandleModelData} />
        </View>
    )
}

export default CartPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    listContent: {
        padding: SPACING[4],
        paddingBottom: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING[4],
        marginBottom: SPACING[4],
        ...SHADOWS.sm,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: SPACING[3],
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.gray[50],
        resizeMode: 'contain',
    },
    details: {
        flex: 1,
        marginLeft: SPACING[3],
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.gray[900],
        marginBottom: 2,
    },
    description: {
        fontSize: 12,
        color: COLORS.gray[500],
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sellingPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.gray[900],
    },
    mrp: {
        fontSize: 12,
        color: COLORS.gray[400],
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: COLORS.success + '15',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.xs,
    },
    discountBadgeText: {
        fontSize: 10,
        color: COLORS.success,
        fontWeight: '800',
    },
    stockText: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '700',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING[3],
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
        borderRadius: BORDER_RADIUS.md,
    },
    qtyBtn: {
        padding: 8,
        paddingHorizontal: 12,
    },
    qtyBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.gray[600],
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.gray[900],
        minWidth: 20,
        textAlign: 'center',
    },
    removeBtn: {
        padding: 8,
    },
    removeBtnText: {
        color: COLORS.danger,
        fontSize: 13,
        fontWeight: '700',
    },
    billingContainer: {
        backgroundColor: COLORS.white,
        padding: SPACING[5],
        borderTopLeftRadius: BORDER_RADIUS['3xl'],
        borderTopRightRadius: BORDER_RADIUS['3xl'],
        ...SHADOWS.lg,
    },
    billingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billingLabel: {
        color: COLORS.gray[500],
        fontSize: 14,
        fontWeight: '500',
    },
    billingValue: {
        color: COLORS.gray[900],
        fontSize: 14,
        fontWeight: '600',
    },
    discountRow: {
        marginBottom: SPACING[4],
    },
    discountValue: {
        color: COLORS.success,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray[100],
        marginBottom: SPACING[4],
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.primary,
    },
    savingsBanner: {
        backgroundColor: COLORS.success + '10',
        padding: 10,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING[4],
        marginTop: 4,
    },
    savingsText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '800',
    },
    checkoutBtn: {
        marginTop: 4,
    },
})