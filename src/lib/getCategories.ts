import { supabase } from './supabaseClient'

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('id, name')
  if (error) throw error
  return data
}

export async function getMainCategories(categoryId: number) {
  const { data, error } = await supabase
    .from('main_categories')
    .select('id, name')
    .eq('category_id', categoryId)
  if (error) throw error
  return data
}

export async function getSubCategories(mainCategoryId: number) {
  const { data, error } = await supabase
    .from('subcategories')
    .select('id, name')
    .eq('main_category_id', mainCategoryId)
  if (error) throw error
  return data
}
