import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type { 
  User, Author, Category, Book, Like, RatingReview, 
  CartItem, Order, RevenueTransaction, Payout, UserRole, PaymentMethod, DownloadToken 
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ==========================================
// 1. BASE DE DONNÉES EN MÉMOIRE PERSISTANTE
// ==========================================

const USERS: User[] = [
  {
    id: 'user_reader_1',
    name: 'Kapinga Mukendi',
    email: 'kapinga.m@mabele.cd',
    role: 'reader',
    password: 'password123',
    phone: '+243 81 234 5678',
    isAuthorApproved: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    city: 'Kinshasa (Gombe)',
    address: '14 Boulevard du 30 Juin, Résidence Fleuve'
  },
  {
    id: 'user_author_1',
    name: 'Dieudonné Kabeya',
    email: 'dieudonne.kabeya@mabele.cd',
    role: 'author',
    password: 'password123',
    phone: '+243 82 987 6543',
    isAuthorApproved: true,
    authorBio: 'Auteur indépendant basé à Lubumbashi, finaliste du Prix Makomi 2024, explorant l\'effervescence urbaine et la jeunesse congolaise.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    city: 'Lubumbashi',
    address: 'Avenue Kasavubu, Quartier Golf'
  },
  {
    id: 'user_author_pending',
    name: 'Mireille Tshimanga (En attente)',
    email: 'mireille.t@mabele.cd',
    role: 'author',
    password: 'password123',
    phone: '+243 85 111 2233',
    isAuthorApproved: false,
    authorBio: 'Romancière originaire de Bukavu, écrit sur les récits de paix des femmes des Grands Lacs.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    city: 'Goma',
    address: 'Quartier Himbi'
  },
  {
    id: 'user_admin_1',
    name: 'Administrateur Direction',
    email: 'admin',
    role: 'admin',
    password: 'admin',
    phone: '+243 89 555 0199',
    isAuthorApproved: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    city: 'Kinshasa',
    address: 'Siège Éditorial Mabele, Place des Évolués'
  }
];

// Sessions actives authentifiées : Token -> User
const SESSIONS: Record<string, User> = {};

// Helper : Récupérer l'utilisateur courant à partir du token Bearer
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : (req.headers['x-auth-token'] as string | undefined)?.trim();
  
  if (!token) return null;
  return SESSIONS[token] || null;
}

// Middleware : Authentification obligatoire
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Session non authentifiée. Veuillez vous connecter pour accéder à cette fonctionnalité.' });
  }
  (req as any).user = user;
  next();
}

// Middleware : Espace Auteur strictement réservé aux auteurs et admin
function requireAuthor(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Veuillez vous connecter pour accéder à l\'espace auteur.' });
  }
  if (user.role !== 'author' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit. Seuls les auteurs indépendants ont accès à cet espace.' });
  }
  (req as any).user = user;
  next();
}

// Middleware : Administration strictement réservée à l'administrateur
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Veuillez vous connecter en tant qu\'administrateur.' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès strictement refusé. Cet espace est réservé à la direction de Mabele Livres.' });
  }
  (req as any).user = user;
  next();
}

const AUTHORS: Author[] = [
  {
    id: 'auth_zamenga',
    name: 'Zamenga Batukezanga',
    bio: 'Monument de la littérature congolaise (1933-2000), pionnier de la vulgarisation romanesque et défenseur des valeurs africaines contemporaines.',
    isCongoleseClassic: true
  },
  {
    id: 'auth_sony',
    name: 'Sony Labou Tansi',
    bio: 'Écrivain majeur du bassin du Congo, dramaturge flamboyant et créateur d\'une langue poétique volcanique récompensée internationalement.',
    isCongoleseClassic: true
  },
  {
    id: 'auth_mudimbe',
    name: 'Valentin-Yves Mudimbe',
    bio: 'Philosophe, linguiste et essayiste congolais éminent, théoricien de "L\'Invention de l\'Afrique" et professeur émérite.',
    isCongoleseClassic: true
  },
  {
    id: 'auth_kabeya',
    userId: 'user_author_1',
    name: 'Dieudonné Kabeya',
    bio: 'Auteur indépendant basé à Lubumbashi, finaliste du Prix Makomi 2024, explorant l\'effervescence urbaine et la jeunesse congolaise.',
    isCongoleseClassic: false
  },
  {
    id: 'auth_makao',
    name: 'Eldridge Makao',
    bio: 'Conteur et gardien de la tradition orale des rives du Kasaï et du Kongo Central, auteur jeunesse et ethnographe.',
    isCongoleseClassic: false
  }
];

const CATEGORIES: Category[] = [
  { id: 'cat_romans', name: 'Romans', slug: 'romans', description: 'Grandes fresques, chroniques urbaines et récits d\'apprentissage' },
  { id: 'cat_classiques', name: 'Classiques RDC', slug: 'classiques', description: 'Le patrimoine littéraire historique de la RDC' },
  { id: 'cat_poesie', name: 'Poésie', slug: 'poesie', description: 'Vers enflammés, slam kinois et odes au fleuve' },
  { id: 'cat_essais', name: 'Essais & Pensée', slug: 'essais', description: 'Philosophie, histoire, société et économie africaine' },
  { id: 'cat_contes', name: 'Contes & Jeunesse', slug: 'contes', description: 'Traditions orales, mythes du baobab et fables illustrées' },
  { id: 'cat_polars', name: 'Polars & Nouvelles', slug: 'polars', description: 'Enquêtes nocturnes à Kinshasa et récits haletants' }
];

