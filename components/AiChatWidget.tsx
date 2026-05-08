"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { useState, useRef, useEffect, SubmitEvent } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../style/AiChatWidget.module.css";
import { getMessageText } from "@/utils/getMessage";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

const initialMessage: UIMessage[] = [
  {
    id: "welcome-msg",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Cześć! W czym mogę Ci pomóc?",
      },
    ],
  },
];

const CHAT_MESSAGES_CACHE_KEY = "ai-chat-widget-messages";

function saveMessagesToCache(messages: UIMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_MESSAGES_CACHE_KEY, JSON.stringify(messages));
}

function readMessagesFromCache(): UIMessage[] | null {
  if (typeof window === "undefined") return null;
  const cachedValue = localStorage.getItem(CHAT_MESSAGES_CACHE_KEY);
  if (!cachedValue) return null;

  try {
    const parsed = JSON.parse(cachedValue);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : null;
  } catch {
    return null;
  }
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status } = useChat({
    messages: readMessagesFromCache() ?? initialMessage,
  });
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    saveMessagesToCache(messages);
  }, [messages]);

  // Przewiń do ostatniej wiadomości po każdej zmianie oraz przy otwarciu okna
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput("");
    await sendMessage({ text: trimmedInput });
  }

  return (
    <div className={styles.wrapper}>
      {/* Przycisk otwierający */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
      >
        <Image
          src={isOpen ? "/icons/close.svg" : "/icons/message.svg"}
          alt="Chat-icon"
          width={24}
          height={24}
        />
      </button>

      {/* Okno czatu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Nagłówek */}
            <div className={styles.chatHeader}>Asystent Serwisu</div>

            {/* Obszar wiadomości */}
            <div className={styles.messagesArea}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.messageRow} ${message.role === "user" ? styles.messageRowUser : styles.messageRowAssistant}`}
                >
                  <div
                    className={`${styles.messageBubble} ${message.role === "user" ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}
                  >
                    {message.role === "assistant" ? (
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {getMessageText(message)}
                      </Markdown>
                    ) : (
                      getMessageText(message)
                    )}
                  </div>
                </div>
              ))}
              {status === "submitted" && (
                <div
                  className={`${styles.messageRow} ${styles.messageRowAssistant}`}
                >
                  <div
                    className={`${styles.messageBubble} ${styles.messageBubbleAssistant}`}
                  >
                    Pisze...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Pole wpisywania tekstu */}
            <form onSubmit={handleSubmit} className={styles.chatForm}>
              <div className={styles.inputRow}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Zadaj pytanie..."
                  disabled={isLoading}
                  className={styles.textInput}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={styles.sendButton}
                >
                  <Image
                    src="/icons/send.svg"
                    alt="Send-icon"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
