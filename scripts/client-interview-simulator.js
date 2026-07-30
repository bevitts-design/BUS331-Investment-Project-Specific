(() => {
  "use strict";

  const root = document.querySelector("[data-client-interview-simulator]");
  if (!root) return;

  const config = JSON.parse(root.querySelector("[data-simulator-config]").textContent);
  const live = config.liveMode;
  const form = root.querySelector("[data-interview-form]");
  const questionInput = form.querySelector("textarea");
  const sendButton = form.querySelector("[data-send-question]");
  const startButton = root.querySelector("[data-start-interview]");
  const endButton = root.querySelector("[data-end-interview]");
  const recordButton = root.querySelector("[data-record-question]");
  const connectionState = root.querySelector("[data-connection-state]");
  const recordStatus = root.querySelector("[data-record-status]");
  const formStatus = root.querySelector("[data-form-status]");
  const sessionStatus = root.querySelector("[data-session-status]");
  const transcript = root.querySelector("[data-interview-transcript]");
  const emptyState = root.querySelector("[data-empty-transcript]");
  const notes = root.querySelector("#interview-notes");
  const suggestedButtons = [...root.querySelectorAll("[data-suggested-question]")];
  const serviceOverrides = window.BUS331_CLIENT_INTERVIEW || {};
  const state = {
    active: false,
    busy: false,
    recording: false,
    history: [],
    messages: [],
    mediaStream: null,
    mediaRecorder: null,
    audioChunks: [],
    discardRecording: false,
    recordingTimer: null,
    sessionTimer: null,
    utterance: null
  };

  const endpoint = (name) => serviceOverrides[name] || live[name];
  const userTurnCount = () => state.history.filter((item) => item.role === "user").length;
  const atTurnLimit = () => userTurnCount() >= live.maximumTurns;

  function updateControls() {
    const questionLocked = !state.active || state.busy || state.recording || atTurnLimit();
    startButton.disabled = state.active || state.busy;
    endButton.disabled = !state.active;
    recordButton.disabled = !state.active || (state.busy && !state.recording) || atTurnLimit();
    questionInput.disabled = questionLocked;
    sendButton.disabled = questionLocked;
    suggestedButtons.forEach((button) => { button.disabled = questionLocked; });
  }

  function setBusy(busy, message = "") {
    state.busy = busy;
    if (message) connectionState.textContent = message;
    updateControls();
  }

  async function requestJson(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    let result = {};
    try {
      result = await response.json();
    } catch {
      // The user-facing fallback below handles non-JSON server errors.
    }
    if (!response.ok) throw new Error(result.error || `Interview service unavailable (${response.status}).`);
    return result;
  }

  function appendMessage(role, message) {
    const item = document.createElement("li");
    const paragraph = document.createElement("p");
    const label = document.createElement("strong");
    const speaker = role === "user" ? "Analyst" : config.clientName;
    paragraph.className = role === "user" ? "transcript-question" : "transcript-response";
    label.textContent = `${speaker}: `;
    paragraph.append(label, document.createTextNode(message));
    item.append(paragraph);
    transcript.append(item);
    transcript.scrollTop = transcript.scrollHeight;
    emptyState.hidden = true;
    state.messages.push({ role, speaker, content: message });
  }

  function speakClientResponse(transcript) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      connectionState.textContent = "Response ready to read in the transcript.";
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.addEventListener("start", () => { connectionState.textContent = `${config.clientName} is speaking.`; }, { once: true });
    utterance.addEventListener("end", () => {
      if (state.active && !state.busy) connectionState.textContent = "Interview ready";
    }, { once: true });
    utterance.addEventListener("error", () => { connectionState.textContent = "Response ready to read in the transcript."; }, { once: true });
    state.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stopMediaStream() {
    state.mediaStream?.getTracks().forEach((track) => track.stop());
    state.mediaStream = null;
  }

  function resetRecordingUi() {
    clearTimeout(state.recordingTimer);
    state.recordingTimer = null;
    state.recording = false;
    recordButton.textContent = "Start recording";
    recordButton.setAttribute("aria-pressed", "false");
    recordButton.classList.remove("is-recording");
    stopMediaStream();
    updateControls();
  }

  function chooseRecordingType() {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    return candidates.find((type) => window.MediaRecorder?.isTypeSupported(type)) || "";
  }

  function blobToBase64(blob) {
    return blob.arrayBuffer().then((buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
      }
      return btoa(binary);
    });
  }

  async function transcribeRecording(blob) {
    setBusy(true, "Transcribing your question…");
    recordStatus.textContent = "The recorded audio is being transcribed. No raw audio is saved by the portal.";
    try {
      const result = await requestJson(endpoint("transcriptionEndpoint"), {
        audioBase64: await blobToBase64(blob),
        mimeType: blob.type
      });
      questionInput.value = result.transcript;
      formStatus.textContent = "Review and edit the transcript, then ask Eleanor.";
      recordStatus.textContent = "Transcript ready. Record again if it did not capture your question accurately.";
      connectionState.textContent = "Interview ready";
      questionInput.focus();
      questionInput.select();
    } catch (error) {
      recordStatus.textContent = `${error.message} You can record again or type the question.`;
      connectionState.textContent = "Interview ready";
    } finally {
      setBusy(false);
    }
  }

  async function beginRecording() {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      recordStatus.textContent = "Recording is not supported in this browser. Type your question below.";
      questionInput.focus();
      return;
    }
    try {
      state.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      state.audioChunks = [];
      const mimeType = chooseRecordingType();
      state.mediaRecorder = new MediaRecorder(state.mediaStream, mimeType ? { mimeType } : undefined);
      state.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) state.audioChunks.push(event.data);
      });
      state.mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(state.audioChunks, { type: state.mediaRecorder.mimeType || "audio/webm" });
        state.audioChunks = [];
        const shouldDiscard = state.discardRecording;
        state.discardRecording = false;
        resetRecordingUi();
        if (!shouldDiscard && blob.size) transcribeRecording(blob);
      }, { once: true });
      state.mediaRecorder.start();
      state.recording = true;
      recordButton.textContent = "Stop and transcribe";
      recordButton.setAttribute("aria-pressed", "true");
      recordButton.classList.add("is-recording");
      recordStatus.textContent = "Recording. Ask one question, then stop.";
      connectionState.textContent = "Listening…";
      state.recordingTimer = setTimeout(() => stopRecording(), 45000);
      updateControls();
    } catch {
      resetRecordingUi();
      recordStatus.textContent = "Microphone access was unavailable. Continue by typing your question below.";
      connectionState.textContent = "Typed interview ready";
      questionInput.focus();
    }
  }

  function stopRecording() {
    if (!state.recording || state.mediaRecorder?.state !== "recording") return;
    connectionState.textContent = "Preparing transcript…";
    state.mediaRecorder.stop();
  }

  async function startInterview() {
    if (state.active || state.busy) return;
    setBusy(true, "Connecting to Eleanor…");
    sessionStatus.textContent = "";
    try {
      const result = await requestJson(endpoint("responseEndpoint"), { begin: true, history: [] });
      state.active = true;
      state.history = [{ role: "assistant", content: result.transcript }];
      appendMessage("assistant", result.transcript);
      connectionState.textContent = "Interview ready";
      recordStatus.textContent = "Record a question or type one below.";
      state.sessionTimer = setTimeout(() => endInterview("The interview ended after the time limit."), live.maximumMinutes * 60000);
      speakClientResponse(result.transcript);
    } catch (error) {
      connectionState.textContent = "Service unavailable";
      sessionStatus.textContent = `${error.message} The instructor-hosted service must be running before a live interview can begin.`;
    } finally {
      setBusy(false);
    }
  }

  function endInterview(message = "Interview ended. Your visible transcript and notes remain available.") {
    if (state.recording) {
      state.discardRecording = true;
      stopRecording();
    }
    clearTimeout(state.sessionTimer);
    state.sessionTimer = null;
    state.active = false;
    state.busy = false;
    window.speechSynthesis?.cancel();
    stopMediaStream();
    connectionState.textContent = "Ended";
    recordStatus.textContent = "Start a new interview to ask more questions.";
    sessionStatus.textContent = message;
    updateControls();
  }

  async function submitQuestion(question) {
    if (!state.active || state.busy || atTurnLimit()) return;
    setBusy(true, `${config.clientName} is considering your question…`);
    formStatus.textContent = "Sending your confirmed question…";
    try {
      const result = await requestJson(endpoint("responseEndpoint"), {
        question,
        history: state.history
      });
      appendMessage("user", question);
      appendMessage("assistant", result.transcript);
      state.history.push({ role: "user", content: question }, { role: "assistant", content: result.transcript });
      questionInput.value = "";
      formStatus.textContent = atTurnLimit()
        ? "Turn limit reached. Preserve your transcript and continue to the Decision Record."
        : "Response added. Ask a follow-up or move to another discovery area.";
      connectionState.textContent = atTurnLimit() ? "Turn limit reached" : "Interview ready";
      speakClientResponse(result.transcript);
    } catch (error) {
      formStatus.textContent = `${error.message} Your question remains in the box so you can try again.`;
      connectionState.textContent = "Interview ready";
    } finally {
      setBusy(false);
      if (!atTurnLimit()) questionInput.focus();
    }
  }

  function sessionText() {
    const lines = [
      `BUS331 Client Voice Interview — ${config.clientName}`,
      config.caseLabel,
      "Fictional client. AI output is a process record, not verified evidence or an investment recommendation.",
      ""
    ];
    state.messages.forEach((message) => lines.push(`${message.speaker}: ${message.content}`, ""));
    lines.push("Analyst notes for the Decision Record:", notes.value.trim() || "[No notes recorded]");
    return lines.join("\n");
  }

  function clearSession() {
    if (state.active) endInterview("Interview ended and the local session was cleared.");
    state.history = [];
    state.messages = [];
    transcript.replaceChildren();
    emptyState.hidden = false;
    notes.value = "";
    questionInput.value = "";
    window.speechSynthesis?.cancel();
    connectionState.textContent = "Not started";
    recordStatus.textContent = "Start the interview first.";
    formStatus.textContent = "";
    sessionStatus.textContent = "Local transcript and notes cleared.";
    updateControls();
  }

  startButton.addEventListener("click", startInterview);
  endButton.addEventListener("click", () => endInterview());
  recordButton.addEventListener("click", () => state.recording ? stopRecording() : beginRecording());

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question) {
      formStatus.textContent = "Record or type one interview question.";
      questionInput.focus();
      return;
    }
    submitQuestion(question);
  });

  suggestedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      questionInput.value = button.textContent.trim();
      formStatus.textContent = "Opening idea loaded. Edit it into your own question before sending.";
      questionInput.focus();
    });
  });

  root.querySelector("[data-copy-session]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(sessionText());
      sessionStatus.textContent = "Transcript and notes copied. Verify material claims separately before using them in a decision.";
    } catch {
      sessionStatus.textContent = "Copy was unavailable in this browser. Use Download .txt instead.";
    }
  });

  root.querySelector("[data-download-session]").addEventListener("click", () => {
    const blob = new Blob([sessionText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BUS331-Eleanor-Vance-voice-interview.txt";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    sessionStatus.textContent = "Transcript and notes downloaded as a local text file.";
  });

  root.querySelector("[data-clear-session]").addEventListener("click", clearSession);
  window.addEventListener("beforeunload", () => {
    stopMediaStream();
    window.speechSynthesis?.cancel();
  });

  updateControls();
})();
