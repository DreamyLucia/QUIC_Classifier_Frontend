import { createClient } from '@supabase/supabase-js'

// 1. 从 Vite 的环境变量中读取 URL 和 Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. 添加一个运行时检查，确保环境变量已设置
// 这会在开发时提供清晰的错误信息，避免后续出现难以调试的问题
if (!supabaseUrl || !supabaseKey)
  throw new Error("Supabase URL and Anon Key are not defined. Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.")

// 3. 创建并导出 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseKey)
