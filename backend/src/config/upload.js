import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Supabase client (service role key — to'liq ruxsat)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Multer — rasmni xotiraga oladi (diskga emas)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Faqat rasm fayllari ruxsat etilgan'), false)
    }
  },
})

// Rasmni Supabase Storage ga yuklash
export const uploadToSupabase = async (file) => {
  if (!file) return null

  const ext      = file.originalname.split('.').pop()
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (error) {
    console.error('Supabase upload xatosi:', error)
    return null
  }

  // Public URL olish
  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filename)

  return {
    url:      urlData.publicUrl,
    filename,
  }
}
