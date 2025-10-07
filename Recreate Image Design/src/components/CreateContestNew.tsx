import { useState } from 'react';
import { CreateModeSelector } from './CreateModeSelector';
import { ContestEditor } from './ContestEditor';
import { apiCall, uploadFile } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface CreateContestNewProps {
  onSuccess: () => void;
  fromDashboard?: boolean;
}

export function CreateContestNew({ onSuccess, fromDashboard = false }: CreateContestNewProps) {
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'ai' | 'manual' | null>(null);

  const handleSelectMode = (mode: 'ai' | 'manual') => {
    setSelectedMode(mode);
    setShowModeSelector(false);
  };

  const handleSaveContest = async (contestData: any) => {
    try {
      toast.info('Creating your contest...');

      // Create the contest
      const contestResponse = await apiCall('/contests', {
        method: 'POST',
        body: JSON.stringify({
          title: contestData.title,
          description: contestData.description,
          isPaid: contestData.isPaid,
          votePrice: contestData.isPaid ? parseFloat(contestData.votePrice) : 0,
          paymentLink: contestData.paymentLink,
          customization: contestData.customization,
        }),
      });

      // Upload media and add contestants
      for (const contestant of contestData.contestants) {
        const mediaUrls = [];
        
        for (const file of contestant.mediaFiles) {
          try {
            const url = await uploadFile(file);
            mediaUrls.push(url);
          } catch (error) {
            console.error('Failed to upload file:', error);
            toast.error(`Failed to upload ${file.name}`);
          }
        }

        await apiCall(`/contests/${contestResponse.contest.id}/contestants`, {
          method: 'POST',
          body: JSON.stringify({
            name: contestant.name,
            description: contestant.description,
            mediaUrls,
          }),
        });
      }

      // Clear draft
      localStorage.removeItem('drello_contest_draft');

      toast.success('Contest created successfully! 🎉', {
        description: 'Your voting contest is now live and ready to share.',
        duration: 5000,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Failed to create contest:', error);
      toast.error('Failed to create contest', {
        description: error.message || 'Please try again or contact support.',
      });
    }
  };

  const handleDiscard = () => {
    if (selectedMode) {
      setSelectedMode(null);
      setShowModeSelector(true);
    } else {
      onSuccess();
    }
  };

  if (showModeSelector) {
    return (
      <CreateModeSelector
        isOpen={showModeSelector}
        onClose={() => onSuccess()}
        onSelectMode={handleSelectMode}
      />
    );
  }

  if (selectedMode === 'manual') {
    return (
      <ContestEditor
        onSave={handleSaveContest}
        onDiscard={handleDiscard}
      />
    );
  }

  return null;
}
