import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Pencil, Check, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export interface SavedApiKey {
  id: string;
  name: string;
  provider: 'gemini' | 'groq';
  key: string;
  createdAt: number;
}

const STORAGE_KEY = 'saved_api_keys';

interface SavedApiKeysProps {
  onSelectKey: (provider: 'gemini' | 'groq', key: string) => void;
}

export function SavedApiKeys({ onSelectKey }: SavedApiKeysProps) {
  const [savedKeys, setSavedKeys] = useState<SavedApiKey[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Form state for new key
  const [newName, setNewName] = useState('');
  const [newProvider, setNewProvider] = useState<'gemini' | 'groq'>('gemini');
  const [newKey, setNewKey] = useState('');

  // Load saved keys from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedKeys(JSON.parse(stored));
      } catch {
        console.error('Failed to parse saved keys');
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (keys: SavedApiKey[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    setSavedKeys(keys);
  };

  const handleAddKey = () => {
    if (!newName.trim() || !newKey.trim()) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập đầy đủ tên và API key',
        variant: 'destructive',
      });
      return;
    }

    const newSavedKey: SavedApiKey = {
      id: Date.now().toString(),
      name: newName.trim(),
      provider: newProvider,
      key: newKey.trim(),
      createdAt: Date.now(),
    };

    saveToStorage([...savedKeys, newSavedKey]);
    setNewName('');
    setNewKey('');
    setIsDialogOpen(false);
    
    toast({
      title: 'Đã lưu API key',
      description: `API key "${newSavedKey.name}" đã được lưu`,
    });
  };

  const handleDeleteKey = (id: string) => {
    const keyToDelete = savedKeys.find(k => k.id === id);
    saveToStorage(savedKeys.filter(k => k.id !== id));
    
    toast({
      title: 'Đã xoá API key',
      description: keyToDelete ? `Đã xoá "${keyToDelete.name}"` : 'Đã xoá API key',
    });
  };

  const handleStartEdit = (key: SavedApiKey) => {
    setEditingId(key.id);
    setEditName(key.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    
    saveToStorage(savedKeys.map(k => 
      k.id === id ? { ...k, name: editName.trim() } : k
    ));
    setEditingId(null);
    
    toast({
      title: 'Đã cập nhật',
      description: 'Tên API key đã được cập nhật',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUseKey = (key: SavedApiKey) => {
    onSelectKey(key.provider, key.key);
    
    toast({
      title: 'Đã chọn API key',
      description: `Đang sử dụng "${key.name}" cho ${key.provider === 'gemini' ? 'Google Gemini' : 'Groq'}`,
    });
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}${'•'.repeat(Math.min(key.length - 8, 20))}${key.substring(key.length - 4)}`;
  };

  if (savedKeys.length === 0 && !isDialogOpen) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Lưu API Key
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Lưu API Key mới
            </DialogTitle>
            <DialogDescription>
              Lưu API key để sử dụng lại sau này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên gợi nhớ</Label>
              <Input
                placeholder="VD: Gemini cá nhân"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nhà cung cấp</Label>
              <Select value={newProvider} onValueChange={(v) => setNewProvider(v as 'gemini' | 'groq')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder={newProvider === 'gemini' ? 'AIzaSy...' : 'gsk_...'}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={handleAddKey}>
              <Plus className="h-4 w-4 mr-2" />
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Key className="h-4 w-4 text-primary" />
          API Keys đã lưu
        </Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Lưu API Key mới
              </DialogTitle>
              <DialogDescription>
                Lưu API key để sử dụng lại sau này
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tên gợi nhớ</Label>
                <Input
                  placeholder="VD: Gemini cá nhân"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <Select value={newProvider} onValueChange={(v) => setNewProvider(v as 'gemini' | 'groq')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder={newProvider === 'gemini' ? 'AIzaSy...' : 'gsk_...'}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Huỷ
              </Button>
              <Button onClick={handleAddKey}>
                <Plus className="h-4 w-4 mr-2" />
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        {savedKeys.map((savedKey) => (
          <div
            key={savedKey.id}
            className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 group hover:border-primary/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              {editingId === savedKey.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              ) : (
                <>
                  <div className="font-medium text-sm truncate">{savedKey.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className={savedKey.provider === 'gemini' ? 'text-blue-500' : 'text-orange-500'}>
                      {savedKey.provider === 'gemini' ? 'Gemini' : 'Groq'}
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="font-mono">{maskKey(savedKey.key)}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {editingId === savedKey.id ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSaveEdit(savedKey.id)}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleUseKey(savedKey)}
                  >
                    Dùng
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleStartEdit(savedKey)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteKey(savedKey.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
