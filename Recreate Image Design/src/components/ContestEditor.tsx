import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, Eye, X, Users, Palette, Calendar, DollarSign, 
  Link as LinkIcon, Settings as SettingsIcon, Image, Video, Music, File,
  ChevronDown, ChevronRight, Lock, Upload, Trash2, Plus, AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { apiCall, uploadFile } from '../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface ContestType {
  id: string;
  label: string;
  icon: any;
  mediaType: 'image' | 'video' | 'audio' | 'file';
}

const contestTypes: ContestType[] = [
  { id: 'images', label: 'Pictures', icon: Image, mediaType: 'image' },
  { id: 'videos', label: 'Videos', icon: Video, mediaType: 'video' },
  { id: 'audio', label: 'Audio', icon: Music, mediaType: 'audio' },
  { id: 'files', label: 'Documents/Files', icon: File, mediaType: 'file' },
];

interface Contestant {
  id: string;
  name: string;
  description: string;
  mediaFiles: File[];
  mediaUrls: string[];
}

interface ContestData {
  type: string;
  title: string;
  description: string;
  isPaid: boolean;
  votePrice: string;
  currency: string;
  paymentLink: string;
  paymentProvider: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  customization: {
    bgColor: string;
    primaryColor: string;
    fontFamily: string;
    textColor: string;
    animation: string;
  };
  socialLinks: Array<{ platform: string; url: string }>;
  showDrelloBadge: boolean;
  voteMessage: string;
  contestants: Contestant[];
}

interface ContestEditorProps {
  onSave: (data: ContestData) => void;
  onDiscard: () => void;
}

