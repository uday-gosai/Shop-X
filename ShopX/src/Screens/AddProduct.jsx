import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert, Platform, Modal, Animated, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import ProductService from '../database/ProductService';
import AppHeader from '../Components/AppHeader';
import AppInput from '../Components/AppInput';
import AppButton from '../Components/AppButton';
import { COLORS, GRADIENTS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme';
import { CATEGORIES } from '../utils/constants';
import { formatPrice } from '../utils/formatters';
import CustomDatePicker from '../Components/CustomDatePicker';

const AddProduct = ({ navigation }) => {
  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    mrp: '',
    discount_percent: '',
    stock: '',
    is_flash_sale: false,
    flash_discount_percent: '',
    flash_start_time: null,
    flash_end_time: null,
    image_uri: '',
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'

  // Update form field
  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  // Image picker
  const pickImage = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1080,
        maxHeight: 1080,
      });

      if (!res.didCancel && res.assets?.length) {
        updateField('image_uri', res.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Open date picker modal
  const openDatePicker = (mode) => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  // Confirm date selection
  const confirmDate = (selectedDate) => {
    try {
      // Check if date is in the past
      if (selectedDate < new Date()) {
        Alert.alert('Invalid Date', 'Flash sale cannot start in the past');
        return;
      }

      // If setting end date, check it's after start date
      if (datePickerMode === 'end' && form.flash_start_time) {
        if (selectedDate <= form.flash_start_time) {
          Alert.alert('Invalid Date', 'End time must be after start time');
          return;
        }
      }

      // Update the form
      if (datePickerMode === 'start') {
        updateField('flash_start_time', selectedDate);
        // If end time exists and is before new start time, clear it
        if (form.flash_end_time && form.flash_end_time <= selectedDate) {
          updateField('flash_end_time', null);
        }
      } else {
        updateField('flash_end_time', selectedDate);
      }

      setShowDatePicker(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to set date');
    }
  };

  // Calculate selling price
  const calculateSellingPrice = () => {
    const mrp = Number(form.mrp) || 0;
    const discount = Number(form.discount_percent) || 0;
    return (mrp - (mrp * discount / 100)).toFixed(2);
  };

  // Calculate flash price
  const calculateFlashPrice = () => {
    const mrp = Number(form.mrp) || 0;
    const flashDiscount = Number(form.flash_discount_percent) || 0;
    return (mrp - (mrp * flashDiscount / 100)).toFixed(2);
  };

  // Comprehensive Validation
  const validate = () => {
    const e = {};

    // Name validation
    if (!form.name.trim()) {
      e.name = 'Product name is required';
    } else if (form.name.trim().length < 3) {
      e.name = 'Name must be at least 3 characters';
    } else if (form.name.trim().length > 100) {
      e.name = 'Name is too long (max 100 characters)';
    }

    // Description validation
    if (!form.description.trim()) {
      e.description = 'Product description is required';
    } else if (form.description.trim().length < 10) {
      e.description = 'Description must be at least 10 characters';
    } else if (form.description.trim().length > 500) {
      e.description = 'Description is too long (max 500 characters)';
    }

    // Category validation
    if (!form.category) {
      e.category = 'Please select a category';
    }

    // MRP validation
    const mrp = Number(form.mrp);
    if (!form.mrp || isNaN(mrp) || mrp <= 0) {
      e.mrp = 'Enter valid MRP greater than 0';
    } else if (mrp > 1000000) {
      e.mrp = 'MRP seems too high (max ₹10,00,000)';
    }

    // Discount validation
    const discount = Number(form.discount_percent);
    if (form.discount_percent && (isNaN(discount) || discount < 0 || discount > 100)) {
      e.discount_percent = 'Discount must be 0-100%';
    }

    // Stock validation
    const stock = Number(form.stock);
    if (form.stock === '' || isNaN(stock) || stock < 0) {
      e.stock = 'Enter valid stock (0 or more)';
    } else if (stock > 100000) {
      e.stock = 'Stock seems too high (max 100,000)';
    }

    // Image validation
    if (!form.image_uri) {
      e.image = 'Product image is required';
    }

    // Flash sale validations
    if (form.is_flash_sale) {
      const flashDiscount = Number(form.flash_discount_percent);
      if (!form.flash_discount_percent || isNaN(flashDiscount) || flashDiscount <= 0 || flashDiscount > 100) {
        e.flash_discount_percent = 'Enter flash discount 1-100%';
      }

      if (!form.flash_start_time) {
        e.flash_time = 'Please select flash sale start time';
      } else if (!form.flash_end_time) {
        e.flash_time = 'Please select flash sale end time';
      } else if (form.flash_start_time >= form.flash_end_time) {
        e.flash_time = 'End time must be after start time';
      } else if (form.flash_start_time < new Date()) {
        e.flash_time = 'Start time cannot be in the past';
      }

      // Check if flash discount makes sense
      if (flashDiscount && discount && flashDiscount <= discount) {
        e.flash_discount_percent = 'Flash discount should be greater than regular discount';
      }
    }

    setErrors(e);

    // Show detailed error message
    if (Object.keys(e).length > 0) {
      const firstError = Object.values(e)[0];
      const errorCount = Object.keys(e).length;
      Alert.alert(
        '❌ Validation Failed',
        errorCount === 1
          ? firstError
          : `${errorCount} errors found. Please check all fields.\n\nFirst error: ${firstError}`,
        [{ text: 'OK' }]
      );
    }

    return Object.keys(e).length === 0;
  };

  // Save product
  const saveProduct = async () => {
    if (!validate()) {
      Alert.alert('Validation Failed', 'Please correct all errors');
      return;
    }

    try {
      await ProductService.addProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        mrp: Number(form.mrp),
        discount_percent: Number(form.discount_percent) || 0,
        stock: Number(form.stock),
        is_flash_sale: form.is_flash_sale ? 1 : 0,
        flash_discount_percent: Number(form.flash_discount_percent) || 0,
        flash_start_time: form.flash_start_time?.toISOString() || null,
        flash_end_time: form.flash_end_time?.toISOString() || null,
        image_uri: form.image_uri,
        created_at: new Date().toISOString(),
        is_active: 1,
      });

      Alert.alert(
        '✅ Success',
        'Product added successfully!',
        [{
          text: 'OK', onPress: () => {
            // Reset form
            setForm({
              name: '',
              description: '',
              category: '',
              mrp: '',
              discount_percent: '',
              stock: '',
              is_flash_sale: false,
              flash_discount_percent: '',
              flash_start_time: null,
              flash_end_time: null,
              image_uri: '',
            });
            setErrors({});
            // Optional: navigation.goBack() was here, but user asked to clear inputs
            // navigation.goBack(); 
          }
        }]
      );
    } catch (err) {
      Alert.alert('❌ Error', 'Failed to save product');
      console.error('Save error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader
          title="Add New Product"
          subtitle="Create your product listing"
          showBack={true}
          rightComponent={<View style={styles.headerEmojiContainer}><Text style={styles.headerEmoji}>🛍️</Text></View>}
        />

        {/* Basic Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLine} />
            <Text style={styles.cardTitle}>📝 Basic Information</Text>
          </View>

          <AppInput
            label="Product Name"
            icon="📦"
            value={form.name}
            error={errors.name}
            placeholder="Enter product name"
            onChangeText={v => updateField('name', v)}
          />

          <AppInput
            label="Description"
            icon="📄"
            value={form.description}
            error={errors.description}
            placeholder="Describe your product"
            multiline
            numberOfLines={3}
            onChangeText={v => updateField('description', v)}
          />

          <View style={[styles.sectionContainer, { zIndex: 1000 }]}>
            <Text style={styles.sectionLabel}>Category</Text>
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
              placeholder="Select Category"
              searchPlaceholder="Search..."
              value={form.category}
              onChange={item => {
                updateField('category', item.value);
              }}
              renderLeftIcon={() => (
                <Text style={styles.dropdownIcon}>📂</Text>
              )}
            />
            {errors.category && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errors.category}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pricing Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLine} />
            <Text style={styles.cardTitle}>💰 Pricing & Stock</Text>
          </View>

          <AppInput
            label="MRP (₹)"
            icon="💵"
            value={form.mrp}
            error={errors.mrp}
            placeholder="0.00"
            keyboardType="numeric"
            onChangeText={v => updateField('mrp', v)}
          />

          <AppInput
            label="Discount Percentage"
            icon="🏷️"
            value={form.discount_percent}
            error={errors.discount_percent}
            placeholder="0"
            keyboardType="numeric"
            onChangeText={v => updateField('discount_percent', v)}
          />

          {/* Price Preview */}
          {form.mrp && (
            <View style={styles.pricePreview}>
              <View style={styles.pricePreviewRow}>
                <Text style={styles.pricePreviewLabel}>Original Price:</Text>
                <Text style={styles.pricePreviewOriginal}>{formatPrice(form.mrp)}</Text>
              </View>
              <View style={styles.pricePreviewRow}>
                <Text style={styles.pricePreviewLabel}>Selling Price:</Text>
                <Text style={styles.pricePreviewFinal}>{formatPrice(calculateSellingPrice())}</Text>
              </View>
              {form.discount_percent > 0 && (
                <View style={styles.savingsTag}>
                  <Text style={styles.savingsText}>
                    You save {formatPrice(Number(form.mrp) - Number(calculateSellingPrice()))}
                  </Text>
                </View>
              )}
            </View>
          )}

          <AppInput
            label="Stock Quantity"
            icon="📊"
            value={form.stock}
            error={errors.stock}
            placeholder="0"
            keyboardType="numeric"
            onChangeText={v => updateField('stock', v)}
          />
        </View>

        {/* Flash Sale Card */}
        <View style={styles.card}>
          <View style={styles.flashSaleHeader}>
            <View style={styles.flashSaleHeaderLeft}>
              <Text style={styles.flashSaleIcon}>⚡</Text>
              <View>
                <Text style={styles.flashSaleTitle}>Flash Sale</Text>
                <Text style={styles.flashSaleSubtitle}>Limited time offer</Text>
              </View>
            </View>
            <Switch
              value={form.is_flash_sale}
              onValueChange={v => updateField('is_flash_sale', v)}
              trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
              thumbColor={form.is_flash_sale ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          {form.is_flash_sale && (
            <View style={styles.flashSaleContent}>
              <AppInput
                label="Flash Discount (%)"
                icon="🔥"
                value={form.flash_discount_percent}
                error={errors.flash_discount_percent}
                placeholder="0"
                keyboardType="numeric"
                onChangeText={v => updateField('flash_discount_percent', v)}
              />

              {/* Flash Price Preview */}
              {form.mrp && form.flash_discount_percent && (
                <View style={styles.flashPricePreview}>
                  <Text style={styles.flashPriceLabel}>Flash Sale Price:</Text>
                  <Text style={styles.flashPriceValue}>{formatPrice(calculateFlashPrice())}</Text>
                </View>
              )}

              {/* Date Time Selection */}
              <View style={styles.dateTimeContainer}>
                {/* Start Time Button */}
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => openDatePicker('start')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#EEF2FF', '#E0E7FF']}
                    style={styles.dateTimeGradient}
                  >
                    <Text style={styles.dateTimeIcon}>📅</Text>
                    <View style={styles.dateTimeContent}>
                      <Text style={styles.dateTimeLabel}>Start Time *</Text>
                      <Text style={[
                        styles.dateTimeValue,
                        !form.flash_start_time && styles.dateTimeValuePlaceholder
                      ]}>
                        {form.flash_start_time
                          ? form.flash_start_time.toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Select date & time'}
                      </Text>
                    </View>
                    {form.flash_start_time && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* End Time Button - Disabled until start time is set */}
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    !form.flash_start_time && styles.dateTimeButtonDisabled
                  ]}
                  onPress={() => form.flash_start_time && openDatePicker('end')}
                  activeOpacity={form.flash_start_time ? 0.7 : 1}
                  disabled={!form.flash_start_time}
                >
                  <LinearGradient
                    colors={
                      form.flash_start_time
                        ? ['#FEF2F2', '#FEE2E2']
                        : ['#F3F4F6', '#E5E7EB']
                    }
                    style={styles.dateTimeGradient}
                  >
                    <Text style={[
                      styles.dateTimeIcon,
                      !form.flash_start_time && styles.dateTimeIconDisabled
                    ]}>📅</Text>
                    <View style={styles.dateTimeContent}>
                      <Text style={[
                        styles.dateTimeLabel,
                        !form.flash_start_time && styles.dateTimeLabelDisabled
                      ]}>
                        End Time {!form.flash_start_time && '(Select start first)'}
                      </Text>
                      <Text style={[
                        styles.dateTimeValue,
                        !form.flash_end_time && styles.dateTimeValuePlaceholder,
                        !form.flash_start_time && styles.dateTimeValueDisabled
                      ]}>
                        {form.flash_end_time
                          ? form.flash_end_time.toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Select date & time'}
                      </Text>
                    </View>
                    {form.flash_end_time && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                    {!form.flash_start_time && (
                      <View style={styles.lockBadge}>
                        <Text style={styles.lockIcon}>🔒</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {errors.flash_time && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{errors.flash_time}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Image Upload Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLine} />
            <Text style={styles.cardTitle}>📸 Product Image</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.imageUploadButton,
              errors.image && styles.imageUploadButtonError
            ]}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {form.image_uri ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: form.image_uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageOverlayText}>Tap to change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imageUploadContent}>
                <Text style={styles.imageUploadIcon}>📷</Text>
                <Text style={[
                  styles.imageUploadText,
                  errors.image && styles.imageUploadTextError
                ]}>
                  {errors.image ? errors.image : 'Upload Product Image'}
                </Text>
                <Text style={styles.imageUploadHint}>Tap to select from gallery</Text>
              </View>
            )}
          </TouchableOpacity>

          {errors.image && !form.image_uri && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errors.image}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <AppButton
            title="Save Product"
            onPress={saveProduct}
            loading={false}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Custom Date Time Picker Modal */}
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={confirmDate}
        title={datePickerMode === 'start' ? '⏰ Start Time' : '⏰ End Time'}
        initialDate={datePickerMode === 'start' ? form.flash_start_time : form.flash_end_time}
      />
    </View>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollView: {
    flex: 1,
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
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING[4],
    marginTop: SPACING[4],
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING[5],
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[5],
  },
  cardHeaderLine: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  sectionContainer: {
    marginBottom: SPACING[2],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[500],
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pricePreview: {
    backgroundColor: COLORS.success + '10', // 10% opacity
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4],
    marginBottom: SPACING[5],
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  pricePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricePreviewLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
    fontWeight: '600',
  },
  pricePreviewOriginal: {
    fontSize: 15,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  pricePreviewFinal: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '800',
  },
  savingsTag: {
    backgroundColor: COLORS.success,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  savingsText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
  },
  flashSaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  flashSaleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashSaleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  flashSaleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  flashSaleSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  flashSaleContent: {
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  flashPricePreview: {
    backgroundColor: COLORS.danger + '10',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4],
    marginBottom: SPACING[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger + '40',
  },
  flashPriceLabel: {
    fontSize: 14,
    color: COLORS.gray[700],
    fontWeight: '700',
  },
  flashPriceValue: {
    fontSize: 22,
    color: COLORS.danger,
    fontWeight: '900',
  },
  dateTimeContainer: {
    marginBottom: 8,
  },
  dateTimeButton: {
    marginBottom: SPACING[4],
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  dateTimeButtonDisabled: {
    opacity: 0.5,
  },
  dateTimeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeIconDisabled: {
    opacity: 0.4,
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 10,
    color: COLORS.gray[500],
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateTimeLabelDisabled: {
    color: COLORS.gray[400],
  },
  dateTimeValue: {
    fontSize: 15,
    color: COLORS.gray[900],
    fontWeight: '700',
  },
  dateTimeValuePlaceholder: {
    color: COLORS.gray[400],
    fontWeight: '500',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  lockIcon: {
    fontSize: 12,
  },
  imageUploadButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
  },
  imageUploadButtonError: {
    borderColor: COLORS.danger,
  },
  imageUploadContent: {
    paddingVertical: SPACING[10],
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  imageUploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  imageUploadTextError: {
    color: COLORS.danger,
  },
  imageUploadHint: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  imageOverlayText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  actionContainer: {
    padding: SPACING[4],
    marginTop: SPACING[6],
  },
  saveButton: {
    borderRadius: BORDER_RADIUS.xl,
  },
  bottomSpacer: {
    height: 40,
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
  dropdownIcon: {
    marginRight: 10,
    fontSize: 18,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  }
});
;