import type { Payment, Shipment, ShipmentStatus } from '@/features/admin/types'

const METHOD_FEES: Record<Payment['method'], number> = {
  card: 2.9,
  paypal: 3.4,
  wallet: 1.5,
  cash: 0,
}

export const payments: Payment[] = [
  { id: 'pay-401', paymentId: 'pay_9f3kQw2', orderId: 'ord-1001', orderNumber: 'LC-2841', customer: 'Isabella Moreau', method: 'card', amount: 337.15, fee: 9.78, status: 'captured', createdAt: '2026-09-07T10:24:00' },
  { id: 'pay-402', paymentId: 'pay_7hT5xP1', orderId: 'ord-1002', orderNumber: 'LC-2842', customer: 'Chloe Bennett', method: 'card', amount: 295.0, fee: 8.56, status: 'captured', createdAt: '2026-09-07T09:12:00' },
  { id: 'pay-403', paymentId: 'pay_2qN8rC3', orderId: 'ord-1003', orderNumber: 'LC-2843', customer: 'Amelie Dubois', method: 'wallet', amount: 416.0, fee: 6.24, status: 'pending', createdAt: '2026-09-06T19:40:00' },
  { id: 'pay-404', paymentId: 'pay_5bVx9L4', orderId: 'ord-1004', orderNumber: 'LC-2844', customer: 'Sofia Lindgren', method: 'card', amount: 64.0, fee: 1.86, status: 'captured', createdAt: '2026-09-06T17:05:00' },
  { id: 'pay-405', paymentId: 'pay_8mJd2Z5', orderId: 'ord-1005', orderNumber: 'LC-2845', customer: 'Priya Sharma', method: 'paypal', amount: 190.0, fee: 6.46, status: 'captured', createdAt: '2026-09-06T14:50:00' },
  { id: 'pay-406', paymentId: 'pay_3wFs7Q6', orderId: 'ord-1006', orderNumber: 'LC-2846', customer: 'Ayesha Khan', method: 'card', amount: 242.0, fee: 7.02, status: 'captured', createdAt: '2026-09-05T16:20:00' },
  { id: 'pay-407', paymentId: 'pay_6kGt4H7', orderId: 'ord-1007', orderNumber: 'LC-2847', customer: 'Hana Kim', method: 'cash', amount: 201.0, fee: 0, status: 'captured', createdAt: '2026-09-05T12:33:00' },
  { id: 'pay-408', paymentId: 'pay_9xZc1M8', orderId: 'ord-1008', orderNumber: 'LC-2848', customer: 'Camila Reyes', method: 'card', amount: 192.0, fee: 5.57, status: 'captured', createdAt: '2026-09-04T20:15:00' },
  { id: 'pay-409', paymentId: 'pay_1nYb3U9', orderId: 'ord-1009', orderNumber: 'LC-2849', customer: 'Grace Okafor', method: 'card', amount: 148.0, fee: 4.29, status: 'captured', createdAt: '2026-09-04T11:08:00' },
  { id: 'pay-410', paymentId: 'pay_4tVn6K10', orderId: 'ord-1010', orderNumber: 'LC-2850', customer: 'Emily Turner', method: 'wallet', amount: 254.0, fee: 3.81, status: 'captured', createdAt: '2026-09-03T18:44:00' },
  { id: 'pay-411', paymentId: 'pay_7pQr2E11', orderId: 'ord-1011', orderNumber: 'LC-2851', customer: 'Freya Hargreaves', method: 'card', amount: 132.0, fee: 3.83, status: 'refunded', createdAt: '2026-09-03T10:02:00' },
  { id: 'pay-412', paymentId: 'pay_2dMx5C12', orderId: 'ord-1012', orderNumber: 'LC-2852', customer: 'Nadia Hassan', method: 'paypal', amount: 172.0, fee: 5.85, status: 'captured', createdAt: '2026-09-02T15:29:00' },
  { id: 'pay-413', paymentId: 'pay_5yTp8A13', orderId: 'ord-1013', orderNumber: 'LC-2853', customer: 'Lucia Romano', method: 'card', amount: 138.0, fee: 4.0, status: 'captured', createdAt: '2026-09-02T09:47:00' },
  { id: 'pay-414', paymentId: 'pay_8wBd1F14', orderId: 'ord-1014', orderNumber: 'LC-2854', customer: 'Isabella Moreau', method: 'card', amount: 650.0, fee: 18.85, status: 'captured', createdAt: '2026-09-01T13:18:00' },
  { id: 'pay-415', paymentId: 'pay_3rJh9G15', orderId: 'ord-1015', orderNumber: 'LC-2855', customer: 'Chloe Bennett', method: 'card', amount: 165.0, fee: 4.79, status: 'captured', createdAt: '2026-09-01T08:56:00' },
  { id: 'pay-416', paymentId: 'pay_6mUg4V16', orderId: 'ord-1016', orderNumber: 'LC-2856', customer: 'Sofia Lindgren', method: 'cash', amount: 224.0, fee: 0, status: 'captured', createdAt: '2026-08-31T17:36:00' },
  { id: 'pay-417', paymentId: 'pay_9kSv7B17', orderId: 'ord-1017', orderNumber: 'LC-2857', customer: 'Priya Sharma', method: 'card', amount: 174.0, fee: 5.05, status: 'captured', createdAt: '2026-08-31T12:10:00' },
  { id: 'pay-418', paymentId: 'pay_2eHq5N18', orderId: 'ord-1018', orderNumber: 'LC-2858', customer: 'Amelie Dubois', method: 'card', amount: 128.0, fee: 3.71, status: 'captured', createdAt: '2026-08-30T19:52:00' },
  { id: 'pay-419', paymentId: 'pay_5xAq3J19', orderId: 'ord-1019', orderNumber: 'LC-2859', customer: 'Hana Kim', method: 'wallet', amount: 54.0, fee: 0.81, status: 'captured', createdAt: '2026-08-30T10:21:00' },
  { id: 'pay-420', paymentId: 'pay_8mWk6C20', orderId: 'ord-1020', orderNumber: 'LC-2860', customer: 'Ayesha Khan', method: 'card', amount: 268.0, fee: 7.77, status: 'captured', createdAt: '2026-08-29T16:03:00' },
  { id: 'pay-421', paymentId: 'pay_1zPp4L21', orderId: 'ord-1021', orderNumber: 'LC-2861', customer: 'Camila Reyes', method: 'card', amount: 484.0, fee: 14.04, status: 'captured', createdAt: '2026-08-29T09:14:00' },
  { id: 'pay-422', paymentId: 'pay_4vKd8E22', orderId: 'ord-1022', orderNumber: 'LC-2862', customer: 'Emily Turner', method: 'paypal', amount: 248.0, fee: 8.43, status: 'captured', createdAt: '2026-08-28T14:37:00' },
  { id: 'pay-423', paymentId: 'pay_7sNd1W23', orderId: 'ord-1023', orderNumber: 'LC-2863', customer: 'Grace Okafor', method: 'card', amount: 504.0, fee: 14.62, status: 'captured', createdAt: '2026-08-27T11:48:00' },
  { id: 'pay-424', paymentId: 'pay_2bHf7Q24', orderId: 'ord-1024', orderNumber: 'LC-2864', customer: 'Nadia Hassan', method: 'card', amount: 158.0, fee: 4.58, status: 'pending', createdAt: '2026-08-26T18:22:00' },
  { id: 'pay-425', paymentId: 'pay_5yTj9M25', orderId: 'ord-1025', orderNumber: 'LC-2865', customer: 'Lucia Romano', method: 'cash', amount: 112.0, fee: 0, status: 'captured', createdAt: '2026-08-25T09:57:00' },
].map((p) => ({ ...p, amount: Math.round(p.amount * 8 * 100) / 100, fee: Math.round(p.fee * 8 * 100) / 100 } as Payment))

