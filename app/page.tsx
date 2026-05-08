import { AiChatWidget } from "@/components/AiChatWidget";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.badge}>Projekt portfolio</div>
        <h1 className={styles.title}>
          Lumière &amp; Zapach
          <span className={styles.titleAccent}> AI Assistant</span>
        </h1>
        <p className={styles.subtitle}>
          Demonstracja chatbota opartego na RAG&nbsp;(Retrieval-Augmented
          Generation). Asystent odpowiada wyłącznie na pytania dotyczące
          fikcyjnego sklepu ze świecami i nie posiada wiedzy ogólnej.
        </p>
        <div className={styles.cta}>
          <span className={styles.ctaArrow}>↘</span>
          Kliknij ikonę czatu w prawym dolnym rogu
        </div>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Stos technologiczny</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⚡</div>
            <h3>Next.js 15 + TypeScript</h3>
            <p>App Router, Server Components, Route Handlers</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🤖</div>
            <h3>AI SDK v6</h3>
            <p>Vercel AI SDK — streamText, useChat, UIMessage</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🔍</div>
            <h3>RAG + pgvector</h3>
            <p>Embeddingi OpenAI, wyszukiwanie cosinusowe w PostgreSQL</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🗄️</div>
            <h3>Prisma + Supabase</h3>
            <p>ORM z obsługą niestandardowego typu vector(1536)</p>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Jak to działa?</h2>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div>
              <strong>Zapytanie użytkownika</strong> jest zamieniane na wektor
              przez model
              <code> text-embedding-3-small</code>.
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div>
              Wektor jest porównywany z bazą wiedzy sklepu w PostgreSQL —
              zwracane są 3 najbardziej pasujące fragmenty.
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div>
              Fragmenty trafiają do System Promptu, który ogranicza model
              <code> gpt-4o-mini</code> wyłącznie do danych ze sklepu.
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div>
              Odpowiedź jest strumieniowana do frontendu przez{" "}
              <code>toUIMessageStreamResponse()</code>.
            </div>
          </li>
        </ol>
      </section>
      <footer className={styles.footer}>
        Sklep "Lumière &amp; Zapach" jest fikcyjny i służy wyłącznie jako dane
        demonstracyjne.
      </footer>

      <AiChatWidget />
    </main>
  );
}