let BOOKS: Book[] = [
  {
    id: 'book_1',
    title: 'Au Fil du Congo : Récit d\'un Fleuve Immense',
    authorId: 'auth_zamenga',
    authorName: 'Zamenga Batukezanga',
    categoryId: 'cat_classiques',
    categoryName: 'Classiques RDC',
    collection: 'classic',
    synopsis: 'L\'odyssée intemporelle le long du fleuve majestueux, miroir des espoirs et des traditions d\'un peuple résilient.',
    description: 'Une plongée magistrale au cœur de l\'âme congolaise. Dans cette œuvre de référence, l\'auteur tisse les destins croisés des bateliers, des marchandes de Maluku et des sages des rives du fleuve Congo. Un classique essentiel pour tout amoureux des lettres africaines.',
    priceCdf: 28000,
    priceUsd: 10.0,
    format: 'both',
    stockPhysical: 14,
    isPublished: true,
    coverUrl: '/src/assets/images/book_zamenga_fleuve_1794418420056.jpg',
    digitalFileUrl: '/downloads/au-fil-du-congo.pdf',
    likesCount: 142,
    ratingAvg: 4.9,
    ratingCount: 38,
    publishedAt: '2024-01-15',
    isbn: '978-2-84129-101-2',
    pages: 284,
    language: 'Français & Lingala',
    sampleExcerpt: 'Le fleuve ne dort jamais. Dès l\'aurore, les pirogues fendent la brume dorée de Kinshasa, emportant avec elles les prières et les chants de ceux qui font battre le cœur de cette terre généreuse...'
  },
  {
    id: 'book_2',
    title: 'Les Souffles du Fleuve : La Nuit Kinoise',
    authorId: 'auth_kabeya',
    authorName: 'Dieudonné Kabeya',
    categoryId: 'cat_romans',
    categoryName: 'Romans',
    collection: 'independent',
    synopsis: 'La rumba, les ruelles de Matonge et les rêves d\'une jeunesse vibrante en quête de lumière.',
    description: 'À travers le regard de Mbuyi, un jeune saxophoniste de Bandalungwa, ce roman capture l\'intensité foudroyante de la métropole congolaise. Entre rumba mélancolique, amours clandestines et détermination d\'acier, ce chef-d\'œuvre indépendant a conquis la critique.',
    priceCdf: 22000,
    priceUsd: 8.0,
    format: 'both',
    stockPhysical: 8,
    isPublished: true,
    coverUrl: '/src/assets/images/book_sony_labou_1794418421377.jpg',
    digitalFileUrl: '/downloads/les-souffles-du-fleuve.epub',
    likesCount: 96,
    ratingAvg: 4.8,
    ratingCount: 24,
    publishedAt: '2024-03-20',
    isbn: '978-2-95712-404-5',
    pages: 220,
    language: 'Français',
    sampleExcerpt: 'À 22 heures, Matonge s\'embrase. Les amplificateurs crachent les accords entêtants de la rumba, et dans la moiteur du soir, les regards se cherchent et s\'enflamment...'
  },
  {
    id: 'book_3',
    title: 'The Silent Migration : L\'Odyssée de la Conscience',
    authorId: 'auth_mudimbe',
    authorName: 'Valentin-Yves Mudimbe',
    categoryId: 'cat_essais',
    categoryName: 'Essais & Pensée',
    collection: 'classic',
    synopsis: 'Une méditation philosophique profonde sur l\'identité africaine, les mémoires décoloniales et l\'altérité.',
    description: 'Ouvrage d\'une rigueur intellectuelle éblouissante, où l\'auteur interroge les représentations et discours occidentaux sur l\'Afrique, pour ouvrir une voie émancipatrice ancrée dans la souveraineté épistémologique du continent.',
    priceCdf: 35000,
    priceUsd: 12.5,
    format: 'digital',
    stockPhysical: 0,
    isPublished: true,
    coverUrl: '/src/assets/images/book_mudimbe_ode_1794418421719.jpg',
    digitalFileUrl: '/downloads/silent-migration.pdf',
    likesCount: 68,
    ratingAvg: 4.95,
    ratingCount: 19,
    publishedAt: '2023-11-05',
    isbn: '978-2-7087-0832-1',
    pages: 360,
    language: 'Français',
    sampleExcerpt: 'Comprendre l\'homme africain ne saurait se faire par procuration conceptuelle. Il convient de déconstruire patiemment les mythes fabriqués pour entendre la voix vive du sujet pensant...'
  },
  {
    id: 'book_4',
    title: 'The Tales of the Baobab Tree : Sagesses de la Nuit',
    authorId: 'auth_makao',
    authorName: 'Eldridge Makao',
    categoryId: 'cat_contes',
    categoryName: 'Contes & Jeunesse',
    collection: 'independent',
    synopsis: 'Contes et fables transmises au coin du feu sous les constellations du Kasaï pour petits et grands.',
    description: 'Recueil enchanteur illustré à la main qui restitue la malice du lièvre, la force tranquille de l\'éléphant et les énigmes des ancêtres. Accompagné d\'un lexique enrichi en Tshiluba et Swahili.',
    priceCdf: 18000,
    priceUsd: 6.5,
    format: 'both',
    stockPhysical: 25,
    isPublished: true,
    coverUrl: '/src/assets/images/book_conte_kongo_1794418422862.jpg',
    digitalFileUrl: '/downloads/tales-baobab-tree.pdf',
    likesCount: 115,
    ratingAvg: 4.75,
    ratingCount: 31,
    publishedAt: '2024-02-10',
    isbn: '978-2-33418-092-8',
    pages: 144,
    language: 'Français (avec lexique Tshiluba & Lingala)',
    sampleExcerpt: 'Quand le soleil plonge derrière la cime des palmiers, grand-mère Kapinga rassemble les braises. "Ouvrez grand vos oreilles," dit-elle, "car le baobab a un secret à vous confier..."'
  },
  {
    id: 'book_5',
    title: 'La Parenthèse de Sang & Autres Pièces',
    authorId: 'auth_sony',
    authorName: 'Sony Labou Tansi',
    categoryId: 'cat_classiques',
    categoryName: 'Classiques RDC',
    collection: 'classic',
    synopsis: 'Théâtre flamboyant et féroce dénonçant les dérives du pouvoir avec une poésie tellurique.',
    description: 'Une pièce majeure qui dynamite les conventions dramaturgiques. Sony Labou Tansi y déploie une énergie vitale foudroyante qui transcende la tragédie politique en festin de mots et d\'humanité.',
    priceCdf: 25000,
    priceUsd: 9.0,
    format: 'physical',
    stockPhysical: 5,
    isPublished: true,
    coverUrl: '/src/assets/images/book_sony_labou_1794418421377.jpg',
    likesCount: 84,
    ratingAvg: 4.9,
    ratingCount: 16,
    publishedAt: '2023-09-18',
    isbn: '978-2-02005-772-1',
    pages: 192,
    language: 'Français',
    sampleExcerpt: 'Moi qui vous parle avec la gorge des fleuves révoltés, je refuse de me taire pendant que la terre gémit sous le poids des orgueils dérisoires...'
  }
];