export function ContestEditor({ onSave, onDiscard }: ContestEditorProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(true);
  const [activeSection, setActiveSection] = useState('contestants');
  const [contestData, setContestData] = useState<ContestData>({
    type: '',
    title: '',
    description: '',
    isPaid: false,
    votePrice: '5.00',
    currency: 'USD',
    paymentLink: '',
    paymentProvider: 'flutterwave',
    startDate: '',
    endDate: '',
    startTime: '00:00',
    endTime: '23:59',
    customization: {
      bgColor: '#ffffff',
      primaryColor: '#ff8c42',
      fontFamily: 'Inter',
      textColor: '#000000',
      animation: 'fade',
    },
    socialLinks: [],
    showDrelloBadge: true,
    voteMessage: 'Thank you for voting! 🎉',
    contestants: [],
  });

  const [currentContestant, setCurrentContestant] = useState<Contestant>({
    id: '',
    name: '',
    description: '',
    mediaFiles: [],
    mediaUrls: [],
  });

  const [saving, setSaving] = useState(false);
  const [showDraftInfo, setShowDraftInfo] = useState(false);

  // Load from draft
  useEffect(() => {
    const draft = localStorage.getItem('drello_contest_draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setContestData(parsedDraft);
        if (parsedDraft.type) {
          setShowTypeSelector(false);
        }
        toast.info('Draft loaded! Continue where you left off.');
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save to draft
  useEffect(() => {
    if (contestData.type) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('drello_contest_draft', JSON.stringify(contestData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [contestData]);

  const selectContestType = (type: string) => {
    setContestData({ ...contestData, type });
    setShowTypeSelector(false);
  };

  const handleMediaUpload = async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    
    // Check max contestants limit
    if (contestData.contestants.length >= 60) {
      toast.error('Maximum 60 contestants allowed');
      return;
    }

    setCurrentContestant({
      ...currentContestant,
      mediaFiles: [...currentContestant.mediaFiles, ...newFiles],
    });
  };

  const addContestant = () => {
    if (!currentContestant.name.trim()) {
      toast.error('Contestant name is required');
      return;
    }

    if (contestData.contestants.length >= 60) {
      toast.error('Maximum 60 contestants allowed');
      return;
    }

    const newContestant = {
      ...currentContestant,
      id: `contestant-${Date.now()}`,
    };

    setContestData({
      ...contestData,
      contestants: [...contestData.contestants, newContestant],
    });

    setCurrentContestant({
      id: '',
      name: '',
      description: '',
      mediaFiles: [],
      mediaUrls: [],
    });

    toast.success('Contestant added!');
  };

  const removeContestant = (id: string) => {
    setContestData({
      ...contestData,
      contestants: contestData.contestants.filter(c => c.id !== id),
    });
  };

  const handleSaveAsDraft = () => {
    localStorage.setItem('drello_contest_draft', JSON.stringify(contestData));
    toast.success('Draft saved!');
    setShowDraftInfo(true);
  };

  const handlePublish = async () => {
    // Check published contests limit
    try {
      const { contests } = await apiCall('/contests');
      if (contests && contests.length >= 2) {
        toast.error('Demo limit reached: Maximum 2 contests allowed', {
          description: 'This is a demonstration version. Contact us for full access.',
          duration: 6000,
        });
        return;
      }
    } catch (error) {
      console.error('Error checking contests:', error);
    }

    if (!contestData.title.trim()) {
      toast.error('Contest title is required');
      return;
    }

    if (contestData.contestants.length < 2) {
      toast.error('Add at least 2 contestants');
      return;
    }

    if (contestData.isPaid && !contestData.paymentLink.trim()) {
      toast.error('Payment link is required for paid voting');
      return;
    }

    setSaving(true);
    onSave(contestData);
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard this contest? All unsaved changes will be lost.')) {
      localStorage.removeItem('drello_contest_draft');
      onDiscard();
    }
  };

  if (showTypeSelector) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-[#fff5eb] to-[#fffbf5]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full"
        >
          <h2 className="text-gray-900 text-center mb-3" style={{ fontSize: '36px', fontWeight: 'bold' }}>
            What type of voting contest?
          </h2>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Select the content type your contestants will be competing with
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {contestTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => selectContestType(type.id)}
                className="bg-white rounded-2xl p-8 border-4 border-transparent hover:border-[#ff8c42] transition-all hover:shadow-xl group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff8c42] to-[#ff9d5c] flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-900 text-center" style={{ fontSize: '18px', fontWeight: '600' }}>
                  {type.label}
                </h3>
              </motion.button>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              onClick={handleDiscard}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-[#f5f4f0]">
      {/* Left Panel - Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDiscard}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-sm text-gray-600">
              {contestData.contestants.length}/60 contestants
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveAsDraft}
              variant="outline"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving}
              className="bg-gradient-to-r from-[#ff8c42] to-[#ff9d5c] hover:from-[#ff7d33] hover:to-[#ff8c42] text-white"
            >
              {saving ? 'Publishing...' : 'Publish Contest'}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-3xl mx-auto">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="contestants">Contestants</TabsTrigger>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Contestants Tab */}
              <TabsContent value="contestants" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                    Add Contestant
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label>Contestant Name *</Label>
                      <Input
                        value={currentContestant.name}
                        onChange={(e) => setCurrentContestant({ ...currentContestant, name: e.target.value })}
                        placeholder="Enter contestant name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={currentContestant.description}
                        onChange={(e) => setCurrentContestant({ ...currentContestant, description: e.target.value })}
                        placeholder="Brief description (optional)"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Upload Media</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff8c42] transition-colors">
                        <input
                          type="file"
                          multiple
                          accept={
                            contestData.type === 'images' ? 'image/*' :
                            contestData.type === 'videos' ? 'video/*' :
                            contestData.type === 'audio' ? 'audio/*' : '*'
                          }
                          onChange={(e) => handleMediaUpload(e.target.files)}
                          className="hidden"
                          id="media-upload"
                        />
                        <label htmlFor="media-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload</p>
                        </label>
                      </div>
                      
                      {currentContestant.mediaFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {currentContestant.mediaFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm truncate">{file.name}</span>
                              <button
                                onClick={() => setCurrentContestant({
                                  ...currentContestant,
                                  mediaFiles: currentContestant.mediaFiles.filter((_, i) => i !== idx)
                                })}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={addContestant}
                      className="w-full bg-[#ff8c42] hover:bg-[#ff7d33]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contestant
                    </Button>
                  </div>
                </Card>

                {/* Contestants List */}
                {contestData.contestants.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-gray-900 mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                      Contestants ({contestData.contestants.length})
                    </h3>
                    <div className="space-y-3">
                      {contestData.contestants.map((contestant) => (
                        <div key={contestant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-gray-900 font-medium">{contestant.name}</p>
                            <p className="text-sm text-gray-600">{contestant.mediaFiles.length} media file(s)</p>
                          </div>
                          <Button
                            onClick={() => removeContestant(contestant.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Basic Info Tab - Continue in next message due to length... */}
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Live Preview (simplified for now) */}
      <div className="w-96 border-l border-gray-300 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#ff8c42]" />
          <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>
            Live Preview
          </span>
        </div>
        <div className="flex-1 p-4 overflow-auto" style={{ backgroundColor: contestData.customization.bgColor }}>
          <div className="text-center">
            <h3 className="mb-2" style={{ color: contestData.customization.textColor, fontSize: '24px' }}>
              {contestData.title || 'Your Contest Title'}
            </h3>
            <p className="text-sm opacity-70 mb-4" style={{ color: contestData.customization.textColor }}>
              {contestData.description || 'Contest description will appear here'}
            </p>
            <div className="space-y-3">
              {contestData.contestants.slice(0, 3).map((c, idx) => (
                <div key={c.id} className="bg-white/90 p-3 rounded-lg">
                  <p className="text-sm font-medium">{c.name}</p>
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    style={{ backgroundColor: contestData.customization.primaryColor }}
                  >
                    Vote
                  </Button>
                </div>
              ))}
              {contestData.contestants.length > 3 && (
                <p className="text-xs opacity-70">+{contestData.contestants.length - 3} more</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Draft Info Dialog */}
      <Dialog open={showDraftInfo} onOpenChange={setShowDraftInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draft Saved Successfully!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Your contest draft has been saved. You can continue editing it anytime by visiting this page.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Pro Tip:</strong> To unlock the draft feature permanently, get a code from{' '}
                <a 
                  href="https://drellocode.netlify.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#ff8c42] hover:underline"
                >
                  drellocode.netlify.app
                </a>
              </p>
            </div>
            <Button onClick={() => setShowDraftInfo(false)} className="w-full">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
