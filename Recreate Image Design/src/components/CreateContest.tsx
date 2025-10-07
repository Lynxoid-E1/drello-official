import { useState } from 'react';
import { apiCall, uploadFile } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Plus, X, Upload, HelpCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Contestant {
  name: string;
  description: string;
  mediaFiles: File[];
  mediaUrls: string[];
}

export function CreateContest({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Contest details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [votePrice, setVotePrice] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  // Customization
  const [bgColor, setBgColor] = useState('#ffffff');
  const [primaryColor, setPrimaryColor] = useState('#ff8c42');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textColor, setTextColor] = useState('#000000');

  // Contestants
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [currentContestant, setCurrentContestant] = useState<Contestant>({
    name: '',
    description: '',
    mediaFiles: [],
    mediaUrls: [],
  });

  const addContestant = () => {
    if (!currentContestant.name.trim()) {
      toast.error('Contestant name is required');
      return;
    }

    setContestants([...contestants, currentContestant]);
    setCurrentContestant({ name: '', description: '', mediaFiles: [], mediaUrls: [] });
    toast.success('Contestant added');
  };

  const removeContestant = (index: number) => {
    setContestants(contestants.filter((_, i) => i !== index));
  };

  const handleMediaUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setCurrentContestant({
      ...currentContestant,
      mediaFiles: [...currentContestant.mediaFiles, ...newFiles],
    });
  };

  const removeMedia = (index: number) => {
    setCurrentContestant({
      ...currentContestant,
      mediaFiles: currentContestant.mediaFiles.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Contest title is required');
      return;
    }

    if (contestants.length === 0) {
      toast.error('Add at least one contestant');
      return;
    }

    if (isPaid && !paymentLink.trim()) {
      toast.error('Payment link is required for paid voting');
      return;
    }

    setLoading(true);

    try {
      // Create contest
      const contestData = await apiCall('/contests', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          isPaid,
          votePrice: isPaid ? parseFloat(votePrice) : 0,
          paymentLink,
          customization: {
            bgColor,
            primaryColor,
            fontFamily,
            textColor,
          },
        }),
      });

      // Upload media and create contestants
      for (const contestant of contestants) {
        const mediaUrls = [];
        
        for (const file of contestant.mediaFiles) {
          try {
            const url = await uploadFile(file);
            mediaUrls.push(url);
          } catch (error) {
            console.error('Failed to upload file:', error);
          }
        }

        await apiCall(`/contests/${contestData.contest.id}/contestants`, {
          method: 'POST',
          body: JSON.stringify({
            name: contestant.name,
            description: contestant.description,
            mediaUrls,
          }),
        });
      }

      toast.success('Contest created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create contest:', error);
      toast.error('Failed to create contest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-gray-900 mb-6" style={{ fontSize: '28px' }}>
          Create New Contest
        </h2>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  step >= s ? 'bg-[#ff8c42] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              <span className={step >= s ? 'text-gray-900' : 'text-gray-500'}>
                {s === 1 ? 'Details' : s === 2 ? 'Contestants' : 'Customize'}
              </span>
              {s < 3 && <div className="w-12 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: Contest Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 space-y-6"
          >
            <div>
              <Label htmlFor="title">Contest Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Best Photography Contest 2024"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your contest..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Paid Voting</Label>
                <p className="text-sm text-gray-600">Require payment for each vote</p>
              </div>
              <Switch checked={isPaid} onCheckedChange={setIsPaid} />
            </div>

            {isPaid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="votePrice">Vote Price (USD) *</Label>
                  <Input
                    id="votePrice"
                    type="number"
                    step="0.01"
                    value={votePrice}
                    onChange={(e) => setVotePrice(e.target.value)}
                    placeholder="5.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="paymentLink">Flutterwave Payment Link *</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-[#ff8c42] hover:text-[#ff7d33]">
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>How to Get Flutterwave Payment Link</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                          <ol className="list-decimal list-inside space-y-2">
                            <li>Sign up or log in to your Flutterwave account at flutterwave.com</li>
                            <li>Go to "Payment Links" in your dashboard</li>
                            <li>Click "Create Payment Link"</li>
                            <li>Set up your payment link with the vote price</li>
                            <li>Copy the payment link and paste it here</li>
                          </ol>
                          <p className="text-gray-600">
                            Voters will be redirected to this link to complete payment before voting.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input
                    id="paymentLink"
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="https://flutterwave.com/pay/..."
                    className="mt-1"
                  />
                </div>
              </motion.div>
            )}

            <Button
              onClick={() => setStep(2)}
              className="w-full bg-[#ff8c42] hover:bg-[#ff7d33] text-white"
            >
              Continue to Contestants
            </Button>
          </motion.div>
        )}

        {/* Step 2: Contestants */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 space-y-4">
              <h3 className="text-gray-900" style={{ fontSize: '18px' }}>
                Add Contestant
              </h3>

              <div>
                <Label htmlFor="contestantName">Contestant Name *</Label>
                <Input
                  id="contestantName"
                  value={currentContestant.name}
                  onChange={(e) =>
                    setCurrentContestant({ ...currentContestant, name: e.target.value })
                  }
                  placeholder="Enter contestant name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contestantDesc">Description</Label>
                <Textarea
                  id="contestantDesc"
                  value={currentContestant.description}
                  onChange={(e) =>
                    setCurrentContestant({ ...currentContestant, description: e.target.value })
                  }
                  placeholder="Brief description..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Media (Images, Videos, Audio)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff8c42] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={(e) => handleMediaUpload(e.target.files)}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload media files</p>
                    <p className="text-sm text-gray-500">Images, videos, or audio</p>
                  </label>
                </div>

                {currentContestant.mediaFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {currentContestant.mediaFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          onClick={() => removeMedia(index)}
                          className="text-red-600 hover:text-red-700"
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
                variant="outline"
                className="w-full border-[#ff8c42] text-[#ff8c42] hover:bg-[#fff5eb]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contestant
              </Button>
            </div>

            {/* Contestants List */}
            {contestants.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-gray-900 mb-4" style={{ fontSize: '18px' }}>
                  Contestants ({contestants.length})
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {contestants.map((contestant, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-gray-900">{contestant.name}</p>
                          <p className="text-sm text-gray-600">
                            {contestant.mediaFiles.length} media file(s)
                          </p>
                        </div>
                        <Button
                          onClick={() => removeContestant(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#ff8c42] hover:bg-[#ff7d33] text-white"
                disabled={contestants.length === 0}
              >
                Continue to Customize
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Customization */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 space-y-6"
          >
            <h3 className="text-gray-900" style={{ fontSize: '18px' }}>
              Customize Voting Page
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <select
                  id="fontFamily"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-lg"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-3">Preview</p>
              <div
                className="rounded-lg p-8 text-center"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  fontFamily,
                }}
              >
                <h4 className="mb-2" style={{ fontSize: '20px' }}>{title || 'Contest Title'}</h4>
                <button
                  className="px-6 py-2 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Vote Now
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#ff8c42] hover:bg-[#ff7d33] text-white"
              >
                {loading ? 'Creating...' : 'Create Contest'}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