let LIKES: Like[] = [
  { id: 'like_1', userId: 'user_reader_1', bookId: 'book_1', createdAt: '2024-04-01T10:00:00Z' },
  { id: 'like_2', userId: 'user_reader_1', bookId: 'book_2', createdAt: '2024-04-02T15:30:00Z' }
];

let RATINGS: RatingReview[] = [
  {
    id: 'rev_1',
    userId: 'user_reader_1',
    userName: 'Kapinga Mukendi',
    userRole: 'reader',
    bookId: 'book_1',
    stars: 5,
    reviewText: 'Une œuvre intemporelle qui me rappelle mon enfance à Kisangani. Le style de Zamenga est d\'une limpidité bouleversante.',
    createdAt: '2024-04-05T14:20:00Z'
  },
  {
    id: 'rev_2',
    userId: 'user_reader_1',
    userName: 'Kapinga Mukendi',
    userRole: 'reader',
    bookId: 'book_2',
    stars: 5,
    reviewText: 'Dieudonné Kabeya capture le vrai pouls de Kinshasa avec un talent rare. Vivement son prochain roman !',
    createdAt: '2024-04-08T19:45:00Z'
  },
  {
    id: 'rev_3',
    userId: 'user_author_1',
    userName: 'Dieudonné Kabeya',
    userRole: 'author',
    bookId: 'book_3',
    stars: 5,
    reviewText: 'Un essai fondateur pour tout créateur et intellectuel africain. Mudimbe reste un phare irremplaçable.',
    createdAt: '2024-03-12T11:00:00Z'
  }
];

// Paniers par utilisateur
const CARTS: Record<string, CartItem[]> = {};

let ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 'MBL-2024-0891',
    userId: 'user_reader_1',
    customerName: 'Kapinga Mukendi',
    customerEmail: 'kapinga.m@mabele.cd',
    customerPhone: '+243 81 234 5678',
    shippingCity: 'Kinshasa (Gombe)',
    shippingAddress: '14 Boulevard du 30 Juin',
    items: [
      {
        bookId: 'book_2',
        title: 'Les Souffles du Fleuve : La Nuit Kinoise',
        authorName: 'Dieudonné Kabeya',
        coverUrl: '/src/assets/images/book_sony_labou_1794418421377.jpg',
        format: 'digital',
        priceCdf: 22000,
        priceUsd: 8.0,
        quantity: 1,
        maxStock: 100
      }
    ],
    totalCdf: 22000,
    totalUsd: 8.0,
    paymentMethod: 'mpesa',
    paymentPhone: '+243 81 234 5678',
    status: 'paid',
    digitalDownloadTokens: [
      {
        bookId: 'book_2',
        bookTitle: 'Les Souffles du Fleuve : La Nuit Kinoise',
        token: 'token_sec_991823ab',
        expiresAt: '2026-12-31T23:59:59Z',
        downloadCount: 2,
        maxDownloads: 5
      }
    ],
    createdAt: '2024-04-10T09:12:00Z'
  }
];

