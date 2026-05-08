import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, embed, streamText, type UIMessage } from "ai";
import { prisma } from "@/lib/prisma";
import { getMessageText } from "@/utils/getMessage";

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: UIMessage[] };

    // Pobieramy ostatnią wiadomość (pytanie użytkownika)
    const lastMessage = getMessageText(messages[messages.length - 1]);

    // KROK 1: Generujemy wektor dla zapytania użytkownika
    // Używamy taniego i bardzo skutecznego modelu text-embedding-3-small
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: lastMessage,
    });

    const embeddingStr = `[${embedding.join(",")}]`;

    // KROK 2: RAG - Szukamy najbardziej pasujących informacji w bazie Supabase
    // Używamy odległości cosinusowej (<=>)
    const similarDocs = await prisma.$queryRaw<Array<{ content: string }>>`
      SELECT content
      FROM "KnowledgeBase"
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT 3;
    `;

    // Łączymy znalezione fragmenty wiedzy w jeden tekst
    const context = similarDocs.map((doc) => doc.content).join("\n\n");

    // KROK 3: Niezłomny System Prompt
    const systemPrompt = `
Jesteś profesjonalnym, uprzejmym i pomocnym asystentem w sklepie internetowym ze świecami "Lumière & Zapach". 
Twoim głównym zadaniem jest doradzanie klientom w wyborze świec, informowanie o procesie zamówienia oraz polityce sklepu.

ZASADY, KTÓRYCH MUSISZ BEZWZGLĘDNIE PRZESTRZEGAĆ:

1. OPIERAJ SIĘ TYLKO NA KONTEKŚCIE:
   Odpowiadaj na pytania WYŁĄCZNIE na podstawie dostarczonego poniżej KONTEKSTU. Nie wymyślaj nowych zapachów, nie zmyślaj cen, nie dodawaj własnych promocji ani usług, których nie ma w kontekście.
   
2. POSTĘPOWANIE W PRZYPADKU BRAKU DANYCH W KONTEKŚCIE:
   Jeśli użytkownik zapyta o produkt (np. "czy macie świecę o zapachu róży?") lub usługę, o której nie ma mowy w KONTEKŚCIE, MUSISZ odpowiedzieć: 
   "Przepraszam, ale nie widzę obecnie takich informacji w naszej ofercie. Czy mogę Ci zaproponować któryś z naszych innych zapachów?"

3. OGRANICZENIE TEMATYCZNE (BARDZO WAŻNE):
   Jesteś ekspertem TYLKO od asortymentu sklepu "Lumière & Zapach". Nie wiesz nic o świecie zewnętrznym. 
   Jeśli użytkownik zapyta o politykę, historię, programowanie, przepisy kulinarne, ogólną teorię naukową lub cokolwiek niezwiązanego ze świecami, sklepem, przesyłkami lub obsługą klienta, MUSISZ odpowiedzieć dokładnie tak:
   "Jestem wirtualnym asystentem sklepu Lumière & Zapach i mogę pomóc tylko w sprawach związanych z naszymi świecami i zamówieniami. W czym mogę Ci dzisiaj pomóc?"

4. STYL WYPOWIEDZI:
   Bądź zwięzły, uprzejmy i ciepły. Używaj formatowania (np. pogrubienia dla nazw produktów **Zimowy Wieczór** i cen **59 PLN**), aby ułatwić czytanie.

KONTEKST BAZY WIEDZY:
---------------------
${context}
---------------------
`;

    // KROK 4: Generowanie i strumieniowanie odpowiedzi do frontendu
    // gpt-4o-mini jest szybki, tani i świetnie trzyma się instrukcji
    const modelMessages = await convertToModelMessages(
      messages.map(({ id, ...message }) => message),
    );

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Błąd czatu:", error);
    return new Response("Wystąpił błąd serwera", { status: 500 });
  }
}
