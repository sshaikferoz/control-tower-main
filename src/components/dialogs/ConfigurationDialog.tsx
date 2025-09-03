import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ColorPicker } from 'primereact/colorpicker';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { FileUpload } from 'primereact/fileupload';
import { RadioButton } from 'primereact/radiobutton';
import { X } from 'lucide-react';
import { UIConfiguration } from '../../types/configuration';

interface ConfigurationDialogProps {
  visible: boolean;
  onHide: () => void;
  configuration: UIConfiguration;
  onSave: (config: UIConfiguration) => boolean;
  onReset: () => void;
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
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  const backgroundFileRef = useRef<FileUpload>(null);
  const logoFileRef = useRef<FileUpload>(null);

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
  const handleBackgroundUpload = async (event: any) => {
    const file = event.files[0];
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
        backgroundFileRef.current?.clear();
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }
  };

  // Handle logo file upload
  const handleLogoUpload = async (event: any) => {
    const file = event.files[0];
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
        logoFileRef.current?.clear();
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }
  };

  const handleSave = () => {
    const success = onSave(formData);
    setSaveMessage({
      type: success ? 'success' : 'error',
      text: success ? 'Configuration saved successfully!' : 'Failed to save configuration.',
    });
  };

  const handleReset = () => {
    onReset();
    setSaveMessage({
      type: 'success',
      text: 'Configuration reset to defaults.',
    });
  };

  const handleCancel = () => {
    setFormData(configuration);
    onHide();
  };

  const positionOptions = [
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Top Left', value: 'top-left' },
  ];

  const predefinedBackgrounds = [
    {
      label: 'Default Blue Gradient',
      value: `${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png`,
    },
    {
      label: 'Corporate Theme',
      value: `${process.env.NEXT_PUBLIC_BSP_NAME}/background/corporate.png`,
    },
    {
      label: 'Modern Abstract',
      value: `${process.env.NEXT_PUBLIC_BSP_NAME}/background/modern.png`,
    },
  ];

  const tabs = [
    { label: 'Background', icon: 'pi pi-image', id: 'background' },
    { label: 'Chatbot', icon: 'pi pi-comments', id: 'chatbot' },
    { label: 'Search', icon: 'pi pi-search', id: 'search' },
    { label: 'Branding', icon: 'pi pi-palette', id: 'branding' },
  ];

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1a35] to-[#1a3a6b]/50">
      <div className="relative max-h-[90vh] min-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#2a4a7b] bg-[#1a3a6b] p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">UI Configuration</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 transition-colors hover:text-white"
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
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background: { ...formData.background, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
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
                          onChange={() =>
                            setFormData({
                              ...formData,
                              background: { ...formData.background, useBase64: false },
                            })
                          }
                          className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
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
                          onChange={() =>
                            setFormData({
                              ...formData,
                              background: { ...formData.background, useBase64: true },
                            })
                          }
                          className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="bg-upload" className="text-gray-300">
                          Upload Image
                        </label>
                      </div>
                    </div>
                  </div>

                  {!formData.background.useBase64 && (
                    <>
                      {/* <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                          Background Preset
                        </label>
                        <select
                          value={formData.background.imageUrl}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              background: { ...formData.background, imageUrl: e.target.value },
                            });
                          }}
                          className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
                        >
                          <option value="">Select a background</option>
                          {predefinedBackgrounds.map((bg) => (
                            <option key={bg.value} value={bg.value}>
                              {bg.label}
                            </option>
                          ))}
                        </select>
                      </div> */}

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                          Custom Background URL
                        </label>
                        <input
                          type="text"
                          value={formData.background.imageUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              background: { ...formData.background, imageUrl: e.target.value },
                            })
                          }
                          placeholder="https://example.com/background.jpg"
                          className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
                        />
                        <small className="text-gray-400">Enter a custom background image URL</small>
                      </div>
                    </>
                  )}

                  {formData.background.useBase64 && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Upload Background Image
                      </label>
                      <div className="w-full rounded border-2 border-dashed border-[#3a5a8b] bg-[#2a4a7b] p-6 text-center hover:border-blue-500">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleBackgroundUpload({ files: [file] });
                            }
                          }}
                          className="hidden"
                          id="bg-file-upload"
                        />
                        <label
                          htmlFor="bg-file-upload"
                          className="cursor-pointer text-gray-300 hover:text-white"
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

                  {/* <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Background Opacity
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.background.opacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          background: {
                            ...formData.background,
                            opacity: parseInt(e.target.value) || 100,
                          },
                        })
                      }
                      className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
                    />
                  </div> */}

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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatbot: { ...formData.chatbot, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              {formData.chatbot.enabled && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Position</label>
                    <select
                      value={formData.chatbot.position}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chatbot: {
                            ...formData.chatbot,
                            position: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chatbot: { ...formData.chatbot, color: e.target.value },
                        })
                      }
                      className="h-12 w-10 rounded border border-[#3a5a8b] bg-[#2a4a7b] outline-none focus:border-blue-500"
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        search: { ...formData.search, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        search: { ...formData.search, placeholder: e.target.value },
                      })
                    }
                    placeholder="Enter search placeholder text"
                    className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, appName: e.target.value },
                    })
                  }
                  placeholder="mySCAI"
                  className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
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
                      onChange={() =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, useLogoBase64: false },
                        })
                      }
                      className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
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
                      onChange={() =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, useLogoBase64: true },
                        })
                      }
                      className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: { ...formData.branding, logoUrl: e.target.value },
                      })
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded border border-[#3a5a8b] bg-[#2a4a7b] p-3 text-white outline-none focus:border-blue-500"
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
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleLogoUpload({ files: [file] });
                        }
                      }}
                      className="hidden"
                      id="logo-file-upload"
                    />
                    <label
                      htmlFor="logo-file-upload"
                      className="cursor-pointer text-gray-300 hover:text-white"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, primaryColor: e.target.value },
                    })
                  }
                  className="h-12 w-10 rounded border border-[#3a5a8b] bg-[#2a4a7b] outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="absolute right-0 bottom-0 m-4 flex justify-end">
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={handleReset}
              className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleCancel}
              className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
