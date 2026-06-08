const sampleCards = Array.isArray(window.defaultCards) ? window.defaultCards : [];
const storageKey = "taiwanMandarinFlashcards.v7";
const directionStorageKey = "taiwanMandarinFlashcardDirection";
const sentencePinyinStorageKey = "taiwanMandarinSentencePinyin";

let cards = loadCards();
let currentIndex = 0;
let isFlipped = false;
let isChineseFirst = loadDirection();
let isSentencePinyinVisible = loadSentencePinyin();

const elements = {
  card: document.getElementById("card"),
  cardCounter: document.getElementById("cardCounter"),
  categoryLabel: document.getElementById("categoryLabel"),
  traditional: document.getElementById("traditional"),
  simplified: document.getElementById("simplified"),
  wordPinyin: document.getElementById("wordPinyin"),
  meaning: document.getElementById("meaning"),
  sentenceTraditional: document.getElementById("sentenceTraditional"),
  sentenceSimplified: document.getElementById("sentenceSimplified"),
  sentencePinyin: document.getElementById("sentencePinyin"),
  sentenceEnglish: document.getElementById("sentenceEnglish"),
  prevBtn: document.getElementById("prevBtn"),
  flipBtn: document.getElementById("flipBtn"),
  nextBtn: document.getElementById("nextBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  speakWordBtn: document.getElementById("speakWordBtn"),
  speakSentenceBtn: document.getElementById("speakSentenceBtn"),
  stopAudioBtn: document.getElementById("stopAudioBtn"),
  directionBtn: document.getElementById("directionBtn"),
  sentencePinyinBtn: document.getElementById("sentencePinyinBtn"),
  clearPracticeBtn: document.getElementById("clearPracticeBtn"),
  practiceBox: document.getElementById("practiceBox"),
  cardList: document.getElementById("cardList"),
  toggleImportBtn: document.getElementById("toggleImportBtn"),
  importPanel: document.getElementById("importPanel"),
  importBox: document.getElementById("importBox"),
  applyImportBtn: document.getElementById("applyImportBtn"),
  loadSampleBtn: document.getElementById("loadSampleBtn"),
  resetDeckBtn: document.getElementById("resetDeckBtn")
};

function loadCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) && saved.length ? saved : sampleCards;
  } catch {
    return sampleCards;
  }
}

function loadDirection() {
  return localStorage.getItem(directionStorageKey) !== "english";
}

function loadSentencePinyin() {
  return localStorage.getItem(sentencePinyinStorageKey) === "visible";
}

function saveCards() {
  localStorage.setItem(storageKey, JSON.stringify(cards));
}

function saveDirection() {
  localStorage.setItem(directionStorageKey, isChineseFirst ? "chinese" : "english");
}

function saveSentencePinyin() {
  localStorage.setItem(sentencePinyinStorageKey, isSentencePinyinVisible ? "visible" : "hidden");
}

function resetDeck() {
  cards = [...sampleCards];
  currentIndex = 0;
  isFlipped = false;
  saveCards();
  renderCard();
  if (!elements.importPanel.classList.contains("hidden")) {
    elements.importBox.value = cardsToText(cards);
  }
}

function renderCard() {
  if (!cards.length) return;
  const card = cards[currentIndex];
  elements.cardCounter.textContent = `${currentIndex + 1} / ${cards.length}`;
  elements.categoryLabel.textContent = card.category || "Flashcard";
  elements.traditional.textContent = card.traditional;
  elements.simplified.textContent = card.simplified || card.traditional;
  elements.wordPinyin.textContent = card.pinyin;
  elements.meaning.textContent = card.meaning;
  elements.sentenceTraditional.textContent = card.sentenceTraditional;
  elements.sentenceSimplified.textContent = card.sentenceSimplified || card.sentenceTraditional;
  elements.sentencePinyin.textContent = card.sentencePinyin;
  elements.sentenceEnglish.textContent = card.sentenceEnglish || makeSentenceEnglish(card);
  elements.card.classList.toggle("flipped", isFlipped);
  elements.card.classList.toggle("english-first", !isChineseFirst);
  elements.directionBtn.textContent = isChineseFirst ? "Default: Chinese First" : "Default: English First";
  elements.directionBtn.setAttribute("aria-pressed", String(!isChineseFirst));
  elements.sentencePinyin.classList.toggle("hidden", !isSentencePinyinVisible);
  elements.sentencePinyinBtn.textContent = isSentencePinyinVisible ? "Sentence Pinyin: On" : "Sentence Pinyin: Off";
  elements.sentencePinyinBtn.setAttribute("aria-pressed", String(isSentencePinyinVisible));
  renderList();
}

