import { useState, useEffect, useRef } from 'react';
import { Send, Menu, Copy, Trash2 } from 'lucide-react';
import { cn } from './lib/utils';
import { models } from './lib/models';
import { sendMessage, Message } from './lib/api';
import { ImageUpload } from './components/ImageUpload';
import { VoiceInput } from './components/VoiceInput';
import { encryptApiKey, getDecryptedApiKey, removeApiKey } from './lib/crypto';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [modelApiKeys, setModelApiKeys] = useState<Record<string, string>>({});
  const [showSidebar, setShowSidebar] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Load saved API keys for each model
  useEffect(() => {
    const loadedKeys: Record<string, string> = {};
    models.forEach(model => {
      const savedKey = getDecryptedApiKey(model.id);
      if (savedKey) {
        loadedKeys[model.id] = savedKey;
      }
    });
    setModelApiKeys(loadedKeys);
  }, []);

  const handleApiKeyChange = (modelId: string, newKey: string) => {
    setModelApiKeys(prev => ({ ...prev, [modelId]: newKey }));
    if (newKey) {
      encryptApiKey(newKey, modelId);
    } else {
      removeApiKey(modelId);
    }
  };

  const handleApiKeySubmit = (modelId: string, apiKey: string) => {
    if (!apiKey.trim()) {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
      toast.textContent = 'الرجاء إدخال مفتاح صحيح';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
      return;
    }

    encryptApiKey(apiKey.trim(), modelId);
    setModelApiKeys(prev => ({ ...prev, [modelId]: apiKey.trim() }));
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
    toast.textContent = 'تم حفظ المفتاح بنجاح';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);

    // Select the model after setting its key
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      toast.textContent = 'تم النسخ بنجاح';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('هل أنت متأكد من مسح المحادثة؟')) {
      setMessages([]);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      toast.textContent = 'تم مسح المحادثة';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const newMessage: Message = {
      role: 'user',
      content: input,
      ...(selectedImage && { image: selectedImage })
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await sendMessage(
        [...messages, newMessage],
        selectedModel,
        modelApiKeys[selectedModel.id]
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ ما';
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
      toast.textContent = errorMessage;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out z-30",
        "bg-white dark:bg-gray-800 w-full md:w-80 shadow-lg overflow-y-auto",
        showSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4">
          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setShowSidebar(false)}
            className="md:hidden absolute left-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Models */}
          <h2 className="text-xl font-bold mb-6 text-right">النماذج المتاحة</h2>
          <div className="space-y-4">
            {models.map(model => (
              <div key={model.id} className="p-4 rounded-lg border dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setSelectedModel(model)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-colors w-full text-right",
                      selectedModel.id === model.id
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {model.name}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {model.defaultApiKey ? "✓ مفتاح افتراضي" : ""}
                  </div>
                  <form 
                    className="flex gap-2" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApiKeySubmit(model.id, modelApiKeys[model.id] || '');
                    }}
                  >
                    <input
                      type="password"
                      value={modelApiKeys[model.id] || ''}
                      onChange={(e) => handleApiKeyChange(model.id, e.target.value)}
                      placeholder={`مفتاح API خاص بـ ${model.name}`}
                      className="flex-1 p-3 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      dir="rtl"
                    />
                    <button
                      type="submit"
                      className="p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                      title="حفظ المفتاح"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          {/* App Name */}
          <div className="text-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-arabic">العراف</span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={showSidebar ? "إخفاء القائمة" : "إظهار القائمة"}
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-lg font-medium truncate">{selectedModel.name}</span>
            </div>
            <button
              type="button"
              onClick={handleClearChat}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
              title="مسح المحادثة"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-4 p-4 rounded-lg max-w-3xl mx-auto",
                message.role === 'user'
                  ? "bg-blue-500 text-white mr-auto ml-4 md:ml-12"
                  : "bg-white dark:bg-gray-800 ml-auto mr-4 md:mr-12"
              )}
            >
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 text-right whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className="p-1.5 hover:bg-black/10 rounded-lg shrink-0"
                    title="نسخ الرسالة"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Uploaded"
                    className="max-w-full md:max-w-xs rounded-lg"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} ref={formRef} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 sticky bottom-0">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex gap-2">
              <div className="flex gap-2 md:gap-3">
                <ImageUpload
                  onImageSelect={setSelectedImage}
                  selectedImage={selectedImage}
                  onClearImage={handleClearImage}
                />
                <VoiceInput
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  onTranscription={setInput}
                />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className={cn(
                "p-3 rounded-lg transition-colors shrink-0",
                isLoading
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}