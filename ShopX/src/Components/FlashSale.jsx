import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, Animated } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import UserContext from '../context/UserContext';
import CartService from '../database/CartService';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { formatPrice } from '../utils/formatters';

const FlashSale = ({ data, onExpire }) => {
    // If no data or empty array, HIDE the component entirely
    if (!data || data.length === 0) return null;

    const navigation = useNavigation();
    const { userId, updateCartCount } = useContext(UserContext);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const scaleAnim = useRef({});

    /*==============================TIMER LOGIC=====================================*/
    const getTargetTime = () => {
        if (data && data.length > 0) {
            // Find the latest end time among all items
            const endTimes = data.map(item => new Date(item.flash_end_time).getTime());
            return Math.max(...endTimes);
        }
        return Date.now();
    }

    const calculateTimeLeft = () => {
        const target = getTargetTime();
        const now = new Date().getTime();
        const difference = target - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            expired: false
        };
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const newTime = calculateTimeLeft();
            if (newTime.expired) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
            setTimeLeft(newTime);
        }, 1000);

        return () => clearInterval(timer);
    }, [data]);

    const animateAddToCart = (id) => {
        if (!scaleAnim.current[id]) scaleAnim.current[id] = new Animated.Value(1);
        Animated.sequence([
            Animated.timing(scaleAnim.current[id], { toValue: 1.2, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim.current[id], { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handleAddToCart = async (item) => {
        animateAddToCart(item.id);
        await CartService.addToCart(userId, item.id, 1);
        await updateCartCount();
    }

    const handlePress = (item) => {
        navigation.navigate('ItemDetails', { product: item });
    }

    // Modern Big Timer Box
    const BigTimer = () => (
        <View style={styles.timerWrapper}>
            <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{String(timeLeft.days).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>DAYS</Text>
            </View>
            <Text style={styles.separator}>:</Text>
            <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{String(timeLeft.hours).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>HRS</Text>
            </View>
            <Text style={styles.separator}>:</Text>
            <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>MINS</Text>
            </View>
            <Text style={styles.separator}>:</Text>
            <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>SECS</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header with Background Image or Gradient */}
            <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                colors={['#FF416C', '#FF4B2B']}
                style={styles.banner}
            >
                <View style={styles.bannerContent}>
                    <View>
                        <Text style={styles.bannerTitle}>FLASH SALE</Text>
                        <Text style={styles.bannerSubtitle}>Limited time offers</Text>
                    </View>
                    <BigTimer />
                </View>
            </LinearGradient>

            {/* Product List */}
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    if (!scaleAnim.current[item.id]) {
                        scaleAnim.current[item.id] = new Animated.Value(1);
                    }

                    return (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => handlePress(item)}
                        >
                            <View style={styles.card}>
                                {/* Discount Badge */}
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.flash_discount_percent}% OFF</Text>
                                </View>

                                <Image source={{ uri: item.image_uri }} style={styles.image} />

                                <View style={styles.details}>
                                    <Text numberOfLines={1} style={styles.productTitle}>{item.name}</Text>

                                    <View style={styles.priceRow}>
                                        <Text style={styles.price}>{formatPrice(item.flash_price)}</Text>
                                        <Text style={styles.oldPrice}>{formatPrice(item.mrp)}</Text>
                                    </View>

                                    {/* Add Button */}
                                    <Animated.View style={{ transform: [{ scale: scaleAnim.current[item.id] }], width: '100%' }}>
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => handleAddToCart(item)}
                                        >
                                            <Text style={styles.addButtonText}>Add to Cart</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
        </View>
    )
}

export default FlashSale

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    banner: {
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#FF4B2B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    bannerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        fontStyle: 'italic',
    },
    bannerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    timerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    timeUnit: {
        alignItems: 'center',
        minWidth: 28,
    },
    timeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        fontVariant: ['tabular-nums'],
    },
    timeLabel: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    separator: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.6)',
        marginHorizontal: 4,
        marginTop: -8, // Align with digits
    },
    listContent: {
        paddingHorizontal: 16,
    },
    card: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF4B2B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    image: {
        width: '100%',
        height: 120,
        resizeMode: 'contain',
        marginTop: 4,
    },
    details: {
        marginTop: 8,
    },
    productTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    price: {
        color: '#DC2626',
        fontWeight: '800',
        fontSize: 16,
    },
    oldPrice: {
        textDecorationLine: 'line-through',
        fontSize: 12,
        color: '#9CA3AF',
    },
    addButton: {
        backgroundColor: '#FFF1F2',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    addButtonText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '700',
    }
})