let TRANSACTIONS: RevenueTransaction[] = [
  {
    id: 'tx_1001',
    orderId: 'ord_1001',
    orderNumber: 'MBL-2024-0891',
    bookId: 'book_2',
    bookTitle: 'Les Souffles du Fleuve : La Nuit Kinoise',
    collection: 'independent',
    authorId: 'auth_kabeya',
    authorName: 'Dieudonné Kabeya',
    grossAmountCdf: 22000,
    authorShareCdf: 15400, // 70% de 22000
    platformShareCdf: 6600, // 30% de 22000
    format: 'digital',
    status: 'completed',
    createdAt: '2024-04-10T09:12:00Z'
  }
];

let PAYOUTS: Payout[] = [
  {
    id: 'pay_001',
    authorId: 'auth_kabeya',
    authorName: 'Dieudonné Kabeya',
    amountCdf: 50000,
    paymentMethod: 'mpesa',
    phoneNumber: '+243 82 987 6543',
    status: 'approved',
    requestedAt: '2024-03-25T14:00:00Z',
    processedAt: '2024-03-26T10:15:00Z'
  }
];

// Helper pour recalculer la moyenne d'un livre
function recalculateBookRating(bookId: string) {
  const reviews = RATINGS.filter(r => r.bookId === bookId);
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  if (reviews.length === 0) {
    book.ratingAvg = 5.0;
    book.ratingCount = 0;
  } else {
    const sum = reviews.reduce((acc, curr) => acc + curr.stars, 0);
    book.ratingAvg = Math.round((sum / reviews.length) * 10) / 10;
    book.ratingCount = reviews.length;
  }
}

// ==========================================
// 2. ENDPOINTS AUTHENTIFICATION & SÉCURITÉ
// ==========================================

// Récupérer la session active via le Bearer Token
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  res.json({ user });
});

// Connexion sécurisée
app.post('/api/auth/login', (req, res) => {
  const { identifier, email, password } = req.body;
  const loginId = (identifier || email || '').trim();
  const pass = (password || '').trim();

  if (!loginId || !pass) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
  }

  // Vérification de l'administrateur par défaut (admin / admin)
  if ((loginId.toLowerCase() === 'admin' || loginId.toLowerCase() === 'admin@mabele.cd') && pass === 'admin') {
    const adminUser = USERS.find(u => u.role === 'admin') || USERS[3];
    const token = `mbl_token_admin_${Date.now()}`;
    SESSIONS[token] = adminUser;
    return res.json({ 
      success: true, 
      token, 
      user: adminUser, 
      message: 'Connexion Administrateur réussie. Bienvenue dans la console de direction.' 
    });
  }

  // Recherche d'un utilisateur par email ou nom
  const user = USERS.find(u => 
    u.email.toLowerCase() === loginId.toLowerCase() || 
    u.name.toLowerCase() === loginId.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: 'Compte introuvable. Veuillez vérifier vos identifiants ou vous inscrire.' });
  }

  if (user.password && user.password !== pass) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  const token = `mbl_token_${user.id}_${Date.now()}`;
  SESSIONS[token] = user;
  res.json({ success: true, token, user });
});

// Inscription sécurisée
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, phone, authorBio, city, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe sont obligatoires.' });
  }

  const existing = USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  const targetRole: UserRole = role === 'author' ? 'author' : 'reader';
  // RÈGLE MÉTIER : Un auteur doit être validé par l'admin avant de pouvoir publier
  const isApproved = targetRole === 'reader'; // Le lecteur est validé d'office, l'auteur démarre en attente

  const newUser: User = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: targetRole,
    phone: phone || '',
    isAuthorApproved: isApproved,
    authorBio: authorBio || '',
    city: city || 'Kinshasa',
    address: address || '',
    avatar: targetRole === 'author' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : undefined
  };

  USERS.push(newUser);

  // Si c'est un auteur, on l'ajoute également à la table AUTHORS
  if (targetRole === 'author') {
    AUTHORS.push({
      id: `auth_${newUser.id}`,
      userId: newUser.id,
      name: newUser.name,
      bio: authorBio || 'Auteur indépendant de la République Démocratique du Congo.',
      isCongoleseClassic: false
    });
  }

  const token = `mbl_token_${newUser.id}_${Date.now()}`;
  SESSIONS[token] = newUser;

  res.status(201).json({
    success: true,
    token,
    user: newUser,
    pendingApproval: !isApproved,
    message: targetRole === 'author'
      ? 'Compte auteur créé ! Il est actuellement en attente de validation par la direction pour activer la publication d\'ouvrages.'
      : 'Compte lecteur créé avec succès !'
  });
});

// Déconnexion sécurisée
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : (req.headers['x-auth-token'] as string | undefined)?.trim();

  if (token && SESSIONS[token]) {
    delete SESSIONS[token];
  }
  res.json({ success: true, message: 'Déconnexion effectuée.' });
});

