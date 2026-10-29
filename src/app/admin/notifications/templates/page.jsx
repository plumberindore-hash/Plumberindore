'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Check, 
  MessageSquare, 
  Smartphone, 
  Code, 
  Info,
  RefreshCw
} from 'lucide-react';

export default function AdminNotificationTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateText, setTemplateText] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications/templates');
      const json = await res.json();
      if (json.success) {
        setTemplates(json.templates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (tmpl) => {
    setEditingTemplate(tmpl);
    setTemplateText(tmpl.template_text);
    setFeedback(null);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: editingTemplate.id,
          data: { template_text: templateText }
        })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: 'Template successfully updated!' });
        await fetchTemplates();
        setEditingTemplate(null);
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to update template' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/notifications"
            className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Notification Templates</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Authoritative message strings for WhatsApp & SMS channels.</p>
          </div>
        </div>

        <button
          onClick={fetchTemplates}
          className="px-3 py-1.5 text-xs text-[#0F1B33] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-xl font-medium flex items-center space-x-1.5 transition shadow-sm"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Editor Modal / Panel */}
      {editingTemplate && (
        <div className="bg-white rounded-2xl border-2 border-[#0F1B33] p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                {editingTemplate.channel}
              </span>
              <h2 className="text-base font-bold text-[#0F172A] mt-1">{editingTemplate.name}</h2>
              <p className="text-xs text-[#64748B]">ID: {editingTemplate.id}</p>
            </div>
            <button
              onClick={() => setEditingTemplate(null)}
              className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Template Message Text</label>
            <textarea
              rows={4}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0F1B33] bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Available Variables</label>
            <div className="flex flex-wrap gap-1.5">
              {(editingTemplate.variables || []).map((v) => (
                <span
                  key={v}
                  className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[10px] font-mono"
                >
                  &#123;&#123;{v}&#125;&#125;
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setEditingTemplate(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0F1B33] hover:bg-[#16233D] text-white flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-[#64748B]">Loading templates...</div>
        ) : (
          templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {tmpl.channel === 'WHATSAPP' ? (
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-xs font-bold text-[#0F172A]">{tmpl.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                    {tmpl.channel}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-[#0F172A] font-mono whitespace-pre-wrap leading-relaxed">
                  {tmpl.template_text}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[10px] text-[#64748B]">
                  <Code className="w-3 h-3" />
                  <span>{(tmpl.variables || []).length} dynamic variables</span>
                </div>
                <button
                  onClick={() => handleEdit(tmpl)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0F1B33] bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
