import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Trash2
} from 'lucide-react';
import { getStoredGeminiKey, setStoredGeminiKey } from '../services/preAssessmentService';

interface AiModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export const AiModelConfigModal: React.FC<AiModelConfigModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverHasKey, setServerHasKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredGeminiKey();
      setApiKey(stored);
      checkExistingStatus(stored);
    }
  }, [isOpen]);

  const checkExistingStatus = async (clientKey: string) => {
    try {
      const headers: Record<string, string> = {};
      if (clientKey) headers['x-gemini-api-key'] = clientKey;
      
      const endpoint = clientKey ? '/api/ai/check-status?validate=true' : '/api/ai/check-status';
      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        setServerHasKey(data.source === 'server');
        if (data.status === 'active') {
          setStatusMessage({ type: 'success', text: 'Active & Verified: Your Gemini API key is working perfectly.' });
        } else if (data.status === 'invalid_or_expired') {
          setStatusMessage({ type: 'error', text: data.message || 'Key Expired or Invalid: Please generate a new key on Google AI Studio.' });
        } else if (data.status === 'quota_exceeded') {
          setStatusMessage({ type: 'error', text: data.message || 'Quota Exceeded: Daily free tier limit reached.' });
        } else if (data.source === 'server') {
          setStatusMessage({ type: 'success', text: 'Active: Using server-configured Gemini environment key.' });
        } else {
          setStatusMessage({ type: 'info', text: 'No Gemini key detected. Using local NCERT/CBSE curriculum engine.' });
        }
      }
    } catch {
      setStatusMessage({ type: 'info', text: 'Curriculum engine active (offline/local mode).' });
    }
  };

  const handleTestAndSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Gemini API key or click "Clear Key" to use the local engine.' });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ai/check-status?validate=true', {
        headers: { 'x-gemini-api-key': trimmed }
      });
      const data = await res.json();

      if (data.valid) {
        setStoredGeminiKey(trimmed);
        setStatusMessage({
          type: 'success',
          text: data.message || 'Key Verified & Active! Real-time Gemini LLM question generation & chapter extraction is enabled.'
        });
        if (onKeyUpdated) onKeyUpdated(true);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || 'Key validation failed. The key may be invalid, revoked, or quota exceeded.'
        });
      }
    } catch (err: any) {
      setStoredGeminiKey(trimmed);
      setStatusMessage({
        type: 'info',
        text: 'Key saved locally. Note: could not verify live connectivity right now.'
      });
      if (onKeyUpdated) onKeyUpdated(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClearKey = () => {
    setStoredGeminiKey('');
    setApiKey('');
    setStatusMessage({
      type: 'info',
      text: 'Switched to built-in NCERT/CBSE Curriculum Engine. Questions will be generated deterministically.'
    });
    if (onKeyUpdated) onKeyUpdated(serverHasKey);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '28px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 6px 16px rgba(79, 70, 229, 0.3)'
          }}>
            <Cpu size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              AI Model & LLM Settings
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '2px 0 0' }}>
              Configure live Google Gemini AI for chapter parsing & question generation.
            </p>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : statusMessage.type === 'error' ? '#FEF2F2' : '#EFF6FF',
            border: `1.5px solid ${statusMessage.type === 'success' ? '#A7F3D0' : statusMessage.type === 'error' ? '#FECACA' : '#BFDBFE'}`,
            color: statusMessage.type === 'success' ? '#065F46' : statusMessage.type === 'error' ? '#991B1B' : '#1E40AF',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} color="#10B981" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle size={18} color="#EF4444" />
            ) : (
              <ShieldCheck size={18} color="#3B82F6" />
            )}
            <span style={{ fontWeight: 600, flex: 1 }}>{statusMessage.text}</span>
          </div>
        )}

        {/* API Key Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={16} color="#4F46E5" />
            <span>Google Gemini API Key</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                padding: '12px 42px 12px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'monospace',
                backgroundColor: '#F8FAFC'
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.78rem',
                color: '#4F46E5',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <span>Get a free Gemini API key from Google AI Studio</span>
              <ExternalLink size={12} />
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {apiKey && (
                <>
                  <button
                    type="button"
                    onClick={() => checkExistingStatus(apiKey)}
                    disabled={isVerifying}
                    style={{
                      fontSize: '0.78rem',
                      color: '#4F46E5',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Check Expiration & Health</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearKey}
                    style={{
                      fontSize: '0.78rem',
                      color: '#DC2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Clear Key</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#64748B',
            backgroundColor: '#F1F5F9',
            padding: '8px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px'
          }}>
            <span>💡</span>
            <span>
              <strong>Do Gemini keys expire?</strong> Google Gemini API keys do <em>not</em> have an automatic expiration date. They remain active indefinitely unless manually deleted in Google AI Studio, revoked, or when daily free tier quotas (1,500 requests/day) reset.
            </span>
          </div>
        </div>

        {/* Feature Comparison */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '14px',
          padding: '14px 18px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.82rem',
          color: '#475569'
        }}>
          <div style={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#7C3AED" />
            <span>How Question Generation Works:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}>
              <strong style={{ color: '#4F46E5', display: 'block', marginBottom: '4px' }}>✨ With Gemini AI</strong>
              Sends extracted text to Gemini LLM to generate fresh questions grounded strictly in chapter content with custom explanations.
            </div>
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}>
              <strong style={{ color: '#059669', display: 'block', marginBottom: '4px' }}>📚 Curriculum Engine</strong>
              Instant deterministic generator using NCERT/CBSE verified question bank. 100% verified, 0 hallucinations, works completely offline.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleTestAndSave}
            disabled={isVerifying}
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isVerifying ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Save & Connect AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