// ==========================================
// 3. CATALOGUE & LIVRES (CRUD)
// ==========================================
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES);
});

app.get('/api/authors', (req, res) => {
  res.json(AUTHORS);
});

app.get('/api/books', (req, res) => {
  const { q, category, collection, format, author, sort } = req.query;

  let filtered = [...BOOKS];

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    filtered = filtered.filter(b => 
      b.title.toLowerCase().includes(query) ||
      b.authorName.toLowerCase().includes(query) ||
      b.synopsis.toLowerCase().includes(query) ||
      b.categoryName.toLowerCase().includes(query)
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter(b => b.categoryId === category || b.categoryName.toLowerCase() === category.toLowerCase());
  }

  if (collection && typeof collection === 'string' && collection !== 'all') {
    filtered = filtered.filter(b => b.collection === collection);
  }

  if (format && typeof format === 'string' && format !== 'all') {
    filtered = filtered.filter(b => b.format === format || b.format === 'both');
  }

  if (author && typeof author === 'string') {
    filtered = filtered.filter(b => b.authorId === author);
  }

  // Tri
  if (sort === 'popularity') {
    filtered.sort((a, b) => b.likesCount - a.likesCount);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.ratingAvg - a.ratingAvg);
  } else if (sort === 'price_asc') {
    filtered.sort((a, b) => a.priceCdf - b.priceCdf);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.priceCdf - a.priceCdf);
  } else {
    // Par défaut : plus récents
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  res.json(filtered);
});

app.get('/api/books/:id', (req, res) => {
  const book = BOOKS.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

  const user = getAuthUser(req);
  const isLiked = user ? LIKES.some(l => l.userId === user.id && l.bookId === book.id) : false;
  const userRating = user ? RATINGS.find(r => r.userId === user.id && r.bookId === book.id) : null;
  const bookReviews = RATINGS.filter(r => r.bookId === book.id);

  res.json({
    book,
    isLiked,
    userRating: userRating ? userRating.stars : null,
    reviews: bookReviews
  });
});

// Publication de livre : Seuls les auteurs validés ou admin peuvent publier
app.post('/api/books', requireAuth, (req, res) => {
  const user = (req as any).user as User;

  if (user.role !== 'author' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission refusée. Seuls les auteurs et administrateurs peuvent publier.' });
  }

  // RÈGLE : L'auteur doit obligatoirement être validé par l'admin pour publier
  if (user.role === 'author' && !user.isAuthorApproved) {
    return res.status(403).json({ 
      error: 'Votre compte auteur est actuellement en attente de validation par la direction. Vous pourrez publier vos ouvrages dès son approbation.' 
    });
  }

  const { title, synopsis, description, categoryId, collection, format, priceCdf, coverUrl, sampleExcerpt } = req.body;

  if (!title || !priceCdf) {
    return res.status(400).json({ error: 'Titre et prix sont requis.' });
  }

  const authorName = user.name;
  const authorRecord = AUTHORS.find(a => a.userId === user.id);
  const authorId = user.role === 'author' ? (authorRecord?.id || `auth_${user.id}`) : 'auth_zamenga';
  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

  const newBook: Book = {
    id: `book_${Date.now()}`,
    title,
    authorId,
    authorName,
    categoryId: category.id,
    categoryName: category.name,
    collection: user.role === 'admin' ? (collection || 'classic') : 'independent',
    synopsis: synopsis || title,
    description: description || synopsis || '',
    priceCdf: Number(priceCdf),
    priceUsd: Math.round((Number(priceCdf) / 2800) * 10) / 10,
    format: format || 'both',
    stockPhysical: format === 'digital' ? 0 : 20,
    isPublished: true,
    coverUrl: coverUrl || '/src/assets/images/book_sony_labou_1794418421377.jpg',
    digitalFileUrl: `/downloads/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
    likesCount: 1,
    ratingAvg: 5.0,
    ratingCount: 1,
    publishedAt: new Date().toISOString().split('T')[0],
    isbn: `978-2-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}`,
    pages: 180,
    language: 'Français',
    sampleExcerpt: sampleExcerpt || 'Début de l\'ouvrage bientôt disponible en lecture intégrale.'
  };

  BOOKS.unshift(newBook);
  res.status(201).json(newBook);
});

// --- LIKES (Découplé des Notations) ---
app.post('/api/books/:id/like', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const bookId = req.params.id;
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Livre introuvable' });

  const existingIndex = LIKES.findIndex(l => l.userId === user.id && l.bookId === bookId);

  if (existingIndex >= 0) {
    LIKES.splice(existingIndex, 1);
    book.likesCount = Math.max(0, book.likesCount - 1);
    return res.json({ liked: false, likesCount: book.likesCount });
  } else {
    LIKES.push({
      id: `like_${Date.now()}`,
      userId: user.id,
      bookId,
      createdAt: new Date().toISOString()
    });
    book.likesCount += 1;
    return res.json({ liked: true, likesCount: book.likesCount });
  }
});

// --- NOTATIONS & AVIS (1 à 5 Étoiles) ---
app.get('/api/books/:id/reviews', (req, res) => {
  const reviews = RATINGS.filter(r => r.bookId === req.params.id);
  res.json(reviews);
});

app.post('/api/books/:id/rate', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const bookId = req.params.id;
  const { stars, reviewText } = req.body;
  const numericStars = Number(stars);

  if (!numericStars || numericStars < 1 || numericStars > 5) {
    return res.status(400).json({ error: 'La note doit être comprise entre 1 et 5 étoiles.' });
  }

  const existingIndex = RATINGS.findIndex(r => r.userId === user.id && r.bookId === bookId);

  if (existingIndex >= 0) {
    RATINGS[existingIndex].stars = numericStars;
    if (reviewText) RATINGS[existingIndex].reviewText = reviewText;
    RATINGS[existingIndex].createdAt = new Date().toISOString();
  } else {
    RATINGS.push({
      id: `rev_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      bookId,
      stars: numericStars,
      reviewText: reviewText || 'Lecture remarquable recommandée à tous les passionnés de littérature congolaise.',
      createdAt: new Date().toISOString()
    });
  }

  recalculateBookRating(bookId);
  const updatedBook = BOOKS.find(b => b.id === bookId);

  res.json({
    success: true,
    ratingAvg: updatedBook?.ratingAvg,
    ratingCount: updatedBook?.ratingCount,
    reviews: RATINGS.filter(r => r.bookId === bookId)
  });
});

