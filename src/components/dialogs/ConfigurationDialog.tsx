import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { UIConfiguration } from '../../types/configuration';

interface ConfigurationDialogProps {
  visible: boolean;
  onHide: () => void;
  configuration: UIConfiguration;
  onSave: (config: UIConfiguration) => Promise<any>;
  onReset: () => Promise<void>;
}

export const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({
  visible,
  onHide,
  configuration,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<UIConfiguration>(configuration);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  const backgroundFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', description: '' });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  // Update form data when configuration changes
  useEffect(() => {
    setFormData(configuration);
  }, [configuration]);

  // Update previews when form data changes
  useEffect(() => {
    if (formData.background.useBase64 && formData.background.imageBase64) {
      setBackgroundPreview(formData.background.imageBase64);
    } else if (formData.background.imageUrl) {
      setBackgroundPreview(formData.background.imageUrl);
    }
  }, [formData.background]);

  useEffect(() => {
    if (formData.branding.useLogoBase64 && formData.branding.logoBase64) {
      setLogoPreview(formData.branding.logoBase64);
    } else if (formData.branding.logoUrl) {
      setLogoPreview(formData.branding.logoUrl);
    }
  }, [formData.branding]);

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  // File to base64 conversion utility
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle background file upload
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData({
          ...formData,
          background: {
            ...formData.background,
            imageBase64: base64,
            useBase64: true,
          },
        });
        if (backgroundFileRef.current) {
          backgroundFileRef.current.value = '';
        }
      } catch (error) {
        console.error('Error converting file to base64:', error);
        setSaveMessage({
          type: 'error',
          text: 'Failed to process background image.',
        });
      }
    }
  };

  // Handle logo file upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData({
          ...formData,
          branding: {
            ...formData.branding,
            logoBase64: base64,
            useLogoBase64: true,
          },
        });
        if (logoFileRef.current) {
          logoFileRef.current.value = '';
        }
      } catch (error) {
        console.error('Error converting file to base64:', error);
        setSaveMessage({
          type: 'error',
          text: 'Failed to process logo image.',
        });
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const success = await onSave(formData);
      if (success) {
        setSaveMessage({
          type: 'success',
          text: 'Configuration saved successfully!',
        });
        // Close dialog after a short delay on successful save
        setTimeout(() => {
          onHide();
        }, 1500);
      } else {
        setSaveMessage({
          type: 'error',
          text: 'Failed to save configuration. Please try again.',
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({
        type: 'error',
        text: 'An error occurred while saving. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setSaveMessage(null);

    try {
      await onReset();
      setSaveMessage({
        type: 'success',
        text: 'Configuration reset to defaults successfully!',
      });
      // The parent component will update the configuration prop
    } catch (error) {
      console.error('Reset error:', error);
      setSaveMessage({
        type: 'error',
        text: 'Failed to reset configuration. Please try again.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancel = () => {
    setFormData(configuration);
    setSaveMessage(null);
    onHide();
  };

  const positionOptions = [
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Top Left', value: 'top-left' },
  ];

  const tabs = [
    { label: 'Background', icon: 'pi pi-image', id: 'background' },
    { label: 'Chatbot', icon: 'pi pi-comments', id: 'chatbot' },
    { label: 'Search', icon: 'pi pi-search', id: 'search' },
    { label: 'Branding', icon: 'pi pi-palette', id: 'branding' },
    { label: 'Announcement', icon: 'pi pi-megaphone', id: 'announcement' },
    { label: 'Dashboard', icon: 'pi pi-th-large', id: 'dashboard' },
  ];
  const addAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.description.trim()) {
      return;
    }

    const announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title.trim(),
      description: newAnnouncement.description.trim(),
    };

    setFormData({
      ...formData,
      announcement: {
        ...formData.announcement,
        items: [...(formData.announcement?.items || []), announcement],
      },
    });

    setNewAnnouncement({ title: '', description: '' });
  };

  const updateAnnouncement = (id: string, updates: { title?: string; description?: string }) => {
    setFormData({
      ...formData,
      announcement: {
        ...formData.announcement,
        items:
          formData.announcement?.items?.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ) || [],
      },
    });
  };

  const deleteAnnouncement = (id: string) => {
    setFormData({
      ...formData,
      announcement: {
        ...formData.announcement,
        items: formData.announcement?.items?.filter((item) => item.id !== id) || [],
      },
    });
  };

  const moveAnnouncement = (index: number, direction: 'up' | 'down') => {
    const items = [...(formData.announcement?.items || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

    setFormData({
      ...formData,
      announcement: {
        ...formData.announcement,
        items,
      },
    });
  };
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/50">
      <div className="relative max-h-[90vh] min-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">UI Configuration</h2>
            {(isSaving || isResetting) && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
                {isSaving ? 'Saving...' : 'Resetting...'}
              </div>
            )}
          </div>
          <button
            onClick={handleCancel}
            disabled={isSaving || isResetting}
            className="text-gray-400 transition-colors hover:text-white disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {saveMessage && (
          <div
            className={`mb-4 rounded p-3 text-sm ${
              saveMessage.type === 'success'
                ? 'border border-green-700 bg-green-900/50 text-green-300'
                : 'border border-red-700 bg-red-900/50 text-red-300'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Custom Tab Navigation */}
        <div className="mb-6">
          <div className="flex border-b border-[#3a5a8b]">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                disabled={isSaving || isResetting}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                  activeTab === index
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <i className={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Background Settings */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">
                  Enable Background Image
                </label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.background.enabled}
                    disabled={isSaving || isResetting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background: { ...formData.background, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none peer-disabled:opacity-50 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              {formData.background.enabled && (
                <>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-300">
                      Background Source
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="bg-url"
                          checked={!formData.background.useBase64}
                          disabled={isSaving || isResetting}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              background: { ...formData.background, useBase64: false },
                            })
                          }
                          className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="bg-url" className="text-gray-300">
                          Use Image URL
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="bg-upload"
                          checked={formData.background.useBase64}
                          disabled={isSaving || isResetting}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              background: { ...formData.background, useBase64: true },
                            })
                          }
                          className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="bg-upload" className="text-gray-300">
                          Upload Image
                        </label>
                      </div>
                    </div>
                  </div>

                  {!formData.background.useBase64 && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Custom Background URL
                      </label>
                      <input
                        type="text"
                        value={formData.background.imageUrl}
                        disabled={isSaving || isResetting}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            background: { ...formData.background, imageUrl: e.target.value },
                          })
                        }
                        placeholder="https://example.com/background.jpg"
                        className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                      <small className="text-gray-400">Enter a custom background image URL</small>
                    </div>
                  )}

                  {formData.background.useBase64 && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Upload Background Image
                      </label>
                      <div className="w-full rounded border-2 border-dashed border-[#3a5a8b] bg-[#2a4a7b] p-6 text-center hover:border-blue-500">
                        <input
                          ref={backgroundFileRef}
                          type="file"
                          accept="image/*"
                          disabled={isSaving || isResetting}
                          onChange={handleBackgroundUpload}
                          className="hidden"
                          id="bg-file-upload"
                        />
                        <label
                          htmlFor="bg-file-upload"
                          className={`cursor-pointer text-gray-300 hover:text-white ${
                            isSaving || isResetting ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          <i className="pi pi-upload mb-2 text-2xl" />
                          <div>Choose Background Image</div>
                          <small className="text-gray-400">
                            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                          </small>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Background Preview */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Preview</label>
                    <div
                      className="h-24 w-full overflow-hidden rounded border border-[#3a5a8b] bg-[#2a4a7b]"
                      style={{
                        backgroundImage: backgroundPreview
                          ? `url('${backgroundPreview}')`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: formData.background.opacity / 100,
                      }}
                    >
                      {!backgroundPreview && (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          No background image selected
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Chatbot Settings */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Enable Chatbot</label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.chatbot.enabled}
                    disabled={isSaving || isResetting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatbot: { ...formData.chatbot, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none peer-disabled:opacity-50 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              {formData.chatbot.enabled && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Position</label>
                    <select
                      value={formData.chatbot.position}
                      disabled={isSaving || isResetting}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chatbot: {
                            ...formData.chatbot,
                            position: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      {positionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={formData.chatbot.color}
                      disabled={isSaving || isResetting}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chatbot: { ...formData.chatbot, color: e.target.value },
                        })
                      }
                      className="h-12 w-10 rounded border border-[#3a5a8b] bg-[#2a4a7b] outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Chatbot Preview */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Preview</label>
                    <div className="relative h-20 w-full rounded border border-[#3a5a8b] bg-[#2a4a7b]">
                      <div
                        className={`absolute flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${
                          formData.chatbot.position.includes('right') ? 'right-3' : 'left-3'
                        } ${formData.chatbot.position.includes('top') ? 'top-3' : 'bottom-3'}`}
                        style={{ backgroundColor: formData.chatbot.color }}
                      >
                        <i className="pi pi-comments text-sm text-white" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Search Settings */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Enable Search</label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.search.enabled}
                    disabled={isSaving || isResetting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        search: { ...formData.search, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none peer-disabled:opacity-50 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              {formData.search.enabled && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Search Placeholder
                  </label>
                  <input
                    type="text"
                    value={formData.search.placeholder}
                    disabled={isSaving || isResetting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        search: { ...formData.search, placeholder: e.target.value },
                      })
                    }
                    placeholder="Enter search placeholder text"
                    className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <small className="text-gray-400">
                    This text will appear in the search input field
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Branding Settings */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Application Name
                </label>
                <input
                  type="text"
                  value={formData.branding.appName}
                  disabled={isSaving || isResetting}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, appName: e.target.value },
                    })
                  }
                  placeholder="mySCAI"
                  className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-300">Logo Source</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="logo-url"
                      checked={!formData.branding.useLogoBase64}
                      disabled={isSaving || isResetting}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, useLogoBase64: false },
                        })
                      }
                      className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label htmlFor="logo-url" className="text-gray-300">
                      Use Logo URL
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="logo-upload"
                      checked={formData.branding.useLogoBase64}
                      disabled={isSaving || isResetting}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, useLogoBase64: true },
                        })
                      }
                      className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label htmlFor="logo-upload" className="text-gray-300">
                      Upload Logo
                    </label>
                  </div>
                </div>
              </div>

              {!formData.branding.useLogoBase64 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Logo URL</label>
                  <input
                    type="text"
                    value={formData.branding.logoUrl}
                    disabled={isSaving || isResetting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: { ...formData.branding, logoUrl: e.target.value },
                      })
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <small className="text-gray-400">Leave empty to use default logo</small>
                </div>
              )}

              {formData.branding.useLogoBase64 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Upload Logo
                  </label>
                  <div className="w-full rounded border-2 border-dashed border-[#3a5a8b] bg-[#2a4a7b] p-6 text-center hover:border-blue-500">
                    <input
                      ref={logoFileRef}
                      type="file"
                      accept="image/*"
                      disabled={isSaving || isResetting}
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-file-upload"
                    />
                    <label
                      htmlFor="logo-file-upload"
                      className={`cursor-pointer text-gray-300 hover:text-white ${
                        isSaving || isResetting ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <i className="pi pi-upload mb-2 text-2xl" />
                      <div>Choose Logo Image</div>
                      <small className="text-gray-400">
                        Maximum file size: 2MB. Recommended: square images (PNG with transparency)
                      </small>
                    </label>
                  </div>
                </div>
              )}

              {logoPreview && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Logo Preview
                  </label>
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border border-[#3a5a8b] bg-gradient-to-r from-blue-800 to-blue-600">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={formData.branding.primaryColor}
                  disabled={isSaving || isResetting}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, primaryColor: e.target.value },
                    })
                  }
                  className="h-12 w-10 rounded border border-[#3a5a8b] bg-[#2a4a7b] outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Dashboard Settings */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Dashboard Type
                </label>
                <select
                  value={formData.dashboard?.type || 'Sections'}
                  disabled={isSaving || isResetting}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dashboard: {
                        ...formData.dashboard,
                        type: e.target.value as 'Sections' | 'Report',
                      },
                    })
                  }
                  className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="Sections">Sections</option>
                  <option value="Report">Report</option>
                </select>
                <small className="mt-1 block text-gray-400">
                  When set to "Report", section headers and lines will be hidden in non-edit mode
                </small>
              </div>
            </div>
          )}

          {/* Announcement Settings */}
          {activeTab === 4 && (
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">
                  Enable Announcement
                </label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.announcement?.enabled}
                    disabled={isSaving || isResetting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        announcement: { ...formData.announcement, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none peer-disabled:opacity-50 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              {formData.announcement?.enabled && (
                <>
                  {/* Auto Scroll Settings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-scroll-check"
                        checked={formData.announcement.autoScroll}
                        disabled={isSaving || isResetting}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            announcement: {
                              ...formData.announcement,
                              autoScroll: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <label htmlFor="auto-scroll-check" className="text-gray-300">
                        Auto Scroll
                      </label>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Delay (ms)</label>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        value={formData.announcement.scrollDelay}
                        disabled={isSaving || isResetting || !formData.announcement.autoScroll}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            announcement: {
                              ...formData.announcement,
                              scrollDelay: parseInt(e.target.value) || 5000,
                            },
                          })
                        }
                        className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-2 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Direction</label>
                      <select
                        value={formData.announcement.scrollDirection}
                        disabled={isSaving || isResetting || !formData.announcement.autoScroll}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            announcement: {
                              ...formData.announcement,
                              scrollDirection: e.target.value as 'left' | 'right',
                            },
                          })
                        }
                        className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-2 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="left">Left to Right</option>
                        <option value="right">Right to Left</option>
                      </select>
                    </div>
                  </div>

                  {/* Add New Announcement */}
                  <div className="rounded border border-[#3a5a8b] bg-[#2a4a7b] p-4">
                    <h3 className="mb-3 font-medium text-white">Add New Announcement</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm text-gray-300">Title</label>
                        <input
                          type="text"
                          value={newAnnouncement.title}
                          disabled={isSaving || isResetting}
                          onChange={(e) =>
                            setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                          }
                          placeholder="Enter announcement title"
                          className="w-full rounded border border-[#3a5a8b] bg-[#1a2a4b] p-2 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-gray-300">Description</label>
                        <textarea
                          value={newAnnouncement.description}
                          disabled={isSaving || isResetting}
                          onChange={(e) =>
                            setNewAnnouncement({ ...newAnnouncement, description: e.target.value })
                          }
                          placeholder="Enter announcement description"
                          rows={3}
                          className="w-full resize-none rounded border border-[#3a5a8b] bg-[#1a2a4b] p-2 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                      </div>
                      <button
                        onClick={addAnnouncement}
                        disabled={
                          isSaving ||
                          isResetting ||
                          !newAnnouncement.title.trim() ||
                          !newAnnouncement.description.trim()
                        }
                        className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <i className="pi pi-plus mr-2" />
                        Add Announcement
                      </button>
                    </div>
                  </div>

                  {/* List of Announcements */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">
                        Announcements ({formData.announcement?.items?.length || 0})
                      </h3>
                    </div>

                    {formData.announcement?.items && formData.announcement.items.length > 0 ? (
                      <div className="space-y-2">
                        {formData.announcement.items.map((item, index) => (
                          <div
                            key={item.id}
                            className="rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3"
                          >
                            {editingAnnouncementId === item.id ? (
                              // Edit Mode
                              <div className="space-y-3">
                                <div>
                                  <label className="mb-1 block text-xs text-gray-400">Title</label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    disabled={isSaving || isResetting}
                                    onChange={(e) =>
                                      updateAnnouncement(item.id, { title: e.target.value })
                                    }
                                    className="w-full rounded border border-[#3a5a8b] bg-[#1a2a4b] p-2 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-gray-400">
                                    Description
                                  </label>
                                  <textarea
                                    value={item.description}
                                    disabled={isSaving || isResetting}
                                    onChange={(e) =>
                                      updateAnnouncement(item.id, { description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full resize-none rounded border border-[#3a5a8b] bg-[#1a2a4b] p-2 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingAnnouncementId(null)}
                                    disabled={isSaving || isResetting}
                                    className="rounded bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                                  >
                                    <i className="pi pi-check mr-1" />
                                    Done
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAnnouncementId(null);
                                      // Reset to original values if needed
                                    }}
                                    disabled={isSaving || isResetting}
                                    className="rounded bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div>
                                <div className="mb-2 flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-white">{item.title}</h4>
                                    <p className="text-sm text-gray-300">{item.description}</p>
                                  </div>
                                  <span className="ml-2 rounded bg-blue-600/20 px-2 py-1 text-xs text-blue-300">
                                    #{index + 1}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => setEditingAnnouncementId(item.id)}
                                    disabled={isSaving || isResetting}
                                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    <i className="pi pi-pencil mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteAnnouncement(item.id)}
                                    disabled={isSaving || isResetting}
                                    className="rounded bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                  >
                                    <i className="pi pi-trash mr-1" />
                                    Delete
                                  </button>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => moveAnnouncement(index, 'up')}
                                      disabled={index === 0 || isSaving || isResetting}
                                      className="flex items-center justify-center rounded bg-gray-600 px-2.5 py-1.5 text-sm text-white transition-colors hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Move up"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => moveAnnouncement(index, 'down')}
                                      disabled={
                                        index === formData.announcement.items.length - 1 ||
                                        isSaving ||
                                        isResetting
                                      }
                                      className="flex items-center justify-center rounded bg-gray-600 px-2.5 py-1.5 text-sm text-white transition-colors hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Move down"
                                    >
                                      ↓
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded border border-dashed border-[#3a5a8b] bg-[#2a4a7b] p-8 text-center">
                        <i className="pi pi-megaphone mb-2 text-3xl text-gray-500" />
                        <p className="text-gray-400">No announcements yet. Add one above!</p>
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  {formData.announcement?.items && formData.announcement.items.length > 0 && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Preview (First Announcement)
                      </label>
                      <div className="overflow-hidden rounded-lg bg-gradient-to-r from-[#00214E] to-[#0164B0] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#83bd01]">
                            <div className="h-5 w-5 rounded-sm bg-white"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="mb-1 text-base leading-tight font-semibold text-white">
                              {formData.announcement.items[0].title}
                            </h3>
                            <p className="line-clamp-2 text-sm leading-tight text-white/90">
                              {formData.announcement.items[0].description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="absolute right-0 bottom-0 m-4 flex justify-end">
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={handleReset}
              disabled={isSaving || isResetting}
              className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResetting ? 'Resetting...' : 'Reset to Defaults'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving || isResetting}
              className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isResetting}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
