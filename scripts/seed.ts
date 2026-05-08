import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";

// Baza wiedzy o sklepie "Lumière & Zapach" podzielona na spójne fragmenty
const candleShopData = [
  "Sklep internetowy Lumière & Zapach oferuje rzemieślnicze świece sojowe, woski zapachowe oraz akcesoria do aromaterapii. Wszystkie nasze świece wylewamy ręcznie w Polsce z w 100% naturalnego wosku sojowego z użyciem wegańskich olejków zapachowych. Biuro Obsługi Klienta pracuje od poniedziałku do piątku w godzinach 9:00 - 17:00 pod adresem e-mail: kontakt@lumiere-zapach.pl.",

  "Koszty dostawy wynoszą: Paczkomaty InPost (13,90 PLN) oraz Kurier DPD (16,90 PLN). Oferujemy darmową dostawę dla wszystkich zamówień powyżej 199 PLN. Zamówienia wysyłamy w ciągu 24-48 godzin roboczych. Klienci mają prawo do zwrotu nienaruszonych, nieodpalonych świec w ciągu 30 dni od daty otrzymania przesyłki, korzystając z formularza zwrotu na naszej stronie.",

  "Świeca sojowa 'Zimowy Wieczór'. Zapach: nuty pieczonego jabłka, cynamonu, goździków i wanilii. Idealna na chłodne miesiące i budowanie przytulnej atmosfery. Cena: 59 PLN. Pojemność: 250 ml. Czas palenia: do 50 godzin. Posiada naturalny knot drewniany, który delikatnie skwierczy podczas palenia, imitując dźwięk kominka.",

  "Świeca sojowa 'Leśne Ukojenie'. Zapach: świeża sosna, mech dębowy, paczula i delikatna nuta mięty. Bardzo świeży i pobudzający zapach, przypominający spacer po lesie po deszczu. Cena: 65 PLN. Pojemność: 250 ml. Czas palenia: do 50 godzin. Posiada podwójny knot bawełniany zapewniający równomierne wypalanie.",

  "Świeca sojowa 'Słodka Prowansja'. Zapach: intensywna lawenda przełamana słodką wanilią z Madagaskaru. Zapach silnie relaksujący, polecany do sypialni przed snem lub do medytacji. Cena: 49 PLN. Pojemność: 180 ml. Czas palenia: do 35 godzin. Wyposażona w klasyczny knot bawełniany.",

  "Dla nowych klientów oferujemy kod rabatowy '-10%' na pierwsze zamówienie. Wystarczy zapisać się do naszego newslettera, aby otrzymać kod na podany adres e-mail. Rabat nie łączy się z innymi promocjami i wyprzedażami. Posiadamy również pakiety prezentowe, w których zakup trzech dowolnych świec obniża cenę najtańszej o 30%.",
];

async function main() {
  console.log("Rozpoczynam generowanie wektorów przez API OpenAI...");

  try {
    // KROK 1: Generujemy wektory dla wszystkich fragmentów jednocześnie
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: candleShopData,
    });

    console.log(`Wygenerowano ${embeddings.length} wektorów.`);

    // KROK 2: Zapisujemy dane do bazy przy użyciu Raw SQL (aby obsłużyć typ wektorowy)
    for (let i = 0; i < candleShopData.length; i++) {
      const content = candleShopData[i];
      const embeddingStr = `[${embeddings[i].join(",")}]`;

      await prisma.$executeRaw`
            INSERT INTO "KnowledgeBase" (id, content, embedding)
            VALUES (gen_random_uuid(), ${content}, ${embeddingStr}::vector)
          `;

      console.log(`Zapisano fragment ${i + 1}/${candleShopData.length}`);
    }

    console.log(
      "Operacja zakończona sukcesem! Sklep Lumière & Zapach jest gotowy.",
    );
  } catch (error) {
    console.error(`Wystąpił błąd podczas seedowania bazy danych:`, error);
  }
}

main().catch(console.error);
