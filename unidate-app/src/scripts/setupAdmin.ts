// Script para configurar o primeiro administrador do UniDate
import { createAdminUser } from '../firebase/realAdminAuth';

// Função para criar o primeiro admin
export const setupFirstAdmin = async () => {
  try {
    console.log('🔧 Configurando primeiro administrador...');
    
    // Credenciais do primeiro admin
    const adminData = {
      email: 'admin@unidate.com',
      password: 'admin123',
      displayName: 'Administrador UniDate',
      role: 'super-admin' as const
    };

    const admin = await createAdminUser(
      adminData.email,
      adminData.password,
      adminData.displayName,
      adminData.role
    );

    console.log('✅ Administrador criado com sucesso!');
    console.log('📧 E-mail:', admin.email);
    console.log('👤 Nome:', admin.displayName);
    console.log('🔑 Role:', admin.role);
    console.log('🛡️ Permissões:', admin.permissions);
    
    return admin;
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    throw error;
  }
};

// Função para verificar se já existe um admin
export const checkAdminExists = async () => {
  try {
    const { getAllAdmins } = await import('../firebase/realAdminAuth');
    const admins = await getAllAdmins();
    return admins.length > 0;
  } catch (error) {
    console.error('Erro ao verificar administradores:', error);
    return false;
  }
};

// Função principal para setup
export const runAdminSetup = async () => {
  try {
    const exists = await checkAdminExists();
    
    if (exists) {
      console.log('ℹ️ Administradores já existem no sistema.');
      return;
    }

    await setupFirstAdmin();
    console.log('🎉 Setup do administrador concluído!');
  } catch (error) {
    console.error('❌ Erro no setup:', error);
  }
};
