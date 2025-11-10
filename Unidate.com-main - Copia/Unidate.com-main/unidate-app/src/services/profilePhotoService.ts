import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

export class ProfilePhotoService {
  /**
   * Faz upload de uma foto de perfil para o Firebase Storage
   * @param file Arquivo de imagem a ser enviado
   * @param userId ID do usuário (para nomear o arquivo)
   * @returns URL da imagem no Firebase Storage
   */
  static async uploadProfilePhoto(file: File, userId: string): Promise<string> {
    try {
      if (!storage) {
        throw new Error('Firebase Storage não está disponível');
      }

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('A imagem deve ter no máximo 5MB');
      }

      console.log(`📸 Fazendo upload da foto de perfil para usuário ${userId}`);

      // Criar referência no Storage
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profilePhotos/${fileName}`);

      // Fazer upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log(`✅ Foto de perfil enviada com sucesso: ${downloadURL}`);
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload da foto de perfil:', error);
      throw new Error(error.message || 'Erro ao fazer upload da foto');
    }
  }

  /**
   * Deleta uma foto de perfil antiga do Storage
   * @param photoURL URL da foto a ser deletada
   */
  static async deleteProfilePhoto(photoURL: string): Promise<void> {
    try {
      if (!storage) {
        throw new Error('Firebase Storage não está disponível');
      }

      // Extrair o caminho da URL
      const urlParts = photoURL.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      
      // Se não for uma URL do Firebase Storage, não fazer nada
      if (!photoURL.includes('firebasestorage.googleapis.com')) {
        console.log('⚠️ URL não é do Firebase Storage, pulando deleção');
        return;
      }

      const storageRef = ref(storage, `profilePhotos/${fileName}`);
      await deleteObject(storageRef);
      
      console.log(`✅ Foto de perfil deletada com sucesso: ${fileName}`);
    } catch (error: any) {
      console.error('❌ Erro ao deletar foto de perfil:', error);
      // Não lançar erro, pois a foto pode já ter sido deletada ou não existir
    }
  }
}

