import type { ReturnReason } from '@/types/finance.types'
import type {
  Party,
  QualityCheckResult,
  RefundRecord,
  ReturnImage,
  ReturnRecord,
  ReturnStage,
  TimelineEvent,
  VendorParty,
} from '@/features/returns/types'
import { RETURN_STEPS, REFUND_STEPS, refundStepIndex, returnStepIndex } from '@/features/returns/workflow'

/**
 * Seed records for the Return & Refund workspace.
 *
 * These are UI fixtures — the workspace is explicitly local-state only, so no
 * request is made for them. The trail is derived from the record's stage rather
 * than hand-typed, so a return's dates can never contradict where it sits in the
 * workflow.
 */

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString()
}

/** Hours after the request for each step of the return trail. */
const RETURN_STEP_OFFSETS: Record<string, number> = {
  requested: 0,
  under_review: 7,
  approved: 26,
  pickup_scheduled: 44,
  picked_up: 66,
  received: 92,
  quality_check: 99,
  refund_pending: 118,
  refund_completed: 142,
}

const RETURN_STEP_NOTES: Record<string, string> = {
  pickup_scheduled: 'Pickup booked with the courier',
  picked_up: 'Collected from the customer address',
  received: 'Product received at the vendor warehouse',
  quality_check: 'Inspected against the order',
  refund_pending: 'Refund raised with the payment gateway',
  refund_completed: 'Amount credited to the customer',
}

const REFUND_STEP_OFFSETS: Record<string, number> = {
  requested: 0,
  pending_review: 5,
  approved: 18,
  processing: 30,
  completed: 52,
}

function buildReturnEvents(stage: ReturnStage, requestedAt: string, decisionNote?: string): TimelineEvent[] {
  const base = new Date(requestedAt).getTime()

  if (stage === 'rejected' || stage === 'cancelled') {
    return [
      { key: 'requested', at: new Date(base).toISOString(), note: 'Raised by the customer' },
      { key: 'under_review', at: new Date(base + 9 * HOUR).toISOString(), note: 'Picked up for review' },
      { key: stage, at: new Date(base + 27 * HOUR).toISOString(), note: decisionNote ?? null },
    ]
  }

  const index = returnStepIndex(stage)
  return RETURN_STEPS.slice(0, index + 1).map((step) => ({
    key: step.key,
    at: new Date(base + (RETURN_STEP_OFFSETS[step.key] ?? 0) * HOUR).toISOString(),
    note: RETURN_STEP_NOTES[step.key] ?? null,
  }))
}

function buildRefundEvents(stage: RefundRecord['stage'], requestedAt: string): TimelineEvent[] {
  const base = new Date(requestedAt).getTime()
  const index = refundStepIndex(stage)

  if (index === -1) {
    return [
      { key: 'requested', at: new Date(base).toISOString(), note: 'Raised against the approved return' },
      { key: 'pending_review', at: new Date(base + 5 * HOUR).toISOString(), note: 'Queued for approval' },
      { key: stage, at: new Date(base + 26 * HOUR).toISOString(), note: null },
    ]
  }

  return REFUND_STEPS.slice(0, index + 1).map((step) => ({
    key: step.key,
    at: new Date(base + (REFUND_STEP_OFFSETS[step.key] ?? 0) * HOUR).toISOString(),
    note: null,
  }))
}

// ─── People ───

const VENDORS: VendorParty[] = [
  {
    id: 'VND-2041',
    name: 'Rose Petal Emporium',
    contact: 'ops@rosepetal.in · +91 98200 11223',
    approvalStatus: 'Approved',
  },
  {
    id: 'VND-2078',
    name: 'Silk Route Designs',
    contact: 'care@silkroute.in · +91 98330 44120',
    approvalStatus: 'Approved',
  },
  {
    id: 'VND-2093',
    name: 'Kanchan Kurti House',
    contact: 'hello@kanchankurti.in · +91 98111 90210',
    approvalStatus: 'Approved',
  },
  {
    id: 'VND-2104',
    name: 'Niagara Fashion Studio',
    contact: 'studio@niagarafashion.in · +91 97400 22876',
    approvalStatus: 'Approved',
  },
]

