export type UserRole = 'reader' | 'author' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  password?: string;
  isAuthorApproved?: boolean;
  authorBio?: string;
}

export interface Author {
  id: string;
  userId?: string;
  name: string;
  bio: string;
  photoUrl?: string;
  isCongoleseClassic?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type BookFormat = 'digital' | 'physical' | 'both';
export type BookCollection = 'classic' | 'independent';

export interface Book {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  collection: BookCollection;
  synopsis: string;
  description: string;
  priceCdf: number; // Prix en Franc Congolais (ex: 25000 CDF)
  priceUsd: number; // Équivalent USD (ex: 9.5 USD)
  format: BookFormat;
  stockPhysical: number;
  isPublished: boolean;
  coverUrl: string;
  digitalFileUrl?: string;
  likesCount: number;
  ratingAvg: number;
  ratingCount: number;
  publishedAt: string;
  isbn: string;
  pages: number;
  language: string;
  sampleExcerpt?: string;
}

export interface Like {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
}

export interface RatingReview {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  bookId: string;
  stars: number; // 1 to 5
  reviewText: string;
  createdAt: string;
}

export interface CartItem {
  bookId: string;
  title: string;
  authorName: string;
  coverUrl: string;
  format: 'digital' | 'physical';
  priceCdf: number;
  priceUsd: number;
  quantity: number;
  maxStock: number;
}

export type PaymentMethod = 'mpesa' | 'orange' | 'airtel' | 'card' | 'cod';

export interface DownloadToken {
  bookId: string;
  bookTitle: string;
  token: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  shippingCity?: string;
  items: CartItem[];
  totalCdf: number;
  totalUsd: number;
  paymentMethod: PaymentMethod;
  paymentPhone?: string;
  status: 'paid' | 'pending' | 'shipped' | 'delivered' | 'cancelled';
  digitalDownloadTokens: DownloadToken[];
  createdAt: string;
}

export interface RevenueTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  bookId: string;
  bookTitle: string;
  collection: BookCollection;
  authorId: string;
  authorName: string;
  grossAmountCdf: number;
  authorShareCdf: number; // 70% si indépendant, 0% si classique
  platformShareCdf: number; // 30% si indépendant, 100% si classique
  format: 'digital' | 'physical';
  status: 'completed' | 'refunded';
  createdAt: string;
}

export interface Payout {
  id: string;
  authorId: string;
  authorName: string;
  amountCdf: number;
  paymentMethod: 'mpesa' | 'orange' | 'airtel';
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface AuthorDashboardStats {
  author: Author;
  totalSalesCount: number;
  totalGrossCdf: number;
  totalEarnedCdf: number; // 70% earned
  pendingPayoutCdf: number;
  totalWithdrawnCdf: number;
  books: Book[];
  recentTransactions: RevenueTransaction[];
  payouts: Payout[];
}

export interface AdminDashboardStats {
  totalOrdersCount: number;
  totalGrossRevenueCdf: number;
  totalPlatformRevenueCdf: number; // 30% from indies + 100% from classics
  totalAuthorRoyaltiesCdf: number; // 70% for authors
  totalBooksCount: number;
  totalUsersCount: number;
  orders: Order[];
  recentTransactions: RevenueTransaction[];
  payoutRequests: Payout[];
  pendingAuthors: User[];
  allAuthors: Author[];
}
