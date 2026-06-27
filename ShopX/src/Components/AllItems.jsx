import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import FlashSale from '../Components/FlashSale'
import CarouselComponent from '../Components/Carousel'
import ProductService from '../database/ProductService'
import { formatPrice } from '../utils/formatters'

const { width } = Dimensions.get('window')

const AllItems = ({ data, ListHeaderComponent }) => {
  const navigation = useNavigation();
  const [flashData, setFlashData] = useState([]);

  useEffect(() => {
    FlashSaleData();
  }, [])

  const FlashSaleData = async () => {
    const FlashData = await ProductService.getFlashSaleProducts();
    const currentTime = new Date();

    const validFlashSales = [];

    for (const item of FlashData) {
      const startTime = new Date(item.flash_start_time);
      const endTime = new Date(item.flash_end_time);

      if (currentTime > endTime) {
        // Sale Expired - Disable in DB
        await ProductService.disableFlashSale(item.id);
      } else if (currentTime >= startTime && currentTime <= endTime) {
        // Sale Active - Add to list
        validFlashSales.push(item);
      }
    }

    setFlashData(validFlashSales);
  }

  const carouselItem = [
    { id: '1', image: 'https://rukminim2.flixcart.com/fk-p-flap/1010/170/image/d10a877e46d1bd33.jpg?q=80' },
    { id: '2', image: 'https://rukminim2.flixcart.com/fk-p-flap/1010/170/image/8d6ea073e4f5d4c8.png?q=80' },
    { id: '3', image: 'https://rukminim2.flixcart.com/fk-p-flap/1010/170/image/66faf3950cda0b7a.png?q=80' },
    { id: '4', image: 'https://rukminim2.flixcart.com/fk-p-flap/1010/170/image/1f9c9ad24c2bc37b.jpg?q=80' }
  ]

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 }}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            {ListHeaderComponent}
            <CarouselComponent carouselItem={carouselItem} />
            <FlashSale data={flashData} onExpire={FlashSaleData} />
            <Text style={styles.sectionTitle}>Just For You</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('ItemDetails', { product: item })}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image_uri }}
                style={styles.image} />
            </View>

            <View style={styles.details}>
              <Text style={styles.title} numberOfLines={2}>{item.name}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(item.is_flash_sale === 1 ? item.flash_price : item.selling_price)}</Text>
                {item.is_flash_sale === 1 ? (
                  item.flash_discount_percent > 0 && <Text style={styles.discountBadge}>{item.flash_discount_percent}% OFF</Text>
                ) : (
                  item.discount_percent > 0 && <Text style={styles.discountBadge}>{item.discount_percent}% OFF</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )} />
    </View>
  )
}

export default AllItems

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 10,
  },

  card: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
    marginBottom: 8,
  },

  imageContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    height: 140,
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    height: 36, // Fixed height for 2 lines
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  discountBadge: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  }
})