const CUSTOMERS: Party[] = [
  {
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210',
    address: '14 Rosewood Enclave, 3rd Floor, Banjara Hills, Hyderabad 500034',
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 99201 88345',
    address: '221 Silver Oak Residency, Andheri West, Mumbai 400053',
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@example.com',
    phone: '+91 90030 55671',
    address: '8 Lotus Colony, 2nd Street, Adyar, Chennai 600020',
  },
  {
    name: 'Kavya Reddy',
    email: 'kavya.reddy@example.com',
    phone: '+91 94400 71238',
    address: 'Flat 502, Brigade Gardens, Jayanagar, Bengaluru 560041',
  },
  {
    name: 'Riya Das',
    email: 'riya.das@example.com',
    phone: '+91 98310 22456',
    address: '27 Palm Grove, Sector 21, Gurugram 122016',
  },
  {
    name: 'Sneha Pillai',
    email: 'sneha.pillai@example.com',
    phone: '+91 97410 66239',
    address: 'C-12 Palm Grove Heights, Kothrud, Pune 411038',
  },
]

// ─── Return seeds ───

interface ReturnSeed {
  handle: string
  returnId: string
  orderNumber: string
  daysAgo: number
  stage: ReturnStage
  customer: number
  vendor: number
  product: {
    name: string
    sku: string
    variant: string
    size: string
    color: string
    hue: number
    price: number
    discount: number
    tax: number
    quantity: number
  }
  reason: ReturnReason
  comments: string
  imageCount: number
  shipping: number
  refundId?: string | null
  rejectionReason?: string
  decisionNotes?: string
  quality?: QualityCheckResult
}

