// The browser owns the conversation for this tab; nothing is saved to a database.
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const clearButton = document.querySelector("#clear-chat");
const messagesElement = document.querySelector("#chat-messages");
const promptButtons = document.querySelectorAll("[data-prompt]");

const greeting = {
  role: "model",
  text: "Hi there! I’m your kitchen sidekick. Tell me what ingredients you have, what you’re craving, or where you’re stuck. Let’s make something delicious. 🥕",
};
let history = [];
let isSending = false;

function addMessage(role, text, options = {}) {
  const message = document.createElement("article");
  message.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;
  if (options.error) message.classList.add("error-message");
  if (options.thinking) message.classList.add("thinking");

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role === "user" ? "user-avatar" : "assistant-avatar"}`;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "You" : "✳";

  const content = document.createElement("div");
  content.className = "message-content";
  const author = document.createElement("span");
  author.className = "message-author";
  author.textContent = role === "user" ? "You" : "Chef.GPT";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const paragraph = document.createElement("p");
  // textContent prevents user or model text from being interpreted as HTML.
  paragraph.textContent = text;
  bubble.append(paragraph);
  content.append(author, bubble);
  message.append(avatar, content);
  messagesElement.append(message);
  messagesElement.scrollTop = messagesElement.scrollHeight;
  return message;
}

function setBusy(busy) {
  isSending = busy;
  sendButton.disabled = busy;
  clearButton.disabled = busy;
  input.disabled = busy;
  promptButtons.forEach((button) => {
    button.disabled = busy;
  });
  sendButton.querySelector("span:first-child").textContent = busy ? "Thinking" : "Send";
}

async function sendMessage(rawMessage) {
  const message = rawMessage.trim();
  if (!message || isSending) return;

  addMessage("user", message);
  input.value = "";
  input.style.height = "auto";
  const thinkingMessage = addMessage("model", "Thinking through a recipe...", { thinking: true });
  setBusy(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Chef.GPT returned an unexpected response. Please try again.");
    }
    if (!response.ok) {
      throw new Error(data.error || "I couldn't send that just now. Please try again.");
    }
    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("Chef.GPT sent an empty reply. Please try asking again.");
    }

    thinkingMessage.remove();
    addMessage("model", data.reply);
    history.push({ role: "user", text: message }, { role: "model", text: data.reply });
    history = history.slice(-10);
  } catch (error) {
    thinkingMessage.remove();
    const friendlyMessage = error instanceof TypeError
      ? "I couldn't connect to Chef.GPT. Check your connection and try again."
      : error.message;
    addMessage("model", friendlyMessage, { error: true });
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!isSending && input.value.trim()) form.requestSubmit();
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 110)}px`;
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt || "";
    if (!isSending) sendMessage(input.value);
  });
});

clearButton.addEventListener("click", () => {
  if (isSending) return;
  history = [];
  messagesElement.replaceChildren();
  addMessage("model", greeting.text);
  input.value = "";
  input.focus();
});
