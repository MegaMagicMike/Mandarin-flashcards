const sampleCards = Array.isArray(window.defaultCards) ? window.defaultCards : [];
const storageKey = "taiwanMandarinFlashcards.v7";
const directionStorageKey = "taiwanMandarinFlashcardDirection";
const sentencePinyinStorageKey = "taiwanMandarinSentencePinyin";
const writingModeStorageKey = "taiwanMandarinWritingMode";
const ocrEndpointStorageKey = "taiwanMandarinOcrEndpoint";

let cards = loadCards();
let currentIndex = 0;
let isFlipped = false;
let isChineseFirst = loadDirection();
let isSentencePinyinVisible = loadSentencePinyin();
let isWritingMode = loadWritingMode();
let isWritingAnswerVisible = false;
let writingContext = null;
let isDrawing = false;
let lastPoint = null;

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
  writingModeBtn: document.getElementById("writingModeBtn"),
  writingPanel: document.getElementById("writingPanel"),
  writingMeaning: document.getElementById("writingMeaning"),
  writingSentenceEnglish: document.getElementById("writingSentenceEnglish"),
  writingCanvas: document.getElementById("writingCanvas"),
  writingAnswer: document.getElementById("writingAnswer"),
  writingTraditional: document.getElementById("writingTraditional"),
  writingSimplified: document.getElementById("writingSimplified"),
  writingPinyin: document.getElementById("writingPinyin"),
  writingFeedback: document.getElementById("writingFeedback"),
  clearCanvasBtn: document.getElementById("clearCanvasBtn"),
  checkOcrBtn: document.getElementById("checkOcrBtn"),
  markCorrectBtn: document.getElementById("markCorrectBtn"),
  markWrongBtn: document.getElementById("markWrongBtn"),
  revealAnswerBtn: document.getElementById("revealAnswerBtn"),
  tryAgainBtn: document.getElementById("tryAgainBtn"),
  ocrEndpointBtn: document.getElementById("ocrEndpointBtn"),
  writingPrevBtn: document.getElementById("writingPrevBtn"),
  writingNextBtn: document.getElementById("writingNextBtn"),
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

