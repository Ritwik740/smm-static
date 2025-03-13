import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface TextStyle {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: string;
  color: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  position: {
    x: number;
    y: number;
  };
}

interface DesignEditorProps {
  defaultTemplate?: string;
}

interface PresetPosition {
  name: string;
  x: number;
  y: number;
}

const FONT_FAMILIES = [
  // Display and Decorative Fonts
  'Abril Fatface',
  'Amatic SC',
  'Architects Daughter',
  'Bebas Neue',
  'Cookie',
  'Dancing Script',
  'Great Vibes',
  'Indie Flower',
  'Lobster',
  'Pacifico',
  'Permanent Marker',
  'Sacramento',
  
  // Sans-Serif Fonts
  'Montserrat',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Nunito',
  'Raleway',
  'Source Sans 3',
  'Work Sans',
  'Noto Sans',
  'PT Sans',
  'Oxygen',
  'Ubuntu',
  'Mulish',
  'Josefin Sans',
  'Comfortaa',
  'Quicksand',
  'Exo 2',
  'Rubik',
  
  // Serif Fonts
  'Playfair Display',
  'Lora',
  'Merriweather',
  'PT Serif',
  'Crimson Text',
  'Bitter',
  'Spectral',
  'Roboto Slab',
  
  // Monospace Fonts
  'Roboto Mono',
  'Source Code Pro',
  'Space Mono',
  
  // Handwriting Fonts
  'Caveat',
  'Kalam',
  'Handlee',
  'Courgette',
  
  // Traditional Fonts
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Helvetica',
];

const FONT_SIZES = ['18px', '24px', '32px', '40px', '48px', '56px', '64px', '72px', '96px'];
const FONT_WEIGHTS = ['300', 'normal', '500', '600', 'bold', '800'];

const TEXT_COLORS = [
  // Primary Colors
  '#FFFFFF', '#000000', '#808080', '#D3D3D3', '#A9A9A9', '#696969',
  // Warm Colors
  '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#FFB6C1', '#FF69B4', '#FF1493',
  '#8B0000', '#A52A2A', '#CD5C5C', '#DC143C', '#FF6347', '#FA8072',
  // Cool Colors
  '#00FF00', '#008000', '#00FFFF', '#0000FF', '#4B0082', '#00CED1', '#20B2AA', '#48D1CC',
  '#40E0D0', '#7FFFD4', '#66CDAA', '#3CB371', '#2E8B57', '#006400',
  // Pastel Colors
  '#FFB6C1', '#DDA0DD', '#98FB98', '#87CEEB', '#E6E6FA', '#F0E68C', '#DEB887', '#F5DEB3',
  '#FFDAB9', '#FFE4B5', '#FAFAD2', '#F0FFF0', '#F5FFFA', '#F0FFFF',
  // Rich Colors
  '#800000', '#8B4513', '#006400', '#000080', '#4B0082', '#800080', '#8B008B', '#9400D3',
  '#483D8B', '#191970', '#000080', '#00008B', '#0000CD', '#0000FF'
];

const PRESET_POSITIONS: PresetPosition[] = [
  { name: 'Center', x: 50, y: 50 },
  { name: 'Top Center', x: 50, y: 10 },
  { name: 'Bottom Center', x: 50, y: 90 },
  { name: 'Left Center', x: 20, y: 50 },
  { name: 'Right Center', x: 80, y: 50 },
  { name: 'Top Left', x: 20, y: 10 },
  { name: 'Top Right', x: 80, y: 10 },
  { name: 'Bottom Left', x: 20, y: 90 },
  { name: 'Bottom Right', x: 80, y: 90 },
];