export const shipments: Shipment[] = [
  { id: 'shp-1', shipmentId: 'SH-88413', orderId: 'ord-1004', orderNumber: 'LC-2844', carrier: 'DHL Express', trackingNumber: 'DHL99012XU', origin: 'Paris, France', destination: 'Stockholm, Sweden', status: 'in-transit', estDelivery: '2026-09-09', createdAt: '2026-09-06T18:30:00' },
  { id: 'shp-2', shipmentId: 'SH-88411', orderId: 'ord-1005', orderNumber: 'LC-2845', carrier: 'FedEx', trackingNumber: 'FX1188343321', origin: 'Los Angeles, USA', destination: 'Mumbai, India', status: 'in-transit', estDelivery: '2026-09-10', createdAt: '2026-09-06T15:22:00' },
  { id: 'shp-3', shipmentId: 'SH-88392', orderId: 'ord-1006', orderNumber: 'LC-2846', carrier: 'UPS', trackingNumber: '1ZR7E9130401', origin: 'New York, USA', destination: 'Toronto, Canada', status: 'out-for-delivery', estDelivery: '2026-09-08', createdAt: '2026-09-05T17:00:00' },
  { id: 'shp-4', shipmentId: 'SH-88391', orderId: 'ord-1007', orderNumber: 'LC-2847', carrier: 'SF Express', trackingNumber: 'SF20260905PY', origin: 'Toronto, Canada', destination: 'Seoul, South Korea', status: 'out-for-delivery', estDelivery: '2026-09-08', createdAt: '2026-09-05T13:10:00' },
  { id: 'shp-5', shipmentId: 'SH-88377', orderId: 'ord-1008', orderNumber: 'LC-2848', carrier: 'DHL Express', trackingNumber: 'DHL99184BV', origin: 'Lyon, France', destination: 'Madrid, Spain', status: 'delivered', estDelivery: '2026-09-06', createdAt: '2026-09-04T21:00:00' },
  { id: 'shp-6', shipmentId: 'SH-88376', orderId: 'ord-1009', orderNumber: 'LC-2849', carrier: 'Royal Mail', trackingNumber: 'RM881234LAG', origin: 'Paris, France', destination: 'Lagos, Nigeria', status: 'delivered', estDelivery: '2026-09-07', createdAt: '2026-09-04T12:00:00' },
  { id: 'shp-7', shipmentId: 'SH-88361', orderId: 'ord-1010', orderNumber: 'LC-2850', carrier: 'DHL Express', trackingNumber: 'DHL99071CX', origin: 'Sydney, Australia', destination: 'London, UK', status: 'delivered', estDelivery: '2026-09-05', createdAt: '2026-09-03T19:00:00' },
  { id: 'shp-8', shipmentId: 'SH-88348', orderId: 'ord-1012', orderNumber: 'LC-2852', carrier: 'Aramex', trackingNumber: 'ARX55201DXB', origin: 'Los Angeles, USA', destination: 'Dubai, UAE', status: 'delivered', estDelivery: '2026-09-05', createdAt: '2026-09-02T16:00:00' },
  { id: 'shp-9', shipmentId: 'SH-88333', orderId: 'ord-1013', orderNumber: 'LC-2853', carrier: 'UPS', trackingNumber: '1ZR7F2039912', origin: 'Milan, Italy', destination: 'Rome, Italy', status: 'delivered', estDelivery: '2026-09-04', createdAt: '2026-09-02T10:00:00' },
  { id: 'shp-10', shipmentId: 'SH-88319', orderId: 'ord-1014', orderNumber: 'LC-2854', carrier: 'FedEx', trackingNumber: 'FX1188311102', origin: 'New York, USA', destination: 'New York, USA', status: 'delivered', estDelivery: '2026-09-03', createdAt: '2026-09-01T14:00:00' },
  { id: 'shp-11', shipmentId: 'SH-88298', orderId: 'ord-1015', orderNumber: 'LC-2855', carrier: 'DHL Express', trackingNumber: 'DHL98872PK', origin: 'Paris, France', destination: 'San Francisco, USA', status: 'delivered', estDelivery: '2026-09-03', createdAt: '2026-09-01T09:30:00' },
  { id: 'shp-12', shipmentId: 'SH-88277', orderId: 'ord-1016', orderNumber: 'LC-2856', carrier: 'PostNord', trackingNumber: 'PN77381SE', origin: 'Lyon, France', destination: 'Stockholm, Sweden', status: 'delivered', estDelivery: '2026-09-02', createdAt: '2026-08-31T18:00:00' },
]

export const shipmentStatusOrder: ShipmentStatus[] = ['pending', 'in-transit', 'out-for-delivery', 'delivered', 'failed']

export { METHOD_FEES }