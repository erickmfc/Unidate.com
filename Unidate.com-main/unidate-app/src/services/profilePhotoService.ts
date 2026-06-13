import { supabase } from '../supabaseClient';

export class ProfilePhotoService {
  static async uploadProfilePhoto(file: File, userId: string): Promise<string> {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('A imagem deve ter no máximo 5MB');
      }

      console.log(`📸 Fazendo upload da foto de perfil para usuário ${userId}`);

      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error('Erro no Supabase Storage:', error);
        throw error;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      console.log(`✅ Foto de perfil enviada com sucesso: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload da foto de perfil:', error);
      throw new Error(error.message || 'Erro ao fazer upload da foto');
    }
  }

  static async deleteProfilePhoto(photoURL: string): Promise<void> {
    try {
      if (!photoURL.includes('supabase.co')) {
        console.log('⚠️ URL não é do Supabase Storage, pulando deleção');
        return;
      }

      const urlParts = photoURL.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      
      const { error } = await supabase.storage
        .from('avatars')
        .remove([fileName]);
        
      if (error) throw error;
      
      console.log(`✅ Foto de perfil deletada com sucesso: ${fileName}`);
    } catch (error: any) {
      console.error('❌ Erro ao deletar foto de perfil:', error);
    }
  }
}
