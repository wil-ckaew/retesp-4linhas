import { Platform } from 'react-native';

// Versão web - com tipos corretos
export const pickImage = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    const { launchImageLibraryWeb } = await import('./imagePicker.web');
    return launchImageLibraryWeb({ mediaType: 'photo' });
  } else {
    const { launchImageLibrary } = await import('react-native-image-picker');
    return launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
  }
};

export const pickPDF = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    const { pickPDFWeb } = await import('./documentPicker.web');
    return pickPDFWeb({ type: ['.pdf'] });
  } else {
    const DocumentPicker = await import('react-native-document-picker');
    return DocumentPicker.pick({ type: [DocumentPicker.types.pdf] });
  }
};