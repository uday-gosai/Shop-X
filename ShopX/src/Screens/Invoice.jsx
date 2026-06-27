import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import OrderItemService from '../database/OrderItemService';
import AppHeader from '../Components/AppHeader';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme';
import { formatPrice } from '../utils/formatters';

const { width } = Dimensions.get('window');

const Invoice = ({ route, navigation }) => {
  const { orderId, username, Address, Mobile, orderDate, paymentStatus } = route.params;

  const [items, setItems] = useState([]);
  const [bill, setBill] = useState(null);

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    const data = await OrderItemService.getOrderItems(orderId);
    setItems(data);
    const invoice = calculateInvoice(data);
    setBill(invoice);
  }

  const calculateInvoice = (items) => {
    let totalMrp = 0;
    let totalSelling = 0;

    items.forEach(item => {
      totalMrp += item.mrp * item.qty;
      totalSelling += item.total;
    });

    return {
      totalMrp,
      totalDiscount: totalMrp - totalSelling,
      finalAmount: totalSelling
    };
  };

  if (!bill) return null;

  const displayDate = orderDate ? new Date(orderDate).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Receipt"
        subtitle={`Order #${orderId}`}
        showBack={true}
      />

      <View style={styles.cardContainer}>
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <View>
              <Text style={styles.brandName}>ShopX Retail</Text>
              <Text style={styles.receiptLabel}>TAX INVOICE</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>ORDER ID</Text>
              <Text style={styles.metaValue}>#{orderId}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={styles.metaValue}>{displayDate}</Text>
            </View>
          </View>

          <View style={styles.dottedLine} />

          <View style={styles.customerSection}>
            <Text style={styles.customerName}>{username}</Text>
            <Text style={styles.customerDetail}>{Address} | {Mobile}</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>ITEM</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>QTY</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>TOTAL</Text>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: SPACING[2] }}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{item.product_name}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>x{item.qty}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{formatPrice(item.total)}</Text>
              </View>
            )}
          />

          <View>
            <View style={styles.dottedLine} />
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total MRP</Text>
                <Text style={styles.summaryValue}>{formatPrice(bill.totalMrp)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>- {formatPrice(bill.totalDiscount)}</Text>
              </View>
              <View style={[styles.dottedLine, { marginVertical: SPACING[2] }]} />
              <View style={styles.summaryRow}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>{formatPrice(bill.finalAmount)}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerNote}>Thank you for shopping!</Text>
              <View style={[styles.paidBadge, { borderColor: paymentStatus === 'PAID' ? COLORS.success : COLORS.danger }]}>
                <Text style={[styles.paidText, { color: paymentStatus === 'PAID' ? COLORS.success : COLORS.danger }]}>{paymentStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.jaggedEdge}>
            {[...Array(25)].map((_, i) => (
              <View key={i} style={styles.jaggedCircle} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Invoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  cardContainer: {
    flex: 1,
    padding: SPACING[5],
    paddingBottom: SPACING[8]
  },
  receiptCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[5],
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50]
  },
  logoContainer: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  logoText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.gray[900],
  },
  receiptLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray[400],
    letterSpacing: 1.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[3],
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.gray[400],
    fontWeight: '800',
  },
  metaValue: {
    fontSize: 13,
    color: COLORS.gray[900],
    fontWeight: '700',
  },
  customerSection: {
    marginBottom: SPACING[4],
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.gray[900],
  },
  customerDetail: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    marginTop: SPACING[2],
    paddingVertical: SPACING[2],
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING[2],
    borderRadius: BORDER_RADIUS.sm
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray[500],
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  td: {
    fontSize: 13,
    color: COLORS.gray[700],
  },
  dottedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  summarySection: {
    marginTop: SPACING[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.gray[900],
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING[4],
    position: 'relative',
  },
  footerNote: {
    fontSize: 11,
    color: COLORS.gray[400],
    fontWeight: '600',
  },
  paidBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    transform: [{ rotate: '-15deg' }],
    backgroundColor: COLORS.white,
    opacity: 0.9
  },
  paidText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  jaggedEdge: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  jaggedCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray[50],
    marginHorizontal: -3,
    marginBottom: -6
  },
});