const RETURN_SEEDS: ReturnSeed[] = [
  {
    handle: 'ret-1042',
    returnId: 'RET-1042',
    orderNumber: 'LC-88214',
    daysAgo: 1,
    stage: 'requested',
    customer: 0,
    vendor: 0,
    product: {
      name: 'Rose Petal Anarkali Kurta',
      sku: 'RPE-ANR-104',
      variant: 'Anarkali Kurta',
      size: 'M',
      color: 'Blush Pink',
      hue: 336,
      price: 2499,
      discount: 300,
      tax: 263,
      quantity: 1,
    },
    reason: 'size_not_fit',
    comments: 'The kurta is too loose at the shoulders. Please exchange for a medium.',
    imageCount: 3,
    shipping: 79,
    refundId: null,
  },
  {
    handle: 'ret-1043',
    returnId: 'RET-1043',
    orderNumber: 'LC-88190',
    daysAgo: 2,
    stage: 'under_review',
    customer: 1,
    vendor: 1,
    product: {
      name: 'Ivory Hand-Block Saree',
      sku: 'SRD-SAR-221',
      variant: 'Hand-Block Print',
      size: 'Free Size',
      color: 'Ivory White',
      hue: 44,
      price: 3799,
      discount: 400,
      tax: 399,
      quantity: 1,
    },
    reason: 'damaged_on_arrival',
    comments: 'The pallu has a tear near the border and one corner of the blouse piece is frayed.',
    imageCount: 4,
    shipping: 99,
    refundId: null,
  },
  {
    handle: 'ret-1044',
    returnId: 'RET-1044',
    orderNumber: 'LC-88162',
    daysAgo: 3,
    stage: 'approved',
    customer: 2,
    vendor: 0,
    product: {
      name: 'Wine Red Velvet Blazer',
      sku: 'NFS-BLZ-318',
      variant: 'Tailored Blazer',
      size: 'L',
      color: 'Wine Red',
      hue: 348,
      price: 2899,
      discount: 399,
      tax: 350,
      quantity: 2,
    },
    reason: 'size_not_fit',
    comments: 'Ordered L, the shoulders are too broad. Returning both pieces.',
    imageCount: 2,
    shipping: 79,
    refundId: null,
  },
  {
    handle: 'ret-1045',
    returnId: 'RET-1045',
    orderNumber: 'LC-88140',
    daysAgo: 4,
    stage: 'pickup_scheduled',
    customer: 3,
    vendor: 2,
    product: {
      name: 'Kanchan Cotton Kurti',
      sku: 'KKH-KRT-072',
      variant: 'Straight Kurti',
      size: 'XL',
      color: 'Deep Purple',
      hue: 278,
      price: 1299,
      discount: 200,
      tax: 154,
      quantity: 1,
    },
    reason: 'defective',
    comments: 'There is a loose thread running along the side seam.',
    imageCount: 2,
    shipping: 59,
    refundId: null,
  },
  {
    handle: 'ret-1046',
    returnId: 'RET-1046',
    orderNumber: 'LC-88118',
    daysAgo: 5,
    stage: 'picked_up',
    customer: 4,
    vendor: 1,
    product: {
      name: 'Emerald Silk Dupatta',
      sku: 'SRD-DUP-146',
      variant: 'Kora Silk Dupatta',
      size: 'Free Size',
      color: 'Forest Green',
      hue: 150,
      price: 1599,
      discount: 150,
      tax: 189,
      quantity: 1,
    },
    reason: 'item_not_as_described',
    comments: 'The listing showed a lighter green shade than the one delivered.',
    imageCount: 3,
    shipping: 79,
    refundId: null,
  },
  {
    handle: 'ret-1047',
    returnId: 'RET-1047',
    orderNumber: 'LC-88095',
    daysAgo: 6,
    stage: 'received',
    customer: 5,
    vendor: 3,
    product: {
      name: 'Zari Georgette Lehenga',
      sku: 'NFS-LEH-402',
      variant: 'Lehenga Set',
      size: 'M',
      color: 'Mustard Gold',
      hue: 38,
      price: 5499,
      discount: 600,
      tax: 575,
      quantity: 1,
    },
    reason: 'wrong_item_received',
    comments: 'I ordered the mustard set but received the maroon one.',
    imageCount: 4,
    shipping: 99,
    refundId: null,
  },
  {
    handle: 'ret-1048',
    returnId: 'RET-1048',
    orderNumber: 'LC-88071',
    daysAgo: 8,
    stage: 'quality_check',
    customer: 0,
    vendor: 0,
    product: {
      name: 'Rose Petal Chikankari Top',
      sku: 'RPE-CHK-255',
      variant: 'Short Kurti',
      size: 'S',
      color: 'Powder Blue',
      hue: 205,
      price: 1799,
      discount: 250,
      tax: 217,
      quantity: 1,
    },
    reason: 'size_not_fit',
    comments: 'Fabric is lovely but the fit runs large.',
    imageCount: 2,
    shipping: 79,
    refundId: null,
    quality: {
      productCondition: 'New without tags',
      packagingCondition: 'Original packaging intact',
      tagsAvailable: false,
      productUsed: false,
      productDamaged: false,
      matchesOrder: true,
      notes: 'Fabric and stitching are intact. Brand tag was missing from the unit.',
      outcome: 'passed',
      failureReason: '',
      checkedAt: iso(-2 * DAY),
      checkedBy: 'Vendor quality desk',
    },
  },
  {
    handle: 'ret-1049',
    returnId: 'RET-1049',
    orderNumber: 'LC-88044',
    daysAgo: 9,
    stage: 'refund_pending',
    customer: 1,
    vendor: 1,
    product: {
      name: 'Temple Border Saree',
      sku: 'SRD-SAR-209',
      variant: 'Temple Border Saree',
      size: 'Free Size',
      color: 'Crimson Red',
      hue: 352,
      price: 4299,
      discount: 499,
      tax: 450,
      quantity: 1,
    },
    reason: 'damaged_on_arrival',
    comments: 'Zipper on the blouse piece was broken on arrival.',
    imageCount: 3,
    shipping: 99,
    refundId: 'REF-1121',
  },
  {
    handle: 'ret-1050',
    returnId: 'RET-1050',
    orderNumber: 'LC-88012',
    daysAgo: 11,
    stage: 'refund_pending',
    customer: 2,
    vendor: 2,
    product: {
      name: 'Block Print Palazzo',
      sku: 'KKH-PAL-134',
      variant: 'Palazzo Pant',
      size: 'M',
      color: 'Indigo Blue',
      hue: 224,
      price: 1399,
      discount: 200,
      tax: 168,
      quantity: 2,
    },
    reason: 'size_not_fit',
    comments: 'Waist is too tight on both pairs.',
    imageCount: 1,
    shipping: 59,
    refundId: 'REF-1122',
  },
  {
    handle: 'ret-1051',
    returnId: 'RET-1051',
    orderNumber: 'LC-87998',
    daysAgo: 12,
    stage: 'refund_pending',
    customer: 3,
    vendor: 3,
    product: {
      name: 'Sequin Party Gown',
      sku: 'NFS-GWN-511',
      variant: 'Maxi Gown',
      size: 'L',
      color: 'Midnight Indigo',
      hue: 240,
      price: 6299,
      discount: 800,
      tax: 659,
      quantity: 1,
    },
    reason: 'item_not_as_described',
    comments: 'The listing photos show a different neckline than the gown delivered.',
    imageCount: 4,
    shipping: 99,
    refundId: 'REF-1123',
  },
  {
    handle: 'ret-1052',
    returnId: 'RET-1052',
    orderNumber: 'LC-87960',
    daysAgo: 15,
    stage: 'refund_completed',
    customer: 4,
    vendor: 0,
    product: {
      name: 'Everyday Rayon Kurta',
      sku: 'RPE-KRT-089',
      variant: 'Rayon Kurta',
      size: 'XL',
      color: 'Mustard',
      hue: 46,
      price: 1199,
      discount: 150,
      tax: 148,
      quantity: 1,
    },
    reason: 'changed_mind',
    comments: 'Ordered by mistake, would like to return it unused.',
    imageCount: 2,
    shipping: 79,
    refundId: 'REF-1124',
  },
  {
    handle: 'ret-1053',
    returnId: 'RET-1053',
    orderNumber: 'LC-87941',
    daysAgo: 8,
    stage: 'rejected',
    customer: 5,
    vendor: 1,
    product: {
      name: 'Organza Dupatta',
      sku: 'SRD-DUP-118',
      variant: 'Organza Dupatta',
      size: 'Free Size',
      color: 'Blush Pink',
      hue: 330,
      price: 1099,
      discount: 100,
      tax: 141,
      quantity: 1,
    },
    reason: 'size_not_fit',
    comments: 'Would like to return the dupatta, it is longer than expected.',
    imageCount: 1,
    shipping: 79,
    refundId: null,
    rejectionReason: 'Product outside the return window',
    decisionNotes: 'Requested 21 days after delivery, the window closed on day 14.',
  },
  {
    handle: 'ret-1054',
    returnId: 'RET-1054',
    orderNumber: 'LC-87920',
    daysAgo: 6,
    stage: 'cancelled',
    customer: 0,
    vendor: 2,
    product: {
      name: 'Chikankari Kurta Set',
      sku: 'KKH-SET-311',
      variant: 'Kurta Set',
      size: 'M',
      color: 'Sky Blue',
      hue: 200,
      price: 2199,
      discount: 250,
      tax: 229,
      quantity: 1,
    },
    reason: 'changed_mind',
    comments: 'Requested a return but no longer need it.',
    imageCount: 0,
    shipping: 59,
    refundId: null,
    rejectionReason: 'Withdrawn by the customer',
    decisionNotes: 'Customer withdrew the request before a pickup could be booked.',
  },
  {
    handle: 'ret-1055',
    returnId: 'RET-1055',
    orderNumber: 'LC-87884',
    daysAgo: 18,
    stage: 'refund_pending',
    customer: 1,
    vendor: 3,
    product: {
      name: 'Brocade Sherwani Jacket',
      sku: 'NFS-JKT-177',
      variant: 'Sherwani Jacket',
      size: 'XL',
      color: 'Maroon',
      hue: 344,
      price: 4599,
      discount: 500,
      tax: 480,
      quantity: 1,
    },
    reason: 'defective',
    comments: 'One of the buttons was missing when it arrived.',
    imageCount: 3,
    shipping: 99,
    refundId: 'REF-1125',
  },
]