// --- PANIER (Gestion Persistante & Règle 1 Ex Numérique) ---
app.get('/api/cart', (req, res) => {
  const user = getAuthUser(req);
  const cartKey = user ? user.id : 'guest_session';
  const items = CARTS[cartKey] || [];
  const totalCdf = items.reduce((sum, item) => sum + item.priceCdf * item.quantity, 0);
  const totalUsd = Math.round((totalCdf / 2800) * 10) / 10;
  res.json({ items, totalCdf, totalUsd });
});

app.post('/api/cart/items', (req, res) => {
  const user = getAuthUser(req);
  const cartKey = user ? user.id : 'guest_session';

  const { bookId, format, quantity } = req.body;
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Livre introuvable' });

  if (!CARTS[cartKey]) {
    CARTS[cartKey] = [];
  }

  const userCart = CARTS[cartKey];
  const targetFormat = format || (book.format === 'digital' ? 'digital' : 'physical');
  const existingItem = userCart.find(i => i.bookId === bookId && i.format === targetFormat);

  if (targetFormat === 'digital') {
    // Règle d'or : le numérique est strictement limité à 1 exemplaire
    if (!existingItem) {
      userCart.push({
        bookId: book.id,
        title: book.title,
        authorName: book.authorName,
        coverUrl: book.coverUrl,
        format: 'digital',
        priceCdf: book.priceCdf,
        priceUsd: book.priceUsd,
        quantity: 1,
        maxStock: 999
      });
    }
  } else {
    const qtyToAdd = quantity ? Number(quantity) : 1;
    if (existingItem) {
      existingItem.quantity = Math.min(book.stockPhysical, existingItem.quantity + qtyToAdd);
    } else {
      userCart.push({
        bookId: book.id,
        title: book.title,
        authorName: book.authorName,
        coverUrl: book.coverUrl,
        format: 'physical',
        priceCdf: book.priceCdf,
        priceUsd: book.priceUsd,
        quantity: Math.min(book.stockPhysical, Math.max(1, qtyToAdd)),
        maxStock: book.stockPhysical
      });
    }
  }

  const totalCdf = userCart.reduce((sum, item) => sum + item.priceCdf * item.quantity, 0);
  res.json({ success: true, items: userCart, totalCdf });
});

app.patch('/api/cart/items/:bookId', (req, res) => {
  const user = getAuthUser(req);
  const cartKey = user ? user.id : 'guest_session';
  const { format, quantity } = req.body;
  const userCart = CARTS[cartKey] || [];
  const item = userCart.find(i => i.bookId === req.params.bookId && i.format === format);

  if (!item) return res.status(404).json({ error: 'Article non trouvé dans le panier' });

  if (item.format === 'digital') {
    item.quantity = 1;
  } else {
    const newQty = Math.max(1, Math.min(item.maxStock, Number(quantity)));
    item.quantity = newQty;
  }

  const totalCdf = userCart.reduce((sum, item) => sum + item.priceCdf * item.quantity, 0);
  res.json({ success: true, items: userCart, totalCdf });
});

app.delete('/api/cart/items/:bookId', (req, res) => {
  const user = getAuthUser(req);
  const cartKey = user ? user.id : 'guest_session';
  const { format } = req.query;
  let userCart = CARTS[cartKey] || [];

  if (format) {
    userCart = userCart.filter(i => !(i.bookId === req.params.bookId && i.format === format));
  } else {
    userCart = userCart.filter(i => i.bookId !== req.params.bookId);
  }

  CARTS[cartKey] = userCart;
  const totalCdf = userCart.reduce((sum, item) => sum + item.priceCdf * item.quantity, 0);
  res.json({ success: true, items: userCart, totalCdf });
});

