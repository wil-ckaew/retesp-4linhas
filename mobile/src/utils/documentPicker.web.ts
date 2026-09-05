// Mock para web - apenas simula o upload
export const pickPDFWeb = (options: any) => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.multiple = false;
    
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        resolve([{
          uri: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
        }]);
      } else {
        reject({ message: 'User cancelled' });
      }
    };
    
    input.click();
  });
};

export const PDFTypes = {
  pdf: 'application/pdf',
};