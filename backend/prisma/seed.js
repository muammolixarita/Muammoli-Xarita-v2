import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed boshlandi...')

  // ── Organizations ──────────────────────────────────────────────────────────
  const orgs = [
    { name: 'Communal Services Department', name_uz: 'Kommunal xizmatlar boshqarmasi', category: 'garbage',     email: 'communal@city.uz',   phone: '+998 71 123 45 67', description: 'Axlat yig\'ish va ko\'cha tozalash' },
    { name: 'Road Infrastructure Agency',   name_uz: 'Yo\'l infratuzilmasi agentligi', category: 'road',        email: 'roads@city.uz',       phone: '+998 71 234 56 78', description: 'Yo\'llarni ta\'mirlash' },
    { name: 'Electric Power Distribution',  name_uz: 'Elektr energiyasini taqsimlash', category: 'electricity', email: 'electricity@city.uz', phone: '+998 71 345 67 89', description: 'Elektr uzilishlari va ko\'cha chiroqlari' },
    { name: 'Water Supply Authority',       name_uz: 'Suv ta\'minoti boshqarmasi',    category: 'water',        email: 'water@city.uz',       phone: '+998 71 456 78 90', description: 'Suv ta\'minoti va kanalizatsiya' },
    { name: 'Green Spaces Department',      name_uz: 'Yashil maydonlar boshqarmasi',  category: 'parks',        email: 'parks@city.uz',       phone: '+998 71 567 89 01', description: 'Parklar va ko\'kalamzorlar' },
    { name: 'Public Order Service',         name_uz: 'Jamoat tartibini saqlash',      category: 'safety',       email: 'safety@city.uz',      phone: '+998 71 678 90 12', description: 'Jamoat xavfsizligi' },
    { name: 'General City Services',        name_uz: 'Umumiy shahar xizmatlari',      category: 'other',        email: 'general@city.uz',     phone: '+998 71 100 00 00', description: 'Umumiy muammolar' },
  ]

  const createdOrgs = {}
  for (const org of orgs) {
    const created = await prisma.organization.upsert({
      where:  { category: org.category },
      update: { name: org.name, name_uz: org.name_uz, email: org.email, phone: org.phone },
      create: org,
    })
    createdOrgs[org.category] = created
  }
  console.log(`✅ ${orgs.length} ta tashkilot yaratildi`)

  // ── Tashkilot xodimlari (har bir tashkilotga bitta hisob) ──────────────────
  const orgUsers = [
    { name: 'Kommunal Xizmat',  email: 'kommunal@muammoxarita.uz',   password: 'kommunal123',   category: 'garbage'     },
    { name: 'Yo\'l Boshqarma',  email: 'yol@muammoxarita.uz',        password: 'yol123',        category: 'road'        },
    { name: 'Elektr Xizmat',    email: 'elektr@muammoxarita.uz',     password: 'elektr123',     category: 'electricity' },
    { name: 'Suv Xizmat',       email: 'suv@muammoxarita.uz',        password: 'suv123',        category: 'water'       },
    { name: 'Yashil Maydonlar', email: 'park@muammoxarita.uz',       password: 'park123',       category: 'parks'       },
    { name: 'Jamoat Tartibi',   email: 'xavfsizlik@muammoxarita.uz', password: 'xavfsizlik123', category: 'safety'      },
    { name: 'Umumiy Xizmat',    email: 'umumiy@muammoxarita.uz',     password: 'umumiy123',     category: 'other'       },
  ]

  for (const ou of orgUsers) {
    await prisma.user.upsert({
      where:  { email: ou.email },
      update: { organization_id: createdOrgs[ou.category].id, role: 'organization' },
      create: {
        name:            ou.name,
        email:           ou.email,
        password_hash:   await bcrypt.hash(ou.password, 12),
        role:            'organization',
        organization_id: createdOrgs[ou.category].id,
      },
    })
  }
  console.log(`✅ ${orgUsers.length} ta tashkilot xodimi yaratildi`)

  // ── Admin ──────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: 'admin@muammoxarita.uz' },
    update: {},
    create: {
      name:          'Admin User',
      email:         'admin@muammoxarita.uz',
      password_hash: await bcrypt.hash('admin123', 12),
      role:          'admin',
    },
  })

  await prisma.user.upsert({
  where:  { email: 'saparboyevdoniyor391@gmail.com' },
  update: { role: 'admin' },
  create: {
    name:          'Doniyor',
    email:         'saparboyevdoniyor391@gmail.com',
    password_hash: await bcrypt.hash('doniyor1515', 12),
    role:          'admin',
  },
})

  // ── Demo fuqaro ────────────────────────────────────────────────────────────
  const demo = await prisma.user.upsert({
    where:  { email: 'demo@example.com' },
    update: {},
    create: {
      name:          'Demo Fuqaro',
      email:         'demo@example.com',
      password_hash: await bcrypt.hash('demo123', 12),
      role:          'user',
      district:      'Yunusabad',
      phone:         '+998 90 000 00 00',
    },
  })
  console.log('✅ Foydalanuvchilar yaratildi')

  // ── Demo muammolar ─────────────────────────────────────────────────────────
  const existingProblems = await prisma.problem.count()
  if (existingProblems === 0) {
    const problems = [
      {
        title:           'Yunusabad 7-mavzuda axlat to\'planib qolgan',
        description:     'Ko\'cha burchagida bir necha kundan beri axlat yig\'ilib qolgan. Hiddan o\'tish qiyin.',
        category:        'garbage',
        status:          'new',
        priority:        'high',
        latitude:        41.3111,
        longitude:       69.2797,
        address:         'Yunusabad tumani, 7-mavzu',
        organization_id: createdOrgs['garbage'].id,
        ai_analysis:     { category: 'garbage', priority: 'high', confidence: 0.95, summary: 'Waste accumulation issue', tags: ['axlat', 'ko\'cha'], estimatedResolutionDays: 2 },
      },
      {
        title:           'Chilonzor ko\'chasida katta chuqur',
        description:     'Yo\'lda katta chuqur bor, mashinalar shikastlanmoqda.',
        category:        'road',
        status:          'in_progress',
        priority:        'critical',
        latitude:        41.2856,
        longitude:       69.2012,
        address:         'Chilonzor tumani, Qoratosh ko\'chasi',
        organization_id: createdOrgs['road'].id,
        ai_analysis:     { category: 'road', priority: 'critical', confidence: 0.98, summary: 'Large pothole', tags: ['chuqur', 'yo\'l'], estimatedResolutionDays: 5 },
      },
      {
        title:           'Mirobod mahallasida 3 kundan beri suv yo\'q',
        description:     'Butun ko\'cha bo\'yicha suv berilmayapti.',
        category:        'water',
        status:          'resolved',
        priority:        'critical',
        latitude:        41.3001,
        longitude:       69.2654,
        address:         'Mirobod tumani, 15-ko\'cha',
        organization_id: createdOrgs['water'].id,
        resolved_at:     new Date(),
        resolution_note: 'Asosiy quvur ulandi va suv ta\'minoti tiklandi.',
        ai_analysis:     { category: 'water', priority: 'critical', confidence: 0.97, summary: 'No water supply', tags: ['suv', 'quvur'], estimatedResolutionDays: 1 },
      },
      {
        title:           'Shayxontohurda ko\'cha chiroqlari ishlamayapti',
        description:     '5 ta chiroq o\'chib qolgan, tunda yo\'l juda qorong\'i.',
        category:        'electricity',
        status:          'new',
        priority:        'medium',
        latitude:        41.3245,
        longitude:       69.2534,
        address:         'Shayxontohur tumani, Navoiy ko\'chasi',
        organization_id: createdOrgs['electricity'].id,
        ai_analysis:     { category: 'electricity', priority: 'medium', confidence: 0.92, summary: 'Street lights out', tags: ['chiroq'], estimatedResolutionDays: 3 },
      },
    ]

    for (const p of problems) {
      await prisma.problem.create({ data: { ...p, user_id: demo.id } })
    }
    console.log(`✅ ${problems.length} ta demo muammo yaratildi`)
  } else {
    console.log(`ℹ️  Muammolar mavjud (${existingProblems} ta) — o'tkazib yuborildi`)
  }

  console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!')
  console.log('════════════════════════════════════════')
  console.log('👤 Admin:     admin@muammoxarita.uz / admin123')
  console.log('👤 Demo:      demo@example.com / demo123')
  console.log('════════════════════════════════════════')
  console.log('🏛️  Tashkilot hisoblari:')
  console.log('   kommunal@muammoxarita.uz    / kommunal123')
  console.log('   yol@muammoxarita.uz         / yol123')
  console.log('   elektr@muammoxarita.uz      / elektr123')
  console.log('   suv@muammoxarita.uz         / suv123')
  console.log('   park@muammoxarita.uz        / park123')
  console.log('   xavfsizlik@muammoxarita.uz  / xavfsizlik123')
  console.log('   umumiy@muammoxarita.uz      / umumiy123')
  console.log('════════════════════════════════════════')
}

main()
  .catch(e => { console.error('❌ Seed xatosi:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