const IMAGE_LABELS = ['Front of product', 'Damage close-up', 'Packaging & tag', 'Style tag']

function buildImages(count: number, hue: number): ReturnImage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `img-${index + 1}`,
    label: IMAGE_LABELS[index % IMAGE_LABELS.length],
    hue: (hue + index * 16) % 360,
  }))
}

function buildReturns(): ReturnRecord[] {
  return RETURN_SEEDS.map((seed) => {
    const { product } = seed
    const requestedAt = iso(-seed.daysAgo * DAY)
    const gross = product.price * product.quantity
    const finalAmount = gross - product.discount + product.tax

    return {
      id: seed.handle,
      returnId: seed.returnId,
      orderId: `order-${seed.orderNumber}`,
      orderNumber: seed.orderNumber,
      orderDate: iso(-(seed.daysAgo + 9) * DAY),
      orderAmount: finalAmount + seed.shipping,
      deliveryStatus: 'Delivered',
      customer: CUSTOMERS[seed.customer],
      vendor: VENDORS[seed.vendor],
      product: { ...product, finalAmount },
      quantity: product.quantity,
      reason: seed.reason,
      comments: seed.comments,
      requestedAt,
      eligibleUntil: iso(14 * DAY - seed.daysAgo * DAY),
      refundAmount: finalAmount,
      refundId: seed.refundId ?? null,
      stage: seed.stage,
      images: buildImages(seed.imageCount, product.hue),
      events: buildReturnEvents(seed.stage, requestedAt, seed.rejectionReason),
      decision:
        seed.stage === 'approved' || seed.stage === 'rejected'
          ? {
              outcome: seed.stage === 'approved' ? 'approved' : 'rejected',
              reason: seed.rejectionReason ?? 'Approved — within the return window',
              notes: seed.decisionNotes ?? '',
              decidedAt: iso(-Math.max(seed.daysAgo - 1, 0) * DAY),
              decidedBy: 'Vendor review desk',
            }
          : null,
      qualityCheck: seed.quality ?? null,
      pickup:
        seed.stage === 'pickup_scheduled' || seed.stage === 'picked_up' || seed.stage === 'received'
          ? {
              scheduledFor: iso(1 * DAY),
              courier: 'Delhivery Surface',
              waybill: `DL${1000000 + seed.daysAgo * 137}`.slice(0, 10),
            }
          : null,
    }
  })
}

