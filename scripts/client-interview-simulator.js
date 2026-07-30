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

  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9$%]+/g, " ").trim();
  const recommendationPattern = /\b(recommend|recommendation|what should|should (?:i|we|the team)|which (?:bond|fund|etf|security|stock)|what (?:bond|fund|etf|security|stock)|buy|sell|allocate|allocation|portfolio weight)\b/i;

  function responseFor(question) {
    if (recommendationPattern.test(question)) return config.recommendationResponse;
    const normalizedQuestion = normalize(question);
    const topic = config.responseTopics.find((candidate) =>
      candidate.keywords.some((keyword) => normalizedQuestion.includes(normalize(keyword)))
    );
    return topic ? topic.response : config.unknownResponse;
  }

  function appendMessage(speaker, message, className) {
    const paragraph = document.createElement("p");
    const label = document.createElement("strong");
    label.textContent = `${speaker}: `;
    paragraph.className = className;
    paragraph.append(label, document.createTextNode(message));
    return paragraph;
  }

  function appendTurn(question, response) {
    const item = document.createElement("li");
    item.append(
      appendMessage("Analyst", question, "transcript-question"),
      appendMessage(config.clientName, response, "transcript-response")
    );
    transcript.append(item);
    turns.push({ question, response });
    emptyState.hidden = true;
  }

  function sessionText() {
    const lines = [
      `BUS331 Client Interview Simulator — ${config.clientName}`,
      config.caseLabel,
      "Controlled prototype: responses are limited to the approved fictional profile and are not investment recommendations.",
      ""
    ];
    turns.forEach((turn, index) => {
      lines.push(`Exchange ${index + 1}`);
      lines.push(`Analyst: ${turn.question}`);
      lines.push(`${config.clientName}: ${turn.response}`);
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
    notes.value = "";
    emptyState.hidden = false;
    formStatus.textContent = "";
    sessionStatus.textContent = "Local transcript and notes cleared.";
    questionInput.focus();
  });
})();
