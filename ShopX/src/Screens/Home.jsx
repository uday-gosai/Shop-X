import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ProductService from '../database/ProductService'
import Category from '../Components/Category'
import category from '../../Assets/Data/category.json'
import AllItemsComponent from '../Components/AllItems'
import AppHeader from '../Components/AppHeader'
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme'

const Home = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState();

    useEffect(() => {
        GetActiveItem();
    }, [searchText]);

    const GetActiveItem = async () => {
        const allItems = await ProductService.getActiveProducts()

        if (searchText === '') {
            setFilteredData(allItems);
        }
        else {
            const filtered = allItems.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
            setFilteredData(filtered);
        }
    }

    return (
        <View style={styles.container}>
            <AppHeader
                title="ShopX"
                subtitle="Your Premium Store"
                showBack={false}
                rightComponent={
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Text style={styles.notificationEmoji}>🔔</Text>
                    </TouchableOpacity>
                }
            >
                <View style={styles.searchWrapper}>
                    <Image source={require('../../Assets/Icons/search.png')} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search products..."
                        placeholderTextColor={COLORS.gray[400]}
                        value={searchText}
                        onChangeText={setSearchText}
                        style={styles.searchInput}
                    />
                </View>
            </AppHeader>

            {/* Content handled by FlatList inside AllItemsComponent to avoid VirtualizedList error */}
            <AllItemsComponent
                data={filteredData}
                ListHeaderComponent={
                    <View style={styles.sectionContainer}>
                        <Category data={category} onViewAll={() => navigation.navigate('Explore')} />
                    </View>
                }
            />
        </View>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationEmoji: {
        fontSize: 20,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING[4],
        height: 50,
        ...SHADOWS.sm,
        marginTop: SPACING[2],
    },
    searchIcon: {
        width: 18,
        height: 18,
        tintColor: COLORS.gray[400],
        marginRight: SPACING[3],
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.gray[900],
        paddingVertical: 0,
    },
    sectionContainer: {
        marginTop: SPACING[4],
    }
})