"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Mail, Paperclip, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AiInput } from "@/components/ai/ai-input";
import { AiMessage } from "@/components/ai/ai-message";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  confirmAiQuotation,
  fetchAiConversation,
  modifyAiOrder,
  sendAiMessage,
  startAiConversation,
  uploadAiProcurementFile,
} from "@/lib/ai/ai-client";
import type { AiMessageRecord } from "@/lib/ai/ai-types";

interface AiChatWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function extractArtifacts(messages: AiMessageRecord[]) {
  let pdfUrl: string | null = null;
  const whatsAppUrl: string | null = null;
  let emailSent = false;
  let canConfirm = false;
  let canModify = false;

  for (const message of messages) {
    if (message.metadata?.pdfUrl && typeof message.metadata.pdfUrl === "string") {
      pdfUrl = message.metadata.pdfUrl;
    }
    if (message.metadata?.emailSent === true) emailSent = true;
    if (message.metadata?.phase === "preview" || message.metadata?.canConfirm === true) {
      canConfirm = true;
    }
    if (message.metadata?.canModify === true) canModify = true;
  }

  const lastWithPdf = [...messages].reverse().find((m) => m.metadata?.pdfUrl);
  if (lastWithPdf?.metadata?.pdfUrl && typeof lastWithPdf.metadata.pdfUrl === "string") {
    pdfUrl = lastWithPdf.metadata.pdfUrl;
    canConfirm = false;
    canModify = false;
  }

  return { pdfUrl, whatsAppUrl, emailSent, canConfirm, canModify };
}

export function AiChatWindow({ open, onOpenChange }: AiChatWindowProps) {
  const t = useTranslations("procurementAssistant");
  const locale = useLocale();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessageRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);
  const [canModify, setCanModify] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncArtifacts = useCallback((list: AiMessageRecord[]) => {
    const artifacts = extractArtifacts(list);
    setPdfUrl(artifacts.pdfUrl);
    setWhatsAppUrl(artifacts.whatsAppUrl);
    setEmailSent(artifacts.emailSent);
    setCanConfirm(artifacts.canConfirm);
    setCanModify(artifacts.canModify);
  }, []);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const conversation = await startAiConversation(locale);
      setConversationId(conversation.id);
      const list = conversation.messages ?? [];
      setMessages(list);
      syncArtifacts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorMessage"));
    } finally {
      setLoading(false);
    }
  }, [locale, syncArtifacts, t]);

  useEffect(() => {
    if (open && !conversationId) {
      void loadConversation();
    } else if (open && conversationId) {
      void fetchAiConversation(conversationId).then((conversation) => {
        const list = conversation.messages ?? [];
        setMessages(list);
        syncArtifacts(list);
      });
    }
  }, [open, conversationId, loadConversation, syncArtifacts]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, submitting, error]);

  const applyReply = async (reply: Awaited<ReturnType<typeof sendAiMessage>>) => {
    const refreshed = await fetchAiConversation(reply.conversation.id);
    const list = refreshed.messages ?? [];
    setMessages(list);
    syncArtifacts(list);
    if (reply.pdfUrl) setPdfUrl(reply.pdfUrl);
    if (reply.whatsAppUrl) setWhatsAppUrl(reply.whatsAppUrl);
    if (reply.emailSent) setEmailSent(true);
    if (reply.canConfirm != null) setCanConfirm(reply.canConfirm);
    if (reply.canModify != null) setCanModify(reply.canModify);
  };

  const handleSend = async (content: string) => {
    if (!conversationId || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    const optimistic: AiMessageRecord = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const reply = await sendAiMessage(conversationId, content.trim());
      await applyReply(reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorMessage"));
      const refreshed = await fetchAiConversation(conversationId);
      setMessages(refreshed.messages ?? []);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!conversationId) return;
    setSubmitting(true);
    setError(null);
    try {
      const reply = await confirmAiQuotation(conversationId);
      await applyReply(reply);
      setCanConfirm(false);
      setCanModify(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorMessage"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleModify = async () => {
    if (!conversationId) return;
    setSubmitting(true);
    setError(null);
    try {
      const reply = await modifyAiOrder(conversationId);
      await applyReply(reply);
      setCanConfirm(false);
      setCanModify(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorMessage"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversationId) return;
    setSubmitting(true);
    setError(null);
    try {
      const reply = await uploadAiProcurementFile(conversationId, file);
      await applyReply(reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorMessage"));
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const completed = useMemo(
    () => messages.some((message) => message.metadata?.pdfUrl),
    [messages],
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className={cn(
        "fixed bottom-24 right-6 z-[60] flex w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl",
        "border border-blue-500/30 bg-[#060a12]/95 shadow-2xl shadow-blue-900/50 backdrop-blur-xl",
        "sm:w-[400px]",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
      )}
    >
      <header className="flex items-center justify-between border-b border-blue-500/20 bg-gradient-to-r from-blue-900/90 to-blue-800/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-600/30">
            <Sparkles className="size-4 text-blue-200" />
          </div>
          <h2 className="text-sm font-semibold text-white">{t("title")}</h2>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={t("close")}
          className="rounded-lg p-1.5 text-blue-200 transition-colors hover:bg-blue-500/20 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex max-h-[380px] min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-blue-300" />
          </div>
        ) : (
          messages.map((message) => (
            <AiMessage key={message.id} role={message.role === "user" ? "user" : "assistant"}>
              <span className="whitespace-pre-wrap">{message.content}</span>
            </AiMessage>
          ))
        )}

        {completed ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircle2 className="size-10 text-green-400" />
            {emailSent ? (
              <p className="flex items-center gap-1 text-xs text-green-300">
                <Mail className="size-3.5" />
                {t("emailSent")}
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <AiMessage role="assistant">
            <span className="text-red-300">{error}</span>
          </AiMessage>
        ) : null}
      </div>

      {(canConfirm || canModify) && !completed ? (
        <div className="space-y-2 border-t border-blue-500/20 bg-[#060a12]/95 p-3">
          {canConfirm ? (
            <Button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirm()}
              className="w-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
            >
              {submitting ? t("submitting") : t("confirmGenerate")}
            </Button>
          ) : null}
          {canModify ? (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => void handleModify()}
              className="w-full border-blue-500/40 text-blue-200 hover:bg-blue-500/10"
            >
              {t("modifyOrder")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {!loading ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />
          <div className="flex items-center gap-2 border-t border-blue-500/20 bg-[#060a12]/95 px-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={submitting}
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-300 hover:bg-blue-500/10 hover:text-blue-100"
            >
              <Paperclip className="size-4" />
              {t("uploadPo")}
            </Button>
          </div>
          <AiInput
            placeholder={t("placeholders.order")}
            multiline
            loading={submitting}
            onSubmit={handleSend}
          />
        </>
      ) : null}

      {pdfUrl || whatsAppUrl ? (
        <div className="space-y-2 border-t border-blue-500/20 bg-[#060a12]/95 p-3">
          {pdfUrl ? (
            <Button asChild className="w-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                {t("downloadPdf")}
              </a>
            </Button>
          ) : null}
          {whatsAppUrl ? (
            <Button
              asChild
              variant="outline"
              className="w-full border-green-500/40 text-green-300 hover:bg-green-500/10 hover:text-green-200"
            >
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {t("sendWhatsApp")}
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
