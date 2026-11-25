const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');

let selectedSubject = null;
let conversationHistory = [];
let liveAIReady = false;

const subjects = [
  "Maths", "English", "Biology", "Chemistry",
  "Physics", "Geography", "History", "Computer Science"
];

function appendMessage(text, className, isMarkdown = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', className);
  if (isMarkdown) {
    msgDiv.innerHTML = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  } else {
    msgDiv.textContent = text;
  }
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showSubjectPrompt() {
  appendMessage("Hello! I'm **Learner AI**—I won't just hand you the answer, I'll guide you on *how* to figure it out yourself. Which Subject Do You Need Assistance With?", 'bot-message', true);

  const optionsDiv = document.createElement('div');
  optionsDiv.classList.add('subject-options');

  subjects.forEach(subject => {
    const btn = document.createElement('button');
    btn.classList.add('subject-btn');
    btn.textContent = subject;
    btn.onclick = () => selectSubject(subject, optionsDiv);
    optionsDiv.appendChild(btn);
  });

  chatMessages.appendChild(optionsDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function selectSubject(subject, optionsDiv) {
  selectedSubject = subject;
  conversationHistory = [];
  optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
  appendMessage(subject, 'user-message');
  userInput.placeholder = `Type a ${subject} question...`;
  appendMessage(`Brilliant! Let's work on **${subject}**. Share a question or problem, and I'll guide you through the method step-by-step.`, 'bot-message', true);
}

// Smart multi-turn Socratic guide when offline/guest
function getSmartSocraticReply(userText, subject, history) {
  const turn = history.filter(m => m.role === "user").length;
  const nums = userText.match(/\d+(\.\d+)?/g);

  if (turn > 1) {
    if (subject === "Maths") {
      return `Good thinking! Now take that step and apply it to the numbers in your problem${nums ? ` (**${nums.join(', ')}**)` : ''}.\n\nWrite down what you get for that step—I'll check your method before we move to the final step!`;
    }
    return `Nice start! Now expand on that idea using a specific example or piece of evidence from your **${subject}** notes.\n\nHow would you put that into one clear sentence?`;
  }

  if (subject === "Maths") {
    if (userText.includes("=")) {
      return `Let's solve **${userText}** using the **balancing method**:\n1. Look at what is happening to the unknown letter.\n2. Use the **inverse (opposite) operation** on both sides.\n\nWhat is the very first operation you should undo?`;
    }
    if (nums && nums.length >= 2) {
      return `Let's look at the numbers **${nums.join(' and ')}** in your problem:\n1. Identify what the question is asking you to find.\n2. Choose the right operation (**+**, **−**, **×**, or **÷**).\n\nWhich operation connects **${nums}** and **${nums}**, and why?`;
    }
    return "Let's break this **Maths** problem down:\n1. **Identify** what information you are given.\n2. **Recall** the formula or rule that links those values.\n\nWhat formula or rule do you think applies here?";
  }

  return `Great **${subject}** question! Instead of giving the answer straight away, let's use a 3-step method:\n1. **Define** the key term in "${userText}".\n2. **Explain** how or why it happens.\n3. **Connect** it back to the question.\n\nIn your own words, what is the main concept here?`;
}

async function fetchAIResponse(userText) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  conversationHistory.push({ role: "user", content: userText });

  const systemPrompt = `You are Learner AI for the World Ready programme, tutoring ${selectedSubject || 'General Studies'}.
CORE RULE — NEVER GIVE THE FINAL ANSWER:
- Do NOT solve the problem for the student or state the final answer, even if they ask directly.
- Teach the learning method: break the problem into small steps, explain the rule or formula, and ask ONE guiding question at a time.
- Use British English spelling (e.g., Maths, colour, programme, analyse).`;

  try {
    if (typeof puter === 'undefined') throw new Error("No Puter");

    // Trigger guest session cleanly on user interaction if not yet signed in
    if (!puter.auth.isSignedIn()) {
      await puter.auth.signIn({ attempt_temp_user_creation: true });
    }

    const response = await puter.ai.chat([
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ], { model: "gpt-4o-mini" });

    const aiReply = response?.message?.content || response.toString();
    typingDiv.remove();
    conversationHistory.push({ role: "assistant", content: aiReply });
    appendMessage(aiReply, 'bot-message', true);
  } catch (err) {
    setTimeout(() => {
      typingDiv.remove();
      const reply = getSmartSocraticReply(userText, selectedSubject, conversationHistory);
      conversationHistory.push({ role: "assistant", content: reply });
      appendMessage(reply, 'bot-message', true);
    }, 500);
  }
}

function handleSend(customText = null) {
  const text = customText || userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user-message');
  if (!customText) userInput.value = '';

  if (!selectedSubject) {
    appendMessage("Please click one of the subjects above first!", 'bot-message');
    return;
  }
  fetchAIResponse(text);
}

hintBtn.addEventListener('click', () => {
  if (!selectedSubject || conversationHistory.length === 0) {
    appendMessage("Type a question first, then click **💡 Hint** if you get stuck!", 'bot-message', true);
    return;
  }
  handleSend("I'm stuck. Give me a small hint on the method without telling me the answer.");
});

resetBtn.addEventListener('click', () => {
  selectedSubject = null;
  userInput.placeholder = "Select a subject first...";
  showSubjectPrompt();
});

sendBtn.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

showSubjectPrompt();
