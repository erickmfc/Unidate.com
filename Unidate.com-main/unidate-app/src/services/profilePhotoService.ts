import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

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

      if (!storage) {
        console.log('🔄 [PHOTO] Firebase Storage não disponível. Convertendo foto para Base64.');
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = (err) => {
            reject(new Error('Erro ao ler arquivo da imagem'));
          };
          reader.readAsDataURL(file);
        });
      }

      console.log(`📸 Fazendo upload da foto de perfil para usuário ${userId}`);

      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profilePhotos/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log(`✅ Foto de perfil enviada com sucesso: ${downloadURL}`);
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload da foto de perfil:', error);
      throw new Error(error.message || 'Erro ao fazer upload da foto');
    }
  }

  
  static async deleteProfilePhoto(photoURL: string): Promise<void> {
    try {
      if (!storage) {
        console.log('🔄 [PHOTO] Firebase Storage não disponível, pulando deleção de foto.');
        return;
      }

      const urlParts = photoURL.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      
      if (!photoURL.includes('firebasestorage.googleapis.com')) {
        console.log('⚠️ URL não é do Firebase Storage, pulando deleção');
        return;
      }

      const storageRef = ref(storage, `profilePhotos/${fileName}`);
      await deleteObject(storageRef);
      
      console.log(`✅ Foto de perfil deletada com sucesso: ${fileName}`);
    } catch (error: any) {
      console.error('❌ Erro ao deletar foto de perfil:', error);
    }
  }
}
