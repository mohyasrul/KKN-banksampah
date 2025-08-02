import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('rt').select('count', { count: 'exact' });
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log(`📊 Found ${data?.length || 0} RT records`);
    return true;
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

export async function setupInitialData() {
  try {
    console.log('🌱 Setting up initial data...');
    
    // Check if RT data exists
    const { data: existingRT } = await supabase.from('rt').select('count', { count: 'exact' });
    
    if (!existingRT || existingRT.length === 0) {
      console.log('📝 Creating sample RT data...');
      
      const { error: rtError } = await supabase.from('rt').insert([
        { nomor: '001', ketua_rt: 'Bapak Sumarno', jumlah_kk: 25, alamat: 'Jl. Merdeka No. 1', kontak: '081234567801' },
        { nomor: '002', ketua_rt: 'Ibu Sari Wahyuni', jumlah_kk: 30, alamat: 'Jl. Merdeka No. 2', kontak: '081234567802' },
        { nomor: '003', ketua_rt: 'Bapak Ahmad Yani', jumlah_kk: 28, alamat: 'Jl. Merdeka No. 3', kontak: '081234567803' }
      ]);
      
      if (rtError) {
        console.error('❌ Failed to create RT data:', rtError);
      } else {
        console.log('✅ RT data created successfully');
      }
    }
    
    // Check if waste types exist
    const { data: existingWasteTypes } = await supabase.from('waste_types').select('count', { count: 'exact' });
    
    if (!existingWasteTypes || existingWasteTypes.length === 0) {
      console.log('📝 Creating sample waste types...');
      
      const { error: wasteError } = await supabase.from('waste_types').insert([
        { name: 'Plastik', price_per_kg: 2000, unit: 'kg', description: 'Botol plastik, kemasan plastik', is_active: true },
        { name: 'Kertas', price_per_kg: 1500, unit: 'kg', description: 'Kertas bekas, koran, majalah', is_active: true },
        { name: 'Kaleng', price_per_kg: 3000, unit: 'kg', description: 'Kaleng minuman, kaleng makanan', is_active: true },
        { name: 'Botol Kaca', price_per_kg: 500, unit: 'kg', description: 'Botol kaca bening dan warna', is_active: true }
      ]);
      
      if (wasteError) {
        console.error('❌ Failed to create waste types:', wasteError);
      } else {
        console.log('✅ Waste types created successfully');
      }
    }
    
    console.log('🎉 Initial data setup completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}
