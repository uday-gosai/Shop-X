import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const Category = ({ data, onViewAll }) => {

    const navigation = useNavigation();

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Categories</Text>

                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.ViewAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Horizontal List */}
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.itemContainer}
                        onPress={() => navigation.navigate('CategotyWiseItem', { item: item.title })}
                    >
                        <View style={styles.iconWrapper}>
                            <Image style={styles.icon} source={{ uri: item.icon }} />
                        </View>
                        <Text style={styles.label}>{item.title}</Text>
                    </TouchableOpacity>
                )} />
        </View>
    )
}

export default Category

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 8,
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },

    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
    },

    ViewAll: {
        fontSize: 13,
        color: '#4f46e5', // Indigo-600
        fontWeight: '600',
    },

    list: {
        paddingHorizontal: 16,
    },

    itemContainer: {
        alignItems: 'center',
        marginRight: 16,
    },

    iconWrapper: {
        width: 64,
        height: 64,
        backgroundColor: "#fff",
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 6,
    },

    icon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },

    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        textAlign: 'center',
    }
})