function renderList() {
  elements.cardList.innerHTML = "";
  cards.forEach((card, index) => {
    const item = document.createElement("button");
    item.className = "list-item";
    item.type = "button";
    item.innerHTML = `
      <strong>${escapeHtml(card.traditional)}</strong>
      <span>${escapeHtml(card.pinyin)}<br>${escapeHtml(card.meaning)}</span>
    `;
    item.addEventListener("click", () => {
      currentIndex = index;
      isFlipped = false;
      renderCard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    elements.cardList.appendChild(item);
  });
}

function flipCard() {
  isFlipped = !isFlipped;
  renderCard();
}

function moveCard(direction) {
  currentIndex = (currentIndex + direction + cards.length) % cards.length;
  isFlipped = false;
  renderCard();
}

function shuffleCards() {
  cards = [...cards].sort(() => Math.random() - 0.5);
  currentIndex = 0;
  isFlipped = false;
  saveCards();
  renderCard();
}

function toggleDirection() {
  isChineseFirst = !isChineseFirst;
  isFlipped = false;
  saveDirection();
  renderCard();
}

function toggleSentencePinyin() {
  isSentencePinyinVisible = !isSentencePinyinVisible;
  saveSentencePinyin();
  renderCard();
}

function getChineseVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === "zh-TW")
    || voices.find((voice) => voice.lang === "zh-Hant")
    || voices.find((voice) => voice.lang.startsWith("zh-TW"))
    || voices.find((voice) => voice.lang.startsWith("zh-HK"))
    || voices.find((voice) => voice.lang.startsWith("zh"))
    || null;
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    alert("Audio is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getChineseVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "zh-TW";
  }
  utterance.rate = 0.82;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function speakCurrentWord() {
  speakText(cards[currentIndex].traditional);
}

function speakCurrentSentence() {
  speakText(cards[currentIndex].sentenceTraditional);
}

function cardsToText(sourceCards) {
  return sourceCards.map((card) => [
    card.traditional,
    card.simplified,
    card.pinyin,
    card.meaning,
    card.sentenceTraditional,
    card.sentenceSimplified,
    card.sentencePinyin,
    card.sentenceEnglish || makeSentenceEnglish(card),
    card.category
  ].join(" | ")).join("\n");
}

function makeSentenceEnglish(card) {
  return `Example sentence using "${card.meaning}".`;
}

function parseImport(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      return {
        traditional: parts[0] || "",
        simplified: parts[1] || parts[0] || "",
        pinyin: parts[2] || "",
        meaning: parts[3] || "",
        sentenceTraditional: parts[4] || "",
        sentenceSimplified: parts[5] || parts[4] || "",
        sentencePinyin: parts[6] || "",
        sentenceEnglish: parts[7] || "",
        category: parts[8] || "Custom"
      };
    })
    .filter((card) => card.traditional && card.pinyin && card.meaning);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.card.addEventListener("click", flipCard);
elements.card.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    flipCard();
  }
});
elements.flipBtn.addEventListener("click", flipCard);
elements.prevBtn.addEventListener("click", () => moveCard(-1));
elements.nextBtn.addEventListener("click", () => moveCard(1));
elements.shuffleBtn.addEventListener("click", shuffleCards);
elements.speakWordBtn.addEventListener("click", speakCurrentWord);
elements.speakSentenceBtn.addEventListener("click", speakCurrentSentence);
elements.stopAudioBtn.addEventListener("click", () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});
elements.directionBtn.addEventListener("click", toggleDirection);
elements.sentencePinyinBtn.addEventListener("click", toggleSentencePinyin);
elements.clearPracticeBtn.addEventListener("click", () => {
  elements.practiceBox.value = "";
  elements.practiceBox.focus();
});
elements.toggleImportBtn.addEventListener("click", () => {
  const isHidden = elements.importPanel.classList.toggle("hidden");
  elements.toggleImportBtn.setAttribute("aria-expanded", String(!isHidden));
  elements.toggleImportBtn.textContent = isHidden ? "Edit" : "Hide";
  if (!isHidden) {
    elements.importBox.value = cardsToText(cards);
  }
});
elements.loadSampleBtn.addEventListener("click", () => {
  elements.importBox.value = cardsToText(sampleCards);
});
elements.resetDeckBtn.addEventListener("click", resetDeck);
elements.applyImportBtn.addEventListener("click", () => {
  const imported = parseImport(elements.importBox.value);
  if (!imported.length) {
    alert("No valid cards found. Use: Traditional | Simplified | Pinyin | Meaning | Sentence Traditional | Sentence Simplified | Sentence Pinyin | Sentence English | Category");
    return;
  }
  cards = imported;
  currentIndex = 0;
  isFlipped = false;
  saveCards();
  renderCard();
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("textarea")) return;
  if (event.key === "ArrowLeft") moveCard(-1);
  if (event.key === "ArrowRight") moveCard(1);
  if (event.key.toLowerCase() === "f") flipCard();
  if (event.key.toLowerCase() === "w") speakCurrentWord();
  if (event.key.toLowerCase() === "s") speakCurrentSentence();
  if (event.key.toLowerCase() === "d") toggleDirection();
  if (event.key.toLowerCase() === "p") toggleSentencePinyin();
});

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = getChineseVoice;
}

renderCard();
