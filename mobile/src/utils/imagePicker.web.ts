// Mock para web - apenas simula o upload
export const launchImageLibraryWeb = (options: any) => {
  return new Promise((resolve) => {
    // Criar input file dinamicamente
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        resolve({
          didCancel: false,
          assets: [{
            uri: URL.createObjectURL(file),
            fileName: file.name,
            fileSize: file.size,
            type: file.type,
          }]
        });
      } else {
        resolve({ didCancel: true });
      }
    };
    
    input.click();
  });
};