function loadWritingMode() {
  return localStorage.getItem(writingModeStorageKey) === "visible";
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

function saveWritingMode() {
  localStorage.setItem(writingModeStorageKey, isWritingMode ? "visible" : "hidden");
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
  elements.writingModeBtn.textContent = isWritingMode ? "Writing Mode: On" : "Writing Mode: Off";
  elements.writingModeBtn.setAttribute("aria-pressed", String(isWritingMode));
  elements.writingPanel.classList.toggle("hidden", !isWritingMode);
  elements.card.classList.toggle("hidden", isWritingMode);
  elements.flipBtn.classList.toggle("hidden", isWritingMode);
  renderWritingPanel(card);
  renderList();
}

function renderWritingPanel(card) {
  elements.writingMeaning.textContent = card.meaning;
  elements.writingSentenceEnglish.textContent = card.sentenceEnglish || makeSentenceEnglish(card);
  elements.writingTraditional.textContent = card.traditional;
  elements.writingSimplified.textContent = card.simplified || card.traditional;
  elements.writingPinyin.textContent = card.pinyin;
  elements.writingAnswer.classList.toggle("hidden", !isWritingAnswerVisible);
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
  resetWritingAttempt();
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

function toggleWritingMode() {
  isWritingMode = !isWritingMode;
  isFlipped = false;
  resetWritingAttempt();
  saveWritingMode();
  renderCard();
  if (isWritingMode) {
    requestAnimationFrame(resizeWritingCanvas);
  }
}

function resetWritingAttempt() {
  isWritingAnswerVisible = false;
  setWritingFeedback("", "");
  elements.revealAnswerBtn.classList.add("hidden");
  elements.tryAgainBtn.classList.add("hidden");
  clearWritingCanvas();
}

function revealWritingAnswer() {
  isWritingAnswerVisible = true;
  elements.tryAgainBtn.classList.remove("hidden");
  renderCard();
}

function markWritingCorrect() {
  isWritingAnswerVisible = true;
  elements.revealAnswerBtn.classList.add("hidden");
  elements.tryAgainBtn.classList.remove("hidden");
  setWritingFeedback("Correct. Compare your writing with the answer.", "correct");
  renderCard();
}

function markWritingWrong() {
  isWritingAnswerVisible = false;
  elements.revealAnswerBtn.classList.remove("hidden");
  elements.tryAgainBtn.classList.remove("hidden");
  setWritingFeedback("Not yet. Reveal the answer or try again first.", "wrong");
  renderCard();
}

function setWritingFeedback(text, state) {
  elements.writingFeedback.textContent = text;
  elements.writingFeedback.classList.toggle("correct", state === "correct");
  elements.writingFeedback.classList.toggle("wrong", state === "wrong");
}

function setupWritingCanvas() {
  writingContext = elements.writingCanvas.getContext("2d");
  resizeWritingCanvas();
  window.addEventListener("resize", resizeWritingCanvas);
  elements.writingCanvas.addEventListener("pointerdown", startDrawing);
  elements.writingCanvas.addEventListener("pointermove", drawStroke);
  elements.writingCanvas.addEventListener("pointerup", stopDrawing);
  elements.writingCanvas.addEventListener("pointercancel", stopDrawing);
  elements.writingCanvas.addEventListener("pointerleave", stopDrawing);
}

function resizeWritingCanvas() {
  if (!writingContext) return;
  const canvas = elements.writingCanvas;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const previous = canvas.toDataURL("image/png");
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  writingContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  writingContext.lineCap = "round";
  writingContext.lineJoin = "round";
  writingContext.lineWidth = 9;
  writingContext.strokeStyle = "#111827";
  const image = new Image();
  image.onload = () => writingContext.drawImage(image, 0, 0, rect.width, rect.height);
  image.src = previous;
}

function getCanvasPoint(event) {
  const rect = elements.writingCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function startDrawing(event) {
  event.preventDefault();
  isDrawing = true;
  lastPoint = getCanvasPoint(event);
  elements.writingCanvas.setPointerCapture(event.pointerId);
}

function drawStroke(event) {
  if (!isDrawing || !lastPoint || !writingContext) return;
  event.preventDefault();
  const point = getCanvasPoint(event);
  writingContext.beginPath();
  writingContext.moveTo(lastPoint.x, lastPoint.y);
  writingContext.lineTo(point.x, point.y);
  writingContext.stroke();
  lastPoint = point;
}

function stopDrawing() {
  isDrawing = false;
  lastPoint = null;
}

function clearWritingCanvas() {
  if (!writingContext) return;
  writingContext.clearRect(0, 0, elements.writingCanvas.width, elements.writingCanvas.height);
}

function getOcrEndpoint() {
  return localStorage.getItem(ocrEndpointStorageKey) || "";
}

function setOcrEndpoint() {
  const current = getOcrEndpoint();
  const next = prompt("Paste your OCR worker endpoint URL:", current);
  if (next === null) return;
  localStorage.setItem(ocrEndpointStorageKey, next.trim());
  setWritingFeedback(next.trim() ? "OCR endpoint saved." : "OCR endpoint cleared.", next.trim() ? "correct" : "");
}

async function checkWritingWithOcr() {
  const endpoint = getOcrEndpoint();
  if (!endpoint) {
    setWritingFeedback("Set up an OCR endpoint first.", "wrong");
    elements.revealAnswerBtn.classList.remove("hidden");
    return;
  }
  const card = cards[currentIndex];
  setWritingFeedback("Checking handwriting...", "");
  elements.checkOcrBtn.disabled = true;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: elements.writingCanvas.toDataURL("image/png"),
        expectedTraditional: card.traditional,
        expectedSimplified: card.simplified || card.traditional,
        pinyin: card.pinyin
      })
    });
    if (!response.ok) throw new Error(`OCR request failed: ${response.status}`);
    const result = await response.json();
    if (result.correct) {
      isWritingAnswerVisible = true;
      elements.revealAnswerBtn.classList.add("hidden");
      elements.tryAgainBtn.classList.remove("hidden");
      setWritingFeedback(`Correct. OCR read: ${result.recognized || card.traditional}`, "correct");
    } else {
      isWritingAnswerVisible = false;
      elements.revealAnswerBtn.classList.remove("hidden");
      elements.tryAgainBtn.classList.remove("hidden");
      setWritingFeedback(`Not yet. OCR read: ${result.recognized || "unclear"}`, "wrong");
    }
    renderCard();
  } catch (error) {
    setWritingFeedback("OCR check failed. Reveal or try again.", "wrong");
    elements.revealAnswerBtn.classList.remove("hidden");
    console.error(error);
  } finally {
    elements.checkOcrBtn.disabled = false;
  }
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
elements.writingModeBtn.addEventListener("click", toggleWritingMode);
elements.clearCanvasBtn.addEventListener("click", clearWritingCanvas);
elements.checkOcrBtn.addEventListener("click", checkWritingWithOcr);
elements.markCorrectBtn.addEventListener("click", markWritingCorrect);
elements.markWrongBtn.addEventListener("click", markWritingWrong);
elements.revealAnswerBtn.addEventListener("click", revealWritingAnswer);
elements.tryAgainBtn.addEventListener("click", resetWritingAttempt);
elements.ocrEndpointBtn.addEventListener("click", setOcrEndpoint);
elements.writingPrevBtn.addEventListener("click", () => moveCard(-1));
elements.writingNextBtn.addEventListener("click", () => moveCard(1));
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
  if (event.key.toLowerCase() === "m") toggleWritingMode();
});

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = getChineseVoice;
}

renderCard();
setupWritingCanvas();
