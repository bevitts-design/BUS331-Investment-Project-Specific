(() => {
  "use strict";

  const root = document.querySelector("[data-client-interview-simulator]");
  if (!root) return;

  const configElement = root.querySelector("[data-simulator-config]");
  const config = JSON.parse(configElement.textContent);
  const form = root.querySelector("[data-interview-form]");
  const questionInput = form.querySelector("textarea");
  const transcript = root.querySelector("[data-interview-transcript]");
  const emptyState = root.querySelector("[data-empty-transcript]");
  const formStatus = root.querySelector("[data-form-status]");
  const sessionStatus = root.querySelector("[data-session-status]");
  const notes = root.querySelector("#interview-notes");
  const turns = [];
  const state = {
    turn: 0,
    lastPathId: null,
    lastAcknowledgementIndex: -1,
    complicationDelivered: false,
    askedCounts: new Map(),
    disclosed: new Set()
  };

  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9$%]+/g, " ").trim();
  const recommendationPattern = /\b(recommend|recommendation|should (?:i|we|the team) (?:buy|sell|invest|allocate)|which (?:bond|fund|etf|security|stock)|what (?:bond|fund|etf|security|stock|investment|allocation)|buy|sell|allocate|allocation|portfolio weight)\b/i;
  const followUpPattern = /\b(tell me more|what do you mean|why|how so|be specific|clarify|earlier|you said)\b/i;
  const broadPattern = /\b(tell me everything|tell me your situation|anything else|what else|all the facts|full picture)\b/i;
  const vagueRiskPattern = /^(?:tell me about )?risk\??$|^what about risk\??$/i;

  function interpolate(value) {
    return value.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_, key) => config.scenarioFacts[key] || "[information gap]");
  }

  function pathScore(path, normalizedQuestion) {
    const phraseScore = path.phrases.reduce((score, phrase) => score + (normalizedQuestion.includes(normalize(phrase)) ? 4 : 0), 0);
    const keywordScore = path.keywords.reduce((score, keyword) => score + (normalizedQuestion.includes(normalize(keyword)) ? 1 : 0), 0);
    return phraseScore + keywordScore;
  }

  function selectPath(question) {
    const normalizedQuestion = normalize(question);
    const ranked = config.dialoguePaths
      .map((path) => ({ path, score: pathScore(path, normalizedQuestion) }))
      .sort((a, b) => b.score - a.score);
    if (ranked[0]?.score > 0) return ranked[0].path;
    if (followUpPattern.test(question) && state.lastPathId) {
      return config.dialoguePaths.find((path) => path.id === state.lastPathId) || null;
    }
    return null;
  }

  function responseFor(question) {
    if (recommendationPattern.test(question)) {
      const refusal = config.recommendationResponses[state.turn % config.recommendationResponses.length];
      state.turn += 1;
      return { answer: refusal, cue: "" };
    }

    if (vagueRiskPattern.test(question.trim())) {
      state.turn += 1;
      return { answer: config.clarificationResponses.risk, cue: "" };
    }

    if (broadPattern.test(question)) {
      const broad = config.broadResponses[state.turn % config.broadResponses.length];
      state.turn += 1;
      return { answer: broad, cue: "" };
    }

    const path = selectPath(question);
    if (!path) {
      const wordCount = normalize(question).split(" ").filter(Boolean).length;
      const answer = wordCount < 4
        ? config.clarificationResponses.general
        : config.unknownResponses[state.turn % config.unknownResponses.length];
      state.turn += 1;
      return { answer, cue: "" };
    }

    const priorCount = state.askedCounts.get(path.id) || 0;
    const isFollowUp = priorCount > 0 || followUpPattern.test(question);
    const pool = isFollowUp && path.followUpResponses?.length ? path.followUpResponses : path.responses;
    const answerIndex = (priorCount + state.turn) % pool.length;
    let acknowledgementIndex = (state.turn + path.id.length) % config.acknowledgements.length;
    if (acknowledgementIndex === state.lastAcknowledgementIndex) {
      acknowledgementIndex = (acknowledgementIndex + 1) % config.acknowledgements.length;
    }
    const acknowledgement = config.acknowledgements[acknowledgementIndex];
    state.lastAcknowledgementIndex = acknowledgementIndex;
    let answer = `${acknowledgement} ${interpolate(pool[answerIndex])}`;

    state.askedCounts.set(path.id, priorCount + 1);
    path.discloses.forEach((fact) => state.disclosed.add(fact));
    state.lastPathId = path.id;

    if (!isFollowUp && path.followUpQuestion && state.turn % 2 === 0) {
      answer += ` ${path.followUpQuestion}`;
    }

    let cue = "";
    const complicationReady = config.complication.requires.every((fact) => state.disclosed.has(fact));
    if (!state.complicationDelivered && complicationReady) {
      const complicationText = state.disclosed.has("horizon")
        ? config.complication.responseWithHorizon
        : config.complication.response;
      answer += ` ${interpolate(complicationText)}`;
      cue = config.complication.recordPrompt;
      state.complicationDelivered = true;
    }

    state.turn += 1;
    return { answer, cue };
  }

  function appendMessage(speaker, message, className) {
    const paragraph = document.createElement("p");
    const label = document.createElement("strong");
    label.textContent = `${speaker}: `;
    paragraph.className = className;
    paragraph.append(label, document.createTextNode(message));
    return paragraph;
  }

  function appendTurn(question, result) {
    const item = document.createElement("li");
    item.append(
      appendMessage("Analyst", question, "transcript-question"),
      appendMessage(config.clientName, result.answer, "transcript-response")
    );
    if (result.cue) item.append(appendMessage("Decision Record cue", result.cue, "transcript-cue"));
    transcript.append(item);
    turns.push({ question, response: result.answer, cue: result.cue });
    emptyState.hidden = true;
  }

  function appendGreeting() {
    const item = document.createElement("li");
    item.className = "transcript-greeting";
    item.append(appendMessage(config.clientName, config.greeting, "transcript-response"));
    transcript.append(item);
  }

  function resetConversationState() {
    state.turn = 0;
    state.lastPathId = null;
    state.lastAcknowledgementIndex = -1;
    state.complicationDelivered = false;
    state.askedCounts.clear();
    state.disclosed.clear();
  }

  function sessionText() {
    const lines = [
      `BUS331 Client Interview Simulator — ${config.clientName}`,
      config.caseLabel,
      "Controlled prototype: responses are limited to the approved fictional profile and are not investment recommendations.",
      `${config.clientName}: ${config.greeting}`,
      ""
    ];
    turns.forEach((turn, index) => {
      lines.push(`Exchange ${index + 1}`);
      lines.push(`Analyst: ${turn.question}`);
      lines.push(`${config.clientName}: ${turn.response}`);
      if (turn.cue) lines.push(`Decision Record cue: ${turn.cue}`);
      lines.push("");
    });
    lines.push("Analyst notes for the Decision Record:");
    lines.push(notes.value.trim() || "[No notes recorded]");
    return lines.join("\n");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question) {
      formStatus.textContent = "Enter one interview question.";
      questionInput.focus();
      return;
    }
    appendTurn(question, responseFor(question));
    form.reset();
    formStatus.textContent = "Response added to the transcript.";
    questionInput.focus();
  });

  root.querySelectorAll("[data-suggested-question]").forEach((button) => {
    button.addEventListener("click", () => {
      questionInput.value = button.textContent.trim();
      formStatus.textContent = "Suggested question loaded. Edit it or ask as written.";
      questionInput.focus();
    });
  });

  root.querySelector("[data-copy-session]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(sessionText());
      sessionStatus.textContent = "Transcript and notes copied. Paste them into your working record, then verify material claims separately.";
    } catch {
      sessionStatus.textContent = "Copy was unavailable in this browser. Use Download .txt instead.";
    }
  });

  root.querySelector("[data-download-session]").addEventListener("click", () => {
    const blob = new Blob([sessionText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BUS331-Eleanor-Vance-interview-notes.txt";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    sessionStatus.textContent = "Transcript and notes downloaded as a local text file.";
  });

  root.querySelector("[data-clear-session]").addEventListener("click", () => {
    turns.length = 0;
    transcript.replaceChildren();
    resetConversationState();
    appendGreeting();
    notes.value = "";
    emptyState.hidden = false;
    formStatus.textContent = "";
    sessionStatus.textContent = "Local transcript and notes cleared.";
    questionInput.focus();
  });

  appendGreeting();
})();
