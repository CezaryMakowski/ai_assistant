# Lumière & Zapach — AI Assistant

Projekt portfolio demonstrujący chatbota opartego na architekturze **RAG (Retrieval-Augmented Generation)**. Asystent odpowiada wyłącznie na pytania dotyczące fikcyjnego sklepu ze świecami „Lumière & Zapach" — nie posiada wiedzy ogólnej i celowo odmawia odpowiedzi na tematy spoza bazy wiedzy.

---

## Jak działa RAG?

Klasyczny model językowy odpowiada na podstawie swojego treningu. RAG rozszerza to o **dynamiczne wyszukiwanie kontekstu** z zewnętrznej bazy danych:

```
Pytanie użytkownika
       │
       ▼
 Generowanie embeddings
 (text-embedding-3-small)
       │
       ▼
 Wyszukiwanie cosinusowe
 w PostgreSQL + pgvector
       │
       ▼
 3 najbardziej pasujące
 fragmenty bazy wiedzy
       │
       ▼
 Trafiają do System Promptu
 jako jedyne źródło wiedzy
       │
       ▼
 gpt-4o-mini generuje
 odpowiedź i streamuje ją
```

Dzięki temu model **nie może zmyślać** — każda odpowiedź musi wynikać z dostarczonego kontekstu. Pytania spoza bazy wiedzy są odrzucane zgodnie z instrukcją w System Prompcie.

---

## Stos technologiczny

| Warstwa               | Technologia                                 |
| --------------------- | ------------------------------------------- |
| Framework             | Next.js 16 (App Router)                     |
| Język                 | TypeScript                                  |
| AI SDK                | Vercel AI SDK v6 (`ai`, `@ai-sdk/react`)    |
| Model generatywny     | OpenAI `gpt-4o-mini`                        |
| Model embeddingów     | OpenAI `text-embedding-3-small` (1536 dim.) |
| Baza danych           | PostgreSQL + rozszerzenie `pgvector`        |
| ORM                   | Prisma v7                                   |
| Hosting bazy          | Supabase                                    |
| Renderowanie markdown | `react-markdown` + `remark-gfm`             |
| Animacje              | Framer Motion (`motion`)                    |

---

## Struktura projektu

```
app/
  page.tsx                  # Strona główna (landing page)
  api/chat/route.ts         # Route Handler — pipeline RAG
components/
  AiChatWidget.tsx          # Widget czatu (useChat, localStorage cache)
scripts/
  seed.ts                   # Generowanie embeddingów i seed bazy wiedzy
prisma/
  schema.prisma             # Model KnowledgeBase z kolumną vector(1536)
utils/
  getMessage.ts             # Helper do wyciągania tekstu z UIMessage
style/
  AiChatWidget.module.css   # Style widgetu
```

---

## Kluczowe decyzje projektowe

**Dlaczego model nie odpowiada na pytania ogólne?**
System Prompt zawiera rygorystyczne instrukcje — model ma dostęp wyłącznie do fragmentów zwróconych przez wyszukiwanie wektorowe. Jeśli pytanie nie pasuje do żadnego fragmentu w bazie, zwrócone dokumenty nie będą pomocne, a model jest instruowany, żeby to wprost zakomunikować.

**Dlaczego `$executeRaw` zamiast Prisma Client do wstawiania embeddingów?**
Prisma nie obsługuje natywnie typu `vector` z pgvector — kolumna jest oznaczona jako `Unsupported("vector")`. Standardowe API (`.create()`) nie pozwala na zapis tego pola, dlatego seed używa surowego SQL z rzutowaniem `::vector`.

**Cache wiadomości w `localStorage`**
Widget czatu zapamiętuje historię rozmowy między odświeżeniami strony. Przy pierwszym renderze komponentu dane są wczytywane synchronicznie jako wartość startowa hooka `useChat`.

---
