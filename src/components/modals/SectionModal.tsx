import React, { useState, useEffect } from 'react';
import { Section, SectionModalState } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SectionModalProps {
  modal: SectionModalState;
  onClose: () => void;
  onSave: (section: Omit<Section, 'id' | 'createdAt' | 'reports'>) => void;
}

export const SectionModal: React.FC<SectionModalProps> = ({ modal, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (modal.section) {
      setName(modal.section.name);
      setDescription(modal.section.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setIsSaving(false);
  }, [modal.section, modal.isOpen]);

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;

    setIsSaving(true);

    try {
      onSave({
        name: name.trim(),
        description: description.trim(),
      });
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!modal.isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {modal.mode === 'add' ? 'Create New Section' : 'Edit Section'}
          </h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Section Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter section name"
            disabled={isSaving}
            required
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter section description"
              disabled={isSaving}
              rows={3}
              className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Saving...' : modal.mode === 'add' ? 'Create Section' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
