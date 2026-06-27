import { FlatList, StyleSheet, View, Image, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

const { width } = Dimensions.get('window')

const Carousel = ({ carouselItem }) => {
    const flatListRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (!carouselItem || carouselItem.length === 0) return;

        const interval = setInterval(() => {
            const nextIndex =
                currentIndex === carouselItem.length - 1 ? 0 : currentIndex + 1

            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true
            })

            setCurrentIndex(nextIndex)
        }, 4000)

        return () => clearInterval(interval)
    }, [currentIndex, carouselItem])

    if (!carouselItem || carouselItem.length === 0) return null;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={carouselItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width)
                    setCurrentIndex(index)
                }}
                renderItem={({ item }) => (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                        />
                    </View>
                )}
            />

            <View style={styles.pagination}>
                {carouselItem.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index ? styles.activeDot : styles.inactiveDot
                        ]}
                    />
                ))}
            </View>
        </View>
    )
}

export default Carousel

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 8,
    },
    imageContainer: {
        width: width,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    image: {
        width: width - 32, // Padding
        height: 180,
        borderRadius: 16,
        resizeMode: 'cover',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#4c669f', // Primary
    },
    inactiveDot: {
        width: 6,
        backgroundColor: '#D1D5DB', // Gray-300
    }
})