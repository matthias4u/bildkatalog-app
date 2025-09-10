import React, { useState, useCallback, useRef } from 'react';
import { Settings, ImageFile, PageLayout, LayoutMode, VariationLevel } from './types';
import SettingsDialog from './components/SettingsDialog';
import ImageCanvas from './components/ImageCanvas';
import { generateGridLayout, generateClusterLayout } from './services/layoutGenerator';

const DEFAULT_SETTINGS: Settings = {
  pageW: 210,
  pageH: 297,
  mTop: 15,
  mBot: 15,
  mIn: 15,
  mOut: 15,
  mode: LayoutMode.CLUSTER,
  gridCols: 3,
  gridRows: 5,
  gridGap: 4,
  cCols: 3,
  cGap: 6,
  cRows: 18,
  target: 12,
  varLevel: VariationLevel.MITTEL,
  heroMode: false,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [pages, setPages] = useState<PageLayout[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Generiere Layout...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
        .filter(file => /\.(jpe?g|png|tiff?)$/i.test(file.name));

      if (files.length === 0) {
        alert("Bitte wählen Sie gültige Bilddateien (JPG, PNG, TIF).");
        return;
      }

      setLoadingMessage('Lade Bilder...');
      setIsLoading(true);

      const filePromises = files.map(file => {
        return new Promise<ImageFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({ file, url: e.target?.result as string });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(imageFilesData => {
        setImageFiles(imageFilesData);
        setPages([]);
        setIsSettingsOpen(true);
      }).catch(error => {
        console.error("Fehler beim Laden der Bilder:", error);
        alert("Ein Fehler ist beim Laden der Bilder aufgetreten.");
      }).finally(() => {
        setIsLoading(false);
      });
    }
  };

  const handleSettingsSubmit = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
    setLoadingMessage('Generiere Layout...');
    setIsLoading(true);

    // Use a timeout to allow the UI to update to the loading state
    setTimeout(() => {
      try {
        const generatedPages = newSettings.mode === LayoutMode.GRID
          ? generateGridLayout(imageFiles, newSettings)
          : generateClusterLayout(imageFiles, newSettings);
        setPages(generatedPages);
      } catch (error) {
        console.error("Layout-Generierung fehlgeschlagen:", error);
        alert("Ein Fehler ist bei der Layout-Generierung aufgetreten.");
      } finally {
        setIsLoading(false);
      }
    }, 50); // 50ms delay
  }, [imageFiles]);

  const handleSettingsCancel = () => {
    setIsSettingsOpen(false);
    if(pages.length === 0) {
        setImageFiles([]); // Clear files if generation was cancelled
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const resetApp = () => {
      setSettings(DEFAULT_SETTINGS);
      setImageFiles([]);
      setPages([]);
      setIsSettingsOpen(false);
      setIsLoading(false);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const handleImageSwap = (pageIndex: number, sourceIndex: number, targetIndex: number) => {
    setPages(currentPages => {
      const newPages = [...currentPages];
      const pageToUpdate = { ...newPages[pageIndex] };
      const newLayout = [...pageToUpdate.layout];

      // Swap the 'image' property
      const sourceImage = newLayout[sourceIndex].image;
      newLayout[sourceIndex] = { ...newLayout[sourceIndex], image: newLayout[targetIndex].image };
      newLayout[targetIndex] = { ...newLayout[targetIndex], image: sourceImage };

      pageToUpdate.layout = newLayout;
      newPages[pageIndex] = pageToUpdate;

      return newPages;
    });
  };

  const handleExportProject = () => {
    if (imageFiles.length === 0) {
      alert("Es gibt nichts zu exportieren.");
      return;
    }
    const simplifiedImageFiles = imageFiles.map(f => ({ name: f.file.name, url: f.url }));
    const projectData = {
      settings,
      pages,
      imageFiles: simplifiedImageFiles,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bildkatalog-projekt-${new Date().toISOString().slice(0, 10)}.bkg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const projectData = JSON.parse(text);

        // Basic validation
        if (!projectData.settings || !projectData.pages || !projectData.imageFiles) {
          throw new Error("Ungültige Projektdatei.");
        }
        
        const reconstructedImageFiles: ImageFile[] = projectData.imageFiles.map((f: any) => ({
          file: new File([], f.name),
          url: f.url,
        }));
        
        // Match images in pages with the reconstructed list
        const urlMap = new Map(reconstructedImageFiles.map(f => [f.file.name, f]));
        const reconstructedPages = projectData.pages.map((page: PageLayout) => ({
            ...page,
            layout: page.layout.map(rect => ({
                ...rect,
                image: urlMap.get(rect.image.file.name) || rect.image
            }))
        }));

        setSettings(projectData.settings);
        setImageFiles(reconstructedImageFiles);
        setPages(reconstructedPages);

      } catch (error) {
        console.error("Fehler beim Importieren des Projekts:", error);
        alert("Die Projektdatei konnte nicht geladen werden. Sie ist möglicherweise beschädigt oder hat ein ungültiges Format.");
      }
    };
    reader.readAsText(file);

    // Reset input value to allow re-importing the same file
    event.target.value = '';
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="w-full max-w-6xl flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">Bildkatalog Generator</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <input 
            type="file" 
            ref={importInputRef} 
            className="hidden" 
            accept=".bkg,application/json"
            onChange={handleImportProject}
          />
          <button
              onClick={() => importInputRef.current?.click()}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              Importieren...
            </button>
          {imageFiles.length > 0 && (
            <>
              <button
                onClick={handleExportProject}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                Exportieren
              </button>
              <button
                onClick={resetApp}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                Neu Starten
              </button>
            </>
          )}
        </div>
      </header>
      
      <main className="w-full max-w-6xl flex-grow">
        {isSettingsOpen && (
          <SettingsDialog
            settings={settings}
            onSubmit={handleSettingsSubmit}
            onCancel={handleSettingsCancel}
          />
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-xl">{loadingMessage}</p>
          </div>
        )}

        {!isLoading && pages.length > 0 && <ImageCanvas pages={pages} onImageSwap={handleImageSwap} />}
        
        {!isLoading && pages.length === 0 && imageFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-600 rounded-lg h-64">
            <h2 className="text-2xl font-semibold mb-4">Willkommen!</h2>
            <p className="mb-6 text-gray-400 max-w-md">Wählen Sie mehrere Bilder aus, um einen dynamischen Bildkatalog oder eine Collage zu erstellen. Konfigurieren Sie anschließend das Layout nach Ihren Wünschen.</p>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/tiff"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              onClick={triggerFileSelect}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform duration-200 hover:scale-105"
            >
              Bilder auswählen
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;