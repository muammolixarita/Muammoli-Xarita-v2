# 🗺️ Muammo Xarita

**Muammo Xarita** — shahar muammolarini interaktiv xaritada bildirish va kuzatish uchun to'liq full-stack platforma.

Fuqarolar muammolarni fotosurati, joylashuvi va tavsifi bilan bildiradi. AI (OpenAI GPT-4o-mini) muammoni avtomatik toifalaydi va tegishli tashkilotga yo'naltiradi.

---

## 📁 Loyiha tuzilmasi

```
muammo-xarita/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     ← Prisma schema (barcha modellar)
│   │   └── seed.js           ← Demo ma'lumotlar
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.js     ← Prisma Client singleton
│   │   ├── config/
│   │   │   └── cloudinary.js
│   │   ├── controllers/      ← Route handler logic (Prisma)
│   │   ├── middleware/        ← JWT auth, error handler
│   │   ├── routes/           ← Express routes
│   │   └── utils/
│   │       └── aiService.js  ← OpenAI integratsiya
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       ← Leaflet xarita, UI komponentlar
│   │   ├── pages/            ← Sahifalar
│   │   ├── store/            ← Zustand state management
│   │   └── utils/            ← API client, konstantalar
│   └── package.json
│
└── README.md
```

---

## 🚀 O'rnatish

### Talablar
- **Node.js** v18+
- **PostgreSQL** v14+
- **Cloudinary** account (bepul — cloudinary.com)
- **OpenAI** API key (platform.openai.com)

---

### 1. Backend o'rnatish

```bash
cd backend
npm install          # Prisma ham o'rnatiladi, postinstall: prisma generate
```

`.env` faylini yarating:
```bash
cp .env.example .env
# Keyin .env faylini tahrirlang
```

Minimal `.env` konfiguratsiyasi:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/muammo_xarita?schema=public"
JWT_SECRET=minimum_32_character_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=sk-your_key
FRONTEND_URL=http://localhost:5173
```

---

### 2. Ma'lumotlar bazasini tayyorlash

```bash
# PostgreSQL-da baza yaratish
psql -U postgres -c "CREATE DATABASE muammo_xarita;"

# Prisma migratsiyasi (jadvalarni yaratadi)
npm run db:migrate

# Demo ma'lumotlarni yuklash
npm run db:seed
```

**Seed paytida yaratiladi:**
| Email                     | Parol    | Rol     |
|---------------------------|----------|---------|
| admin@muammoxarita.uz     | admin123 | admin   |
| demo@example.com          | demo123  | citizen |

---

### 3. Frontend o'rnatish

```bash
cd ../frontend
npm install
cp .env.example .env
# .env: VITE_API_URL=http://localhost:5000/api
```

---

### 4. Ishga tushirish

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev        # http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev        # http://localhost:5173
```

---

## 🗄️ Prisma komandalar

```bash
# Schema o'zgargandan keyin client qayta generatsiya qilish
npm run db:generate

# Yangi migration yaratish
npx prisma migrate dev --name "migration_nomi"

# Production-da migratsiyani qo'llash
npm run db:migrate:prod

# Schemani to'g'ridan-to'g'ri DB-ga push qilish (dev uchun)
npm run db:push

# Prisma Studio — vizual DB boshqaruvi
npm run db:studio

# Bazani tozalab qayta seed qilish
npm run db:reset
```

---

## 🌐 API Endpointlar

### Auth
| Method | URL                    | Tavsif                    |
|--------|------------------------|---------------------------|
| POST   | `/api/auth/register`   | Ro'yxatdan o'tish         |
| POST   | `/api/auth/login`      | Tizimga kirish            |
| GET    | `/api/auth/profile`    | Profilni olish (JWT)      |
| PUT    | `/api/auth/profile`    | Profilni yangilash (JWT)  |

### Muammolar
| Method | URL                         | Tavsif                              |
|--------|-----------------------------|-------------------------------------|
| GET    | `/api/problems`             | Barcha muammolar (filter, sort)     |
| GET    | `/api/problems/stats`       | Statistikalar                       |
| GET    | `/api/problems/my`          | Mening muammolarim (JWT)            |
| GET    | `/api/problems/:id`         | Muammo tafsiloti + izohlar          |
| POST   | `/api/problems`             | Yangi muammo + AI tahlil (JWT)      |
| PATCH  | `/api/problems/:id/status`  | Status yangilash (admin/org_member) |
| POST   | `/api/problems/:id/vote`    | Ovoz berish / bekor qilish (JWT)    |
| POST   | `/api/problems/:id/comments`| Izoh qo'shish (JWT)                 |

### Tashkilotlar
| Method | URL                       | Tavsif               |
|--------|---------------------------|----------------------|
| GET    | `/api/organizations`      | Barcha tashkilotlar  |
| GET    | `/api/organizations/:id`  | Tashkilot tafsiloti  |

### Bildirishnomalar
| Method | URL                              | Tavsif                         |
|--------|----------------------------------|--------------------------------|
| GET    | `/api/notifications`             | Bildirishnomalar ro'yxati (JWT)|
| PATCH  | `/api/notifications/read-all`    | Hammasini o'qilgan deb belgilash|
| PATCH  | `/api/notifications/:id/read`    | Bittasini o'qilgan deb belgilash|

---

## 🤖 AI Toifalash (OpenAI GPT-4o-mini)

Har bir yangi muammo yuborilganda:

1. **GPT-4o-mini** sarlavha, tavsif va rasimni tahlil qiladi
2. Toifa beradi: `garbage` `road` `electricity` `water` `parks` `safety` `other`
3. Muhimlik: `low` `medium` `high` `critical`
4. Taxminiy hal qilish muddatini hisoblaydi
5. Tegishli tashkilotga yo'naltiradi
6. Foydalanuvchiga bildirishnoma yuboradi

---

## 🗺️ Prisma Schema modellari

| Model          | Tavsif                                         |
|----------------|------------------------------------------------|
| `User`         | Fuqarolar, adminlar, tashkilot xodimlari       |
| `Organization` | Shahar xizmatlari (7 ta toifa)                 |
| `Problem`      | Muammolar — AI tahlili, status, koordinatalar  |
| `Vote`         | Muammo ovozlari (unique constraint)            |
| `Comment`      | Rasmiy va oddiy izohlar                        |
| `Notification` | Status o'zgarish, izoh, javob bildirishnomalari|

---

## 📦 Deploy (Production)

### Backend → Railway / Render
```bash
# Environment variables-ni platform dashboard-da sozlang
DATABASE_URL=postgresql://...?sslmode=require
NODE_ENV=production
# Qolgan vars ham

# Build command
npm install && npm run db:migrate:prod
# Start command
npm start
```

### Frontend → Vercel / Netlify
```bash
npm run build
# Build output: dist/
# VITE_API_URL=https://your-backend.railway.app/api
```

---

## 🛠️ Tech Stack

| Layer        | Texnologiya                          |
|--------------|--------------------------------------|
| Frontend     | React 18, Vite, Tailwind CSS         |
| Map          | Leaflet, React-Leaflet               |
| State        | Zustand                              |
| Backend      | Node.js, Express                     |
| ORM          | **Prisma** (PostgreSQL)              |
| Auth         | JWT (jsonwebtoken, bcryptjs)         |
| File upload  | Multer + Cloudinary                  |
| AI           | OpenAI GPT-4o-mini                   |
| Validation   | express-validator                    |

---

## 📝 Litsenziya

MIT © 2024 Muammo Xarita