app.delete('/api/cart', (req, res) => {
  const user = getAuthUser(req);
  const cartKey = user ? user.id : 'guest_session';
  CARTS[cartKey] = [];
  res.json({ success: true, items: [], totalCdf: 0 });
});

// --- COMMANDES & PAIEMENT (M-Pesa / Orange / Airtel & Répartition 70/30) ---
app.post('/api/payments/simulate-ussd', (req, res) => {
  const { method, phone, amountCdf } = req.body;
  res.json({
    status: 'prompt_sent',
    message: `Une invite de paiement sécurisée ${String(method).toUpperCase()} de ${amountCdf} CDF a été transmise au ${phone}. Veuillez entrer votre code PIN sur votre téléphone pour valider.`,
    referenceCode: `USSD-${Date.now().toString().slice(-6)}`
  });
});

app.post('/api/orders', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { paymentMethod, paymentPhone, shippingAddress, shippingCity } = req.body;
  const userCart = CARTS[user.id] || [];

  if (userCart.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide.' });
  }

  const totalCdf = userCart.reduce((sum, item) => sum + item.priceCdf * item.quantity, 0);
  const totalUsd = Math.round((totalCdf / 2800) * 10) / 10;
  const orderId = `ord_${Date.now()}`;
  const orderNumber = `MBL-2024-${Math.floor(1000 + Math.random() * 9000)}`;

  const downloadTokens: DownloadToken[] = [];
  userCart.forEach(item => {
    if (item.format === 'digital') {
      downloadTokens.push({
        bookId: item.bookId,
        bookTitle: item.title,
        token: `token_sec_${Math.random().toString(36).substring(2, 10)}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        downloadCount: 0,
        maxDownloads: 5
      });
    }

    if (item.format === 'physical') {
      const book = BOOKS.find(b => b.id === item.bookId);
      if (book) {
        book.stockPhysical = Math.max(0, book.stockPhysical - item.quantity);
      }
    }

    // Répartition automatique : 70% Auteur indépendant / 100% Plateforme pour les classiques
    const book = BOOKS.find(b => b.id === item.bookId);
    const isIndie = book?.collection === 'independent';
    const itemTotal = item.priceCdf * item.quantity;
    const authorShare = isIndie ? Math.round(itemTotal * 0.70) : 0;
    const platformShare = isIndie ? Math.round(itemTotal * 0.30) : itemTotal;

    TRANSACTIONS.push({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      orderNumber,
      bookId: item.bookId,
      bookTitle: item.title,
      collection: book?.collection || 'independent',
      authorId: book?.authorId || 'auth_indie',
      authorName: item.authorName,
      grossAmountCdf: itemTotal,
      authorShareCdf: authorShare,
      platformShareCdf: platformShare,
      format: item.format,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  });

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: paymentPhone || user.phone || '+243 81 000 0000',
    shippingAddress: shippingAddress || user.address,
    shippingCity: shippingCity || user.city,
    items: [...userCart],
    totalCdf,
    totalUsd,
    paymentMethod: paymentMethod || 'mpesa',
    paymentPhone: paymentPhone || user.phone,
    status: 'paid',
    digitalDownloadTokens: downloadTokens,
    createdAt: new Date().toISOString()
  };

  ORDERS.unshift(newOrder);
  CARTS[user.id] = [];

  res.status(201).json({
    success: true,
    order: newOrder
  });
});

// Liste des commandes de l'utilisateur connecté uniquement
app.get('/api/orders', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const userOrders = ORDERS.filter(o => o.userId === user.id);
  res.json(userOrders);
});

// Lien de téléchargement sécurisé du fichier numérique
app.get('/api/orders/:orderId/download/:token', (req, res) => {
  const { orderId, token } = req.params;
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return res.status(404).send('Commande introuvable');

  const dlToken = order.digitalDownloadTokens.find(t => t.token === token);
  if (!dlToken) return res.status(403).send('Jeton de téléchargement invalide');

  if (dlToken.downloadCount >= dlToken.maxDownloads) {
    return res.status(403).send('Limite de téléchargements atteinte (5/5). Contactez le support Mabele.');
  }

  dlToken.downloadCount += 1;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${dlToken.bookTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt"`);
  res.send(`=======================================================
MABELE LIVRES — TÉLÉCHARGEMENT OFFICIEL SÉCURISÉ
=======================================================
Titre: ${dlToken.bookTitle}
Acquéreur: ${order.customerName} (${order.customerEmail})
Commande n°: ${order.orderNumber}
Jeton: ${dlToken.token}
Licence: Usage personnel strict — Reproduction interdite
RDC Copyright Law & Mabele Digital Protection
=======================================================

Extrait du livre :
${BOOKS.find(b => b.id === dlToken.bookId)?.sampleExcerpt || 'Bonne lecture de votre ouvrage littéraire congolais !'}
`);
});

// --- ESPACE AUTEUR INDÉPENDANT (Stats, Ventes, 70% et Retraits) ---
app.get('/api/author/dashboard', requireAuthor, (req, res) => {
  const user = (req as any).user as User;

  // Trouver ou construire l'enregistrement auteur correspondant à cet utilisateur
  let author = AUTHORS.find(a => a.userId === user.id);
  if (!author && user.id === 'user_author_1') {
    author = AUTHORS.find(a => a.id === 'auth_kabeya');
  }
  if (!author) {
    author = {
      id: `auth_${user.id}`,
      userId: user.id,
      name: user.name,
      bio: user.authorBio || 'Auteur indépendant',
      isCongoleseClassic: false
    };
  }

  const authorBooks = BOOKS.filter(b => b.authorId === author.id);
  const authorTxs = TRANSACTIONS.filter(t => t.authorId === author.id);
  const authorPayouts = PAYOUTS.filter(p => p.authorId === author.id);

  const totalSalesCount = authorTxs.length;
  const totalGrossCdf = authorTxs.reduce((sum, t) => sum + t.grossAmountCdf, 0);
  const totalEarnedCdf = authorTxs.reduce((sum, t) => sum + t.authorShareCdf, 0); // 70%
  const totalWithdrawnCdf = authorPayouts.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amountCdf, 0);
  const pendingPayoutCdf = Math.max(0, totalEarnedCdf - totalWithdrawnCdf);

  res.json({
    author,
    totalSalesCount,
    totalGrossCdf,
    totalEarnedCdf,
    pendingPayoutCdf,
    totalWithdrawnCdf,
    books: authorBooks,
    recentTransactions: authorTxs,
    payouts: authorPayouts
  });
});

app.post('/api/author/payouts', requireAuthor, (req, res) => {
  const user = (req as any).user as User;
  const { amountCdf, paymentMethod, phoneNumber } = req.body;
  const author = AUTHORS.find(a => a.userId === user.id) || AUTHORS.find(a => a.id === 'auth_kabeya')!;

  const amount = Number(amountCdf);
  if (!amount || amount < 5000) {
    return res.status(400).json({ error: 'Le montant minimum de retrait est de 5 000 CDF.' });
  }

  const newPayout: Payout = {
    id: `pay_${Date.now()}`,
    authorId: author.id,
    authorName: author.name,
    amountCdf: amount,
    paymentMethod: paymentMethod || 'mpesa',
    phoneNumber: phoneNumber || user.phone || '+243 82 000 0000',
    status: 'pending',
    requestedAt: new Date().toISOString()
  };

  PAYOUTS.unshift(newPayout);
  res.status(201).json({ success: true, payout: newPayout });
});

// --- ESPACE ADMINISTRATION (Chiffres globaux, modération, validation auteurs) ---
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const totalOrdersCount = ORDERS.length;
  const totalGrossRevenueCdf = TRANSACTIONS.reduce((sum, t) => sum + t.grossAmountCdf, 0);
  const totalAuthorRoyaltiesCdf = TRANSACTIONS.reduce((sum, t) => sum + t.authorShareCdf, 0);
  const totalPlatformRevenueCdf = TRANSACTIONS.reduce((sum, t) => sum + t.platformShareCdf, 0);
  const pendingAuthors = USERS.filter(u => u.role === 'author' && !u.isAuthorApproved);

  res.json({
    totalOrdersCount,
    totalGrossRevenueCdf,
    totalPlatformRevenueCdf,
    totalAuthorRoyaltiesCdf,
    totalBooksCount: BOOKS.length,
    totalUsersCount: USERS.length,
    orders: ORDERS,
    recentTransactions: TRANSACTIONS,
    payoutRequests: PAYOUTS,
    allBooks: BOOKS,
    pendingAuthors,
    allAuthors: AUTHORS
  });
});

