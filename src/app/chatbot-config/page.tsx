'use client';

import React, { useEffect, useState } from 'react';
import { sapODataService } from '@/services/sapODataService';

type ChatbotVariant = 'v1' | 'v2';

interface ChatbotConfigState {
    variant: ChatbotVariant;
    _metadata?: {
        configName?: string;
    };
}

const DEFAULT_CONFIG: ChatbotConfigState = {
    variant: 'v2',
};

const ChatbotConfigPage: React.FC = () => {
    const [config, setConfig] = useState<ChatbotConfigState>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const remoteConfig = await sapODataService.fetchUIConfig('chatbot');
                if (remoteConfig?.variant === 'v1' || remoteConfig?.variant === 'v2') {
                    setConfig(remoteConfig as ChatbotConfigState);
                    return;
                }

                // Backward compatibility for older configs that used version field
                if (remoteConfig?.version === 'non-streaming') {
                    setConfig({ variant: 'v1', _metadata: { configName: remoteConfig._metadata?.configName } });
                    return;
                }

                setConfig(DEFAULT_CONFIG);
            } catch (error) {
                console.error('Failed to load chatbot configuration', error);
                setStatus({ type: 'error', text: 'Failed to load configuration. Using defaults.' });
                setConfig(DEFAULT_CONFIG);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const saved = await sapODataService.saveUIConfig(
                'chatbot',
                { variant: config.variant },
                config._metadata?.configName
            );
            setConfig(saved as ChatbotConfigState);
            setStatus({ type: 'success', text: 'Chatbot variant saved successfully.' });
        } catch (error) {
            console.error('Failed to save chatbot configuration', error);
            setStatus({ type: 'error', text: 'Unable to save. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-3xl bg-gradient-to-r from-[#e6f5ff] to-[#f5ffef] p-[1px] shadow-lg">
                    <div className="rounded-3xl bg-white p-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-[#83BD01]">Chatbot Settings</p>
                                <h1 className="text-2xl font-semibold text-gray-900">Variant Management</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Choose which chatbot experience users get when visiting /chatbot.
                                </p>
                            </div>
                            <div className="rounded-full bg-[#f2ffe6] px-4 py-2 text-xs font-medium text-[#4c7a00]">
                                ConfigName: chatbot
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4">
                            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 hover:border-[#83BD01]">
                                <input
                                    type="radio"
                                    name="chatbot-version"
                                    value="v2"
                                    className="h-4 w-4 text-[#83BD01]"
                                    checked={config.variant === 'v2'}
                                    onChange={() => setConfig((prev) => ({ ...prev, variant: 'v2' }))}
                                    disabled={loading || saving}
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">v2 — streaming</p>
                                    <p className="text-xs text-gray-600">
                                        Users see responses token-by-token for faster perceived speed.
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 hover:border-[#83BD01]">
                                <input
                                    type="radio"
                                    name="chatbot-version"
                                    value="v1"
                                    className="h-4 w-4 text-[#83BD01]"
                                    checked={config.variant === 'v1'}
                                    onChange={() => setConfig((prev) => ({ ...prev, variant: 'v1' }))}
                                    disabled={loading || saving}
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">v1 — non-streaming</p>
                                    <p className="text-xs text-gray-600">
                                        Full reply is shown once the API returns the completed response.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {status && (
                            <div
                                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${status.type === 'success'
                                    ? 'border-green-100 bg-green-50 text-green-800'
                                    : 'border-red-100 bg-red-50 text-red-800'
                                    }`}
                            >
                                {status.text}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                                onClick={() => setConfig(DEFAULT_CONFIG)}
                                disabled={loading || saving}
                            >
                                Reset to default
                            </button>
                            <button
                                className="rounded-full bg-[#83BD01] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#74a800] disabled:cursor-not-allowed disabled:bg-gray-300"
                                onClick={handleSave}
                                disabled={loading || saving}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>

                        {loading && (
                            <p className="mt-4 text-sm text-gray-500">Loading configuration...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotConfigPage;
