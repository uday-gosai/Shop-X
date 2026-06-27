import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Dimensions, Switch } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import ProductService from '../database/ProductService';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomDatePicker from '../Components/CustomDatePicker';
import { Dropdown } from 'react-native-element-dropdown';
import AppHeader from '../Components/AppHeader';
import AppInput from '../Components/AppInput';
import AppButton from '../Components/AppButton';
import { COLORS, GRADIENTS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme';
import { CATEGORIES } from '../utils/constants';
import { formatPrice } from '../utils/formatters';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProductList = () => {
    const [products, setProduct] = useState([]);
    const [visible, setVisible] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Edit Form State
    const [editData, setEditData] = useState({});
    const [errors, setErrors] = useState({});

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('start');

    useFocusEffect(useCallback(() => {
        LoadProductList();
    }, [])); // Reload when edit closes to ensure fresh data

    const LoadProductList = async () => {
        const data = await ProductService.getAllProducts();
        setProduct(data);
    }

    const remove = async (id) => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await ProductService.deleteProduct(id);
                        LoadProductList();
                    }
                }
            ]
        );
    }

    const openEditModel = (item) => {
        setEditData({
            ...item,
            // Ensure numbers are handled as strings for input, or kept relative
            mrp: item.mrp.toString(),
            discount_percent: item.discount_percent.toString(),
            stock: item.stock.toString(),
            flash_discount_percent: item.flash_discount_percent ? item.flash_discount_percent.toString() : '',
            // Ensure dates are Date objects if they exist
            flash_start_time: item.flash_start_time ? new Date(item.flash_start_time) : null,
            flash_end_time: item.flash_end_time ? new Date(item.flash_end_time) : null,
            is_flash_sale: item.is_flash_sale === 1 // Convert to boolean for Switch
        });
        setErrors({});
        setVisible(true);
    }

    const openDetailsModal = (item) => {
        setSelectedProduct(item);
        setDetailsVisible(true);
    }

    const validate = () => {
        const e = {};
        const form = editData;

        if (!form.name || form.name.trim().length < 3) e.name = 'Name must be at least 3 chars';
        if (!form.description || form.description.trim().length < 10) e.description = 'Description must be at least 10 chars';
        if (!form.category) e.category = 'Category is required';

        const mrp = Number(form.mrp);
        if (!form.mrp || isNaN(mrp) || mrp <= 0) e.mrp = 'Valid MRP required';

        const discount = Number(form.discount_percent);
        if (discount < 0 || discount > 100) e.discount_percent = '0-100%';

        const stock = Number(form.stock);
        if (form.stock === '' || isNaN(stock) || stock < 0) e.stock = 'Valid stock required';

        if (form.is_flash_sale) {
            const flashDiscount = Number(form.flash_discount_percent);
            if (!flashDiscount || flashDiscount <= 0 || flashDiscount > 100) e.flash_discount_percent = '1-100%';
            if (!form.flash_start_time) e.flash_time = 'Start time required';
            if (!form.flash_end_time) e.flash_time = 'End time required';
            if (form.flash_start_time && form.flash_end_time && form.flash_start_time >= form.flash_end_time) {
                e.flash_time = 'End time must be after start time';
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const saveUpdate = async () => {
        if (!validate()) {
            Alert.alert("Validation Error", "Please fix errors before saving.");
            return;
        }

        try {
            const mrp = Number(editData.mrp);
            const discount = Number(editData.discount_percent) || 0;
            const selling_price = mrp - (mrp * discount / 100);

            const updatedProduct = {
                ...editData,
                mrp: mrp,
                discount_percent: discount,
                selling_price: selling_price.toFixed(2), // Update selling price
                stock: Number(editData.stock),
                is_flash_sale: editData.is_flash_sale ? 1 : 0,
                flash_discount_percent: Number(editData.flash_discount_percent) || 0,
                flash_start_time: editData.flash_start_time ? editData.flash_start_time.toISOString() : null,
                flash_end_time: editData.flash_end_time ? editData.flash_end_time.toISOString() : null,
            };

            await ProductService.updateProduct(editData.id, updatedProduct);
            Alert.alert("Success", "Product updated successfully");
            setVisible(false);
            LoadProductList();
        } catch (error) {
            Alert.alert("Error", "Failed to update product");
            console.error(error);
        }
    }

    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (!result.didCancel && result.assets && result.assets.length > 0) {
            setEditData({ ...editData, image_uri: result.assets[0].uri });
        }
    }

    // Date Picker Logic
    const openDatePicker = (mode) => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const confirmDate = (newDate) => {
        if (datePickerMode === 'start') {
            setEditData({ ...editData, flash_start_time: newDate });
        } else {
            setEditData({ ...editData, flash_end_time: newDate });
        }
        setShowDatePicker(false);
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openDetailsModal(item)}
            style={styles.cardContainer}
        >
            <View style={styles.card}>
                <View style={styles.cardInternal}>
                    <Image source={{ uri: item.image_uri }} style={styles.productImage} />

                    <View style={styles.productInfo}>
                        <View style={styles.productHeader}>
                            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                            {item.is_flash_sale === 1 && (
                                <View style={[styles.flashBadge, { backgroundColor: COLORS.danger }]}>
                                    <Text style={styles.flashText}>⚡ FLASH</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.productCategory}>{item.category}</Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.price} numberOfLines={1}>
                                {formatPrice(item.is_flash_sale === 1 ? item.flash_price : item.selling_price)}
                            </Text>
                            {item.mrp > item.selling_price && (
                                <Text style={styles.mrp} numberOfLines={1}>
                                    {formatPrice(item.mrp)}
                                </Text>
                            )}
                        </View>

                        <View style={styles.stockBadge}>
                            <Text style={styles.stockText}>Stock: {item.stock}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); openEditModel(item); }}
                        style={[styles.actionButton, styles.editButton]}
                    >
                        <Text style={styles.editButtonText}>✏️ Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); remove(item.id); }}
                        style={[styles.actionButton, styles.deleteButton]}
                    >
                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Inventory Empty</Text>
            <Text style={styles.emptySubtitle}>You haven't added any products yet. Click the "Add Product" tab to start your collection.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader
                title="Products"
                subtitle="Manage & View Inventory"
                showBack={false}
                rightComponent={<View style={styles.headerEmojiContainer}><Text style={styles.headerEmoji}>📦</Text></View>}
            />

            <FlatList
                data={products}
                keyExtractor={item => item.id.toString()}
                renderItem={renderProductItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[styles.listContent, products.length === 0 && { flex: 1, justifyContent: 'center' }]}
                showsVerticalScrollIndicator={false}
            />

            {/* Edit Modal */}
            <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => setVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Product</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <TouchableOpacity onPress={pickImage} style={styles.imagePicker} activeOpacity={0.8}>
                                <Image source={{ uri: editData.image_uri }} style={styles.editImage} />
                                <View style={styles.editImageOverlay}>
                                    <Text style={styles.editImageText}>📷 Change Image</Text>
                                </View>
                            </TouchableOpacity>

                            <AppInput
                                label="Product Name"
                                placeholder="Choose a name"
                                value={editData.name}
                                onChangeText={t => setEditData({ ...editData, name: t })}
                                error={errors.name}
                                icon="📦"
                            />

                            <AppInput
                                label="Description"
                                value={editData.description}
                                onChangeText={t => setEditData({ ...editData, description: t })}
                                multiline
                                error={errors.description}
                                icon="📄"
                            />

                            <View style={[styles.row, { zIndex: 1000 }]}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.dropdownLabel}>Category</Text>
                                    <Dropdown
                                        style={[styles.dropdown, errors.category && styles.dropdownError]}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        inputSearchStyle={styles.inputSearchStyle}
                                        iconStyle={styles.iconStyle}
                                        data={CATEGORIES}
                                        search
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select"
                                        searchPlaceholder="Search..."
                                        value={editData.category}
                                        onChange={item => {
                                            setEditData({ ...editData, category: item.value });
                                            setErrors({ ...errors, category: null });
                                        }}
                                    />
                                    {errors.category && <Text style={styles.errorTextSimple}>{errors.category}</Text>}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AppInput
                                        label="Stock"
                                        value={editData.stock}
                                        onChangeText={t => setEditData({ ...editData, stock: t })}
                                        keyboardType="numeric"
                                        error={errors.stock}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <AppInput
                                        label="MRP"
                                        value={editData.mrp}
                                        onChangeText={t => setEditData({ ...editData, mrp: t })}
                                        keyboardType="numeric"
                                        error={errors.mrp}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AppInput
                                        label="Discount %"
                                        value={editData.discount_percent}
                                        onChangeText={t => setEditData({ ...editData, discount_percent: t })}
                                        keyboardType="numeric"
                                        error={errors.discount_percent}
                                    />
                                </View>
                            </View>

                            {/* Flash Sale Section */}
                            <View style={styles.sectionBox}>
                                <View style={styles.switchRow}>
                                    <View>
                                        <Text style={styles.sectionTitle}>⚡ Flash Sale</Text>
                                        <Text style={styles.sectionSubtitle}>Enable limited time offer</Text>
                                    </View>
                                    <Switch
                                        value={editData.is_flash_sale}
                                        onValueChange={v => setEditData({ ...editData, is_flash_sale: v })}
                                        trackColor={{ false: '#E5E7EB', true: '#FF6B6B' }}
                                        thumbColor={editData.is_flash_sale ? '#fff' : '#f4f3f4'}
                                    />
                                </View>

                                {editData.is_flash_sale && (
                                    <View style={{ marginTop: 16 }}>
                                        <AppInput
                                            label="Flash Discount %"
                                            value={editData.flash_discount_percent}
                                            onChangeText={t => setEditData({ ...editData, flash_discount_percent: t })}
                                            keyboardType="numeric"
                                            error={errors.flash_discount_percent}
                                            icon="🔥"
                                        />

                                        <TouchableOpacity
                                            style={styles.dateBtn}
                                            onPress={() => openDatePicker('start')}
                                        >
                                            <Text style={styles.dateBtnLabel}>Starts: </Text>
                                            <Text style={styles.dateBtnValue}>
                                                {editData.flash_start_time ? editData.flash_start_time.toLocaleString() : 'Select Date'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.dateBtn, { marginTop: 8 }]}
                                            onPress={() => openDatePicker('end')}
                                        >
                                            <Text style={styles.dateBtnLabel}>Ends: </Text>
                                            <Text style={styles.dateBtnValue}>
                                                {editData.flash_end_time ? editData.flash_end_time.toLocaleString() : 'Select Date'}
                                            </Text>
                                        </TouchableOpacity>

                                        {errors.flash_time && <Text style={styles.errorTextSimple}>{errors.flash_time}</Text>}
                                    </View>
                                )}
                            </View>

                            <AppButton
                                title="Save Changes"
                                onPress={saveUpdate}
                                variant="success"
                                style={styles.saveButton}
                            />
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Custom Date Picker Modal */}
            <CustomDatePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={confirmDate}
                title={datePickerMode === 'start' ? 'Start Time' : 'End Time'}
                initialDate={datePickerMode === 'start' ? editData.flash_start_time : editData.flash_end_time}
            />

            {/* Details Modal */}
            <Modal visible={detailsVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.detailsCard}>
                        {selectedProduct && (
                            <>
                                <Image source={{ uri: selectedProduct.image_uri }} style={styles.detailsImage} />
                                <TouchableOpacity
                                    style={styles.detailsCloseBtn}
                                    onPress={() => setDetailsVisible(false)}
                                >
                                    <Text style={styles.closeButton}>✕</Text>
                                </TouchableOpacity>

                                <ScrollView style={styles.detailsContent} showsVerticalScrollIndicator={false}>
                                    <View style={styles.detailsHeaderRow}>
                                        <Text style={styles.detailsTitle}>{selectedProduct.name}</Text>
                                        <Text style={styles.detailsPrice}>{formatPrice(selectedProduct.selling_price)}</Text>
                                    </View>

                                    <View style={styles.tagRow}>
                                        <View style={styles.categoryTag}>
                                            <Text style={styles.categoryTagText}>{selectedProduct.category}</Text>
                                        </View>
                                        {selectedProduct.is_flash_sale === 1 && (
                                            <View style={[styles.flashTag, { backgroundColor: COLORS.danger }]}>
                                                <Text style={styles.flashTagText}>⚡ Flash Sale Active</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.detailsLabel}>Description</Text>
                                    <Text style={styles.detailsDescription}>{selectedProduct.description}</Text>

                                    <View style={styles.detailsStats}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statLabel}>Stock</Text>
                                            <Text style={styles.statValue}>{selectedProduct.stock}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statLabel}>MRP</Text>
                                            <Text style={styles.statValue}>{formatPrice(selectedProduct.mrp)}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statLabel}>Discount</Text>
                                            <Text style={styles.statValue}>{selectedProduct.discount_percent}%</Text>
                                        </View>
                                    </View>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default ProductList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    headerEmojiContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerEmoji: {
        fontSize: 20,
    },
    listContent: {
        padding: SPACING[4],
        paddingBottom: 100,
    },
    cardContainer: {
        marginBottom: SPACING[4],
        ...SHADOWS.md,
    },
    card: {
        borderRadius: BORDER_RADIUS['2xl'],
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        elevation:5
    },
    cardInternal: {
        flexDirection: 'row',
        padding: SPACING[3],
    },
    productImage: {
        height: 100,
        width: 100,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.gray[100],
    },
    productInfo: {
        flex: 1,
        marginLeft: SPACING[4],
        justifyContent: 'center',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.gray[900],
        flex: 1,
        marginRight: SPACING[2],
    },
    flashBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    flashText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '900',
    },
    productCategory: {
        fontSize: 13,
        color: COLORS.gray[500],
        fontWeight: '500',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    price: {
        fontSize: 17,
        fontWeight: '900',
        color: COLORS.primary,
    },
    mrp: {
        fontSize: 12,
        color: COLORS.gray[400],
        textDecorationLine: 'line-through',
        marginLeft: SPACING[2],
    },
    stockBadge: {
        backgroundColor: COLORS.success + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.md,
        alignSelf: 'flex-start',
    },
    stockText: {
        fontSize: 10,
        color: COLORS.success,
        fontWeight: '800',
    },
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    actionButton: {
        flex: 1,
        paddingVertical: SPACING[3],
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButton: {
        borderRightWidth: 1,
        borderRightColor: COLORS.gray[100],
    },
    editButtonText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    deleteButtonText: {
        color: COLORS.danger,
        fontWeight: '700',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING[5],
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS['3xl'],
        padding: SPACING[6],
        maxHeight: '90%',
        ...SHADOWS.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING[5],
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.gray[900],
    },
    closeButton: {
        fontSize: 24,
        color: COLORS.gray[400],
        fontWeight: '600',
    },
    imagePicker: {
        marginBottom: SPACING[5],
        height: 180,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        backgroundColor: COLORS.gray[100],
    },
    editImage: {
        width: '100%',
        height: '100%',
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: SPACING[2],
        alignItems: 'center',
    },
    editImageText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    saveButton: {
        marginTop: SPACING[4],
    },
    sectionBox: {
        backgroundColor: COLORS.gray[50],
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING[4],
        marginVertical: SPACING[3],
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: '800',
        fontSize: 16,
        color: COLORS.gray[900],
    },
    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.gray[500],
    },
    dateBtn: {
        backgroundColor: COLORS.white,
        padding: SPACING[3],
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    dateBtnLabel: {
        fontWeight: '600',
        color: COLORS.gray[600],
        marginRight: 8,
    },
    dateBtnValue: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    errorTextSimple: {
        color: COLORS.danger,
        fontSize: 11,
        marginTop: 4,
        fontWeight: '500',
    },
    detailsCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS['3xl'],
        overflow: 'hidden',
        maxHeight: '85%',
        ...SHADOWS.xl,
    },
    detailsImage: {
        width: '100%',
        height: 250,
    },
    detailsCloseBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: COLORS.white,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    detailsContent: {
        padding: SPACING[6],
    },
    detailsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING[4],
    },
    detailsTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.gray[900],
        flex: 1,
        marginRight: SPACING[2],
    },
    detailsPrice: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.primary,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING[5],
        gap: 8,
    },
    categoryTag: {
        backgroundColor: COLORS.gray[100],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.md,
    },
    categoryTagText: {
        color: COLORS.gray[600],
        fontWeight: '700',
        fontSize: 12,
    },
    flashTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.md,
    },
    flashTagText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 12,
    },
    detailsLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.gray[900],
        marginBottom: 4,
    },
    detailsDescription: {
        fontSize: 14,
        color: COLORS.gray[600],
        lineHeight: 20,
        marginBottom: SPACING[6],
    },
    detailsStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.gray[50],
        padding: SPACING[4],
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING[5],
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: COLORS.gray[500],
        marginBottom: 2,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.gray[900],
    },
    dropdown: {
        height: 50,
        backgroundColor: COLORS.gray[50],
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    dropdownError: {
        borderColor: COLORS.danger,
    },
    dropdownLabel: {
        fontSize: 11,
        color: COLORS.gray[500],
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    placeholderStyle: {
        fontSize: 14,
        color: COLORS.gray[400],
    },
    selectedTextStyle: {
        fontSize: 14,
        color: COLORS.gray[900],
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
        borderRadius: BORDER_RADIUS.md,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: SPACING[10],
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: SPACING[4],
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.gray[800],
        marginBottom: SPACING[2],
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.gray[500],
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
    },
})