export default function DesignEditor({ defaultTemplate }: DesignEditorProps) {
  const [template, setTemplate] = useState<string | undefined>(defaultTemplate);
  const [isDragging, setIsDragging] = useState(false);
  const [texts, setTexts] = useState<TextStyle[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const [customColor, setCustomColor] = useState('#000000');
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const addNewText = () => {
    const newText: TextStyle = {
      id: Date.now().toString(),
      text: 'New Text',
      fontFamily: 'Montserrat',
      fontSize: '48px',
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      position: { x: 50, y: 50 },
    };
    setTexts([...texts, newText]);
    setSelectedTextId(newText.id);
  };

  const updateText = (id: string, updates: Partial<TextStyle>) => {
    setTexts(texts.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ));
  };

  const deleteText = (id: string) => {
    setTexts(texts.filter(text => text.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplate(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, textId: string) => {
    if (!designRef.current) return;
    setIsDragging(true);
    setSelectedTextId(textId);
    
    const rect = designRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    updateText(textId, { position: { x, y } });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !designRef.current || !selectedTextId) return;
    
    const rect = designRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    updateText(selectedTextId, { position: { x, y } });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownloadPNG = async () => {
    if (designRef.current) {
      try {
        const dataUrl = await toPng(designRef.current, { quality: 1.0 });
        const link = document.createElement('a');
        link.download = 'design.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generating image:', err);
      }
    }
  };

  const handleDownloadJSON = () => {
    const designData = {
      template,
      texts,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.download = 'design.json';
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0f172a] overflow-y-auto">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Design Editor</h1>
          <p className="mt-2 text-sm text-gray-400">Customize your design with text and templates</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">Preview</h2>
                <button
                  onClick={addNewText}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1e293b]"
                >
                  Add Text
                </button>
              </div>
              <div
                ref={designRef}
                className="relative w-full aspect-[4/5] bg-[#0f172a] shadow-lg rounded-lg overflow-hidden cursor-move border border-gray-700"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {template ? (
                  <img
                    src={template}
                    alt="Template"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#1e293b] flex items-center justify-center">
                    <p className="text-gray-500">Upload a template to get started</p>
                  </div>
                )}
                {texts.map((textStyle) => (
                  <div
                    key={textStyle.id}
                    className={`absolute inline-block transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedTextId === textStyle.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: `${textStyle.position.x}%`,
                      top: `${textStyle.position.y}%`,
                      fontFamily: textStyle.fontFamily,
                      fontSize: textStyle.fontSize,
                      color: textStyle.color,
                      fontWeight: textStyle.fontWeight,
                      textAlign: textStyle.textAlign,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      cursor: 'move',
                      maxWidth: '100%',
                      padding: '0',
                      margin: '0',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, textStyle.id)}
                  >
                    {textStyle.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 border border-gray-700">
              <h2 className="text-lg font-medium text-white mb-4">Quick Position</h2>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_POSITIONS.map((pos) => (
                  <button
                    key={pos.name}
                    onClick={() => selectedTextId && updateText(selectedTextId, { position: { x: pos.x, y: pos.y } })}
                    className="px-3 py-2 text-sm rounded bg-[#0f172a] hover:bg-[#1e293b] text-gray-200 border border-gray-600 transition-colors duration-200"
                  >
                    {pos.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#1e293b] rounded-lg shadow-lg p-6 space-y-6 border border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">Text Editor</h2>
              {selectedTextId && (
                <button
                  onClick={() => deleteText(selectedTextId)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete Text
                </button>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Template
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleTemplateUpload}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
                aria-label="Upload template image"
                title="Upload template image"
              />
            </div>

            {selectedTextId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Text
                  </label>
                  <textarea
                    value={texts.find(t => t.id === selectedTextId)?.text || ''}
                    onChange={(e) => updateText(selectedTextId, { text: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    rows={4}
                    placeholder="Enter your text here"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Family
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-600 rounded-md bg-gray-700">
                    <div className="sticky top-0 bg-gray-800 px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-600 z-10">
                      Display & Decorative
                    </div>
                    {FONT_FAMILIES.map(font => (
                      <button
                        key={font}
                        onClick={() => updateText(selectedTextId, { fontFamily: font })}
                        className={`w-full px-4 py-3 text-left border-b border-gray-600 ${
                          texts.find(t => t.id === selectedTextId)?.fontFamily === font 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-200 hover:text-gray-900 hover:bg-gray-600'
                        }`}
                        style={{ fontFamily: font }}
                      >
                        <div className="text-sm">{font}</div>
                        <div className="text-lg mt-1">
                          Sample Text
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Size
                  </label>
                  <select
                    value={texts.find(t => t.id === selectedTextId)?.fontSize}
                    onChange={(e) => updateText(selectedTextId, { fontSize: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
                    aria-label="Select font size"
                    title="Select font size"
                  >
                    {FONT_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Weight
                  </label>
                  <select
                    value={texts.find(t => t.id === selectedTextId)?.fontWeight}
                    onChange={(e) => updateText(selectedTextId, { fontWeight: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
                    aria-label="Select font weight"
                    title="Select font weight"
                  >
                    {FONT_WEIGHTS.map(weight => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="space-y-4">
                    {/* Custom Color Input */}
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Custom Color</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            placeholder="#000000 or rgb(0,0,0)"
                            className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                          />
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => {
                              setCustomColor(e.target.value);
                              updateText(selectedTextId, { color: e.target.value });
                            }}
                            className="h-8 w-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                            title="Color picker"
                          />
                          <button
                            onClick={() => updateText(selectedTextId, { color: customColor })}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Color Categories */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Primary Colors</label>
                        <div className="grid grid-cols-8 gap-2">
                          {TEXT_COLORS.slice(0, 6).map(color => (
                            <button
                              key={color}
                              onClick={() => updateText(selectedTextId, { color })}
                              className={`w-8 h-8 rounded-lg border-2 ${
                                texts.find(t => t.id === selectedTextId)?.color === color ? 'border-blue-500' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Warm Colors</label>
                        <div className="grid grid-cols-8 gap-2">
                          {TEXT_COLORS.slice(6, 20).map(color => (
                            <button
                              key={color}
                              onClick={() => updateText(selectedTextId, { color })}
                              className={`w-8 h-8 rounded-lg border-2 ${
                                texts.find(t => t.id === selectedTextId)?.color === color ? 'border-blue-500' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Cool Colors</label>
                        <div className="grid grid-cols-8 gap-2">
                          {TEXT_COLORS.slice(20, 34).map(color => (
                            <button
                              key={color}
                              onClick={() => updateText(selectedTextId, { color })}
                              className={`w-8 h-8 rounded-lg border-2 ${
                                texts.find(t => t.id === selectedTextId)?.color === color ? 'border-blue-500' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Pastel Colors</label>
                        <div className="grid grid-cols-8 gap-2">
                          {TEXT_COLORS.slice(34, 48).map(color => (
                            <button
                              key={color}
                              onClick={() => updateText(selectedTextId, { color })}
                              className={`w-8 h-8 rounded-lg border-2 ${
                                texts.find(t => t.id === selectedTextId)?.color === color ? 'border-blue-500' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Rich Colors</label>
                        <div className="grid grid-cols-8 gap-2">
                          {TEXT_COLORS.slice(48).map(color => (
                            <button
                              key={color}
                              onClick={() => updateText(selectedTextId, { color })}
                              className={`w-8 h-8 rounded-lg border-2 ${
                                texts.find(t => t.id === selectedTextId)?.color === color ? 'border-blue-500' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Text Alignment
                  </label>
                  <div className="flex space-x-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateText(selectedTextId, { textAlign: align as 'left' | 'center' | 'right' })}
                        className={`px-4 py-2 rounded ${
                          texts.find(t => t.id === selectedTextId)?.textAlign === align
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="relative">
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadPNG}
                  disabled={!template || texts.length === 0}
                  className="flex-1 flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Download as PNG
                </button>
                <button
                  onClick={handleDownloadJSON}
                  disabled={!template || texts.length === 0}
                  className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Download as JSON
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                PNG for image export, JSON for saving editable design
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 