// ─── Refund seeds ───

interface RefundSeed {
  handle: string
  refundId: string
  returnHandle: string
  daysAgo: number
  stage: RefundRecord['stage']
  customer: number
  method: string
  reason: string
  returnCharges?: number
  deduction?: number
  failureReason?: string
  adminNotes?: string
  reference?: string
  transaction?: string
}

const REFUND_SEEDS: RefundSeed[] = [
  {
    handle: 'ref-1121',
    refundId: 'REF-1121',
    returnHandle: 'ret-1049',
    daysAgo: 4,
    stage: 'requested',
    customer: 1,
    method: 'UPI',
    reason: 'damaged_on_arrival',
    adminNotes: 'Refund raised after the quality check passed.',
  },
  {
    handle: 'ref-1122',
    refundId: 'REF-1122',
    returnHandle: 'ret-1050',
    daysAgo: 6,
    stage: 'approved',
    customer: 2,
    method: 'Credit / Debit Card',
    reason: 'size_not_fit',
    adminNotes: 'Approved at the full product value, return shipping was not charged.',
  },
  {
    handle: 'ref-1123',
    refundId: 'REF-1123',
    returnHandle: 'ret-1051',
    daysAgo: 8,
    stage: 'processing',
    customer: 3,
    method: 'Net Banking',
    reason: 'item_not_as_described',
    adminNotes: 'Sent to the gateway on the next settlement batch.',
    reference: 'RFD-88214-A',
    transaction: 'TXN4471902338',
  },
  {
    handle: 'ref-1124',
    refundId: 'REF-1124',
    returnHandle: 'ret-1052',
    daysAgo: 11,
    stage: 'completed',
    customer: 4,
    method: 'Wallet',
    reason: 'changed_mind',
    adminNotes: 'Credited back to the source wallet.',
    reference: 'RFD-87960-B',
    transaction: 'TXN4468331204',
  },
  {
    handle: 'ref-1125',
    refundId: 'REF-1125',
    returnHandle: 'ret-1055',
    daysAgo: 14,
    stage: 'failed',
    customer: 1,
    method: 'Credit / Debit Card',
    reason: 'defective',
    deduction: 150,
    failureReason: 'The issuing bank declined the reversal — card reported as already reversed.',
    adminNotes: 'Raised again with a lower amount after the deduction.',
    reference: 'RFD-87884-A',
  },
]

function buildRefunds(returns: ReturnRecord[]): RefundRecord[] {
  return REFUND_SEEDS.map((seed) => {
    const linked = returns.find((item) => item.id === seed.returnHandle)!
    const requestedAt = iso(-seed.daysAgo * DAY)
    const productAmount = linked.product.finalAmount - linked.product.tax
    const shipping = linked.orderAmount - linked.product.finalAmount
    const returnCharges = seed.returnCharges ?? 0
    const deduction = seed.deduction ?? 0
    const refundAmount = productAmount + linked.product.tax - deduction

    return {
      id: seed.handle,
      refundId: seed.refundId,
      returnId: linked.returnId,
      returnHandle: linked.id,
      orderId: linked.orderId,
      orderNumber: linked.orderNumber,
      customer: linked.customer,
      vendor: linked.vendor,
      productName: linked.product.name,
      productHue: linked.product.hue,
      originalOrderAmount: linked.orderAmount,
      productAmount,
      discount: linked.product.discount,
      tax: linked.product.tax,
      shipping,
      returnCharges,
      deduction,
      refundAmount,
      method: seed.method,
      reason: seed.reason,
      stage: seed.stage,
      requestedAt,
      approvedAt: ['approved', 'processing', 'completed', 'failed'].includes(seed.stage)
        ? iso(-(seed.daysAgo - 1) * DAY)
        : null,
      processedAt: ['completed'].includes(seed.stage) ? iso(-(seed.daysAgo - 2) * DAY) : null,
      refundReference: seed.reference ?? null,
      transactionReference: seed.transaction ?? null,
      adminNotes: seed.adminNotes ?? null,
      failureReason: seed.failureReason ?? null,
      events: buildRefundEvents(seed.stage, requestedAt),
    }
  })
}

export const DEMO_VENDORS = VENDORS
export const DEMO_CUSTOMERS = CUSTOMERS

export interface DemoWorkspace {
  returns: ReturnRecord[]
  refunds: RefundRecord[]
}

/** Both halves are built from one pass so a refund always points at a real return. */
export function createDemoWorkspace(): DemoWorkspace {
  const returns = buildReturns()
  return { returns, refunds: buildRefunds(returns) }
}
