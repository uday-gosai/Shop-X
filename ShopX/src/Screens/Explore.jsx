import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import category from '../../Assets/Data/category.json'
import AppHeader from '../Components/AppHeader'
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme'

const Explore = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <AppHeader
        title="Explore"
        subtitle="Find what you love"
        showBack={true}
      />

      <FlatList
        data={category}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CategotyWiseItem', { item: item.title })}
            style={styles.cardContainer}
          >
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Image source={{ uri: item.icon }} style={styles.itemIcon} />
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

export default Explore

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  listContent: {
    padding: SPACING[4],
    paddingTop: SPACING[6],
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: SPACING[4],
  },
  cardContainer: {
    flex: 1,
    marginBottom: SPACING[4],
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING[4],
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  itemIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  }
})