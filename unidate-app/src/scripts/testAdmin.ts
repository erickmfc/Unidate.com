// Script para testar o sistema de admin
import { createAdminUser, loginAdmin, getAllAdmins } from '../firebase/realAdminAuth';

export const testAdminSystem = async () => {
  try {
    console.log('🧪 Testando sistema de admin...');
    
    // Verificar se já existem admins
    const existingAdmins = await getAllAdmins();
    console.log('📊 Admins existentes:', existingAdmins.length);
    
    if (existingAdmins.length === 0) {
      console.log('⚠️ Nenhum admin encontrado. Criando admin padrão...');
      
      // Criar admin padrão
      const admin = await createAdminUser(
        'admin@unidate.com',
        'admin123',
        'Administrador UniDate',
        'super-admin'
      );
      
      console.log('✅ Admin criado:', admin.email);
    } else {
      console.log('✅ Admins encontrados:', existingAdmins.map(a => a.email));
    }
    
    // Testar login
    console.log('🔐 Testando login...');
    const session = await loginAdmin('admin@unidate.com', 'admin123');
    console.log('✅ Login bem-sucedido:', session.user.email);
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
};

// Executar teste se chamado diretamente
if (typeof window !== 'undefined') {
  (window as any).testAdminSystem = testAdminSystem;
}