app.post('/api/admin/authors/:id/approve', requireAdmin, (req, res) => {
  const targetUser = USERS.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'Auteur introuvable' });

  targetUser.isAuthorApproved = true;
  // Mettre à jour dans les sessions actives si présent
  for (const token of Object.keys(SESSIONS)) {
    if (SESSIONS[token].id === targetUser.id) {
      SESSIONS[token].isAuthorApproved = true;
    }
  }

  res.json({ 
    success: true, 
    message: `L'auteur « ${targetUser.name} » a été validé par la direction. La publication de livres lui est désormais accordée.`,
    user: targetUser
  });
});

app.post('/api/admin/authors/:id/reject', requireAdmin, (req, res) => {
  const targetUser = USERS.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'Auteur introuvable' });

  targetUser.isAuthorApproved = false;
  res.json({ 
    success: true, 
    message: `La demande de l'auteur « ${targetUser.name} » a été refusée.` 
  });
});

app.post('/api/admin/payouts/:id/approve', requireAdmin, (req, res) => {
  const payout = PAYOUTS.find(p => p.id === req.params.id);
  if (!payout) return res.status(404).json({ error: 'Demande introuvable' });

  payout.status = 'approved';
  payout.processedAt = new Date().toISOString();
  res.json({ success: true, payout });
});

app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const order = ORDERS.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  order.status = status;
  res.json({ success: true, order });
});

// ==========================================
// 4. INTÉGRATION VITE ET SERVEUR HTTP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mabele Livres] Serveur full-stack sécurisé sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Erreur démarrage serveur:', err);
});
