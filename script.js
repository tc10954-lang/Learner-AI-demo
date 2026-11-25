const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');

let selectedSubject = null;
let conversationHistory = [];
let activeMathProblem = null;
let activeTopic = null;

const subjects = [
  "Maths", "English", "Biology", "Chemistry",
  "Physics", "Geography", "History", "Computer Science"
];

const topicGuides = {
  English: [
    {
      triggers: ["metaphor", "simile", "personification", "imagery", "technique"],
      guide: "Let's analyse this **English** language technique:\n1. Think about whether it **compares** two things or gives human qualities to an object.\n2. Ask yourself: does it use the words *'like'* or *'as'*?\n\nHow would you describe how this technique creates an image for the reader?",
      keywords: ["compare", "comparing", "comparison", "without", "like", "as", "human", "object", "image", "direct"],
      hint: "💡 **Hint:** A **simile** uses *'like'* or *'as'*, whereas a **metaphor** says something *is* something else directly!"
    },
    {
      triggers: ["paragraph", "pee", "peel", "essay", "structure", "quote"],
      guide: "Let's structure a strong **English** analytical paragraph:\n1. Start with a clear **Point** answering the question.\n2. Back it up with **Evidence** (a short quote).\n\nWhat comes right after you introduce your quote?",
      keywords: ["explain", "explanation", "analyse", "analysis", "effect", "reader", "link", "zoom"],
      hint: "💡 **Hint:** Think about **P-E-E** or **P-E-E-L**—after Point and Evidence, you need to **E**xplain the effect on the reader!"
    }
  ],
  Biology: [
    {
      triggers: ["mitochondria", "respiration", "cell", "organelle"],
      guide: "Let's look inside the cell for **Biology**:\n1. Every organelle has a specific job to keep the cell alive.\n2. Think about what process happens inside the **mitochondria** using glucose and oxygen.\n\nWhat vital resource does this process release for the cell?",
      keywords: ["energy", "respiration", "atp", "aerobic", "power"],
      hint: "💡 **Hint:** Mitochondria are often called the powerhouse of the cell because they release **energy** during aerobic **respiration**!"
    },
    {
      triggers: ["photosynthesis", "chloroplast", "plant", "leaf"],
      guide: "Let's break down how plants make food in **Biology**:\n1. Plants take in **carbon dioxide** and **water**.\n2. They capture a specific type of energy using green **chlorophyll**.\n\nWhat energy source is needed, and what useful gas do plants release?",
      keywords: ["light", "sun", "sunlight", "oxygen", "glucose", "sugar"],
      hint: "💡 **Hint:** Plants use **sunlight** to turn water and carbon dioxide into glucose and **oxygen**!"
    }
  ],
  Chemistry: [
    {
      triggers: ["water", "h2o", "formula", "symbol", "compound"],
      guide: "Let's work out the **Chemistry** behind this compound:\n1. Look at the two elements that bond together to make pure water.\n2. Check how many atoms of each element are in one molecule.\n\nWhich two elements make up water, and what is its chemical formula?",
      keywords: ["h2o", "hydrogen", "oxygen", "two", "2"],
      hint: "💡 **Hint:** Each molecule has **2 Hydrogen** atoms and **1 Oxygen** atom—put their symbols together!"
    },
    {
      triggers: ["atom", "proton", "neutron", "electron", "bond", "ionic", "covalent"],
      guide: "Let's look at atomic structure in **Chemistry**:\n1. Atoms have a central **nucleus** surrounded by shells.\n2. Subatomic particles have positive (+), negative (−), or neutral (0) charges.\n\nWhich particle orbits in the shells and gets transferred or shared during bonding?",
      keywords: ["electron", "electrons", "negative", "shell", "shells", "share", "transfer"],
      hint: "💡 **Hint:** It's the negatively charged particle orbiting outside the nucleus—the **electron**!"
    }
  ],
  Physics: [
    {
      triggers: ["speed", "velocity", "distance", "time", "formula", "calculate"],
      guide: "Let's set up the **Physics** formula triangle:\n1. Think about the units used for speed, such as **metres per second (m/s)** or **mph**.\n2. Notice how the unit itself tells you which quantity goes on top and which goes on the bottom!\n\nHow do **distance** and **time** combine to give speed?",
      keywords: ["divide", "divided", "distance", "time", "d/t", "over"],
      hint: "💡 **Hint:** Look at *metres **per** second*—'per' means **divided by** (Distance ÷ Time)!"
    },
    {
      triggers: ["force", "newton", "gravity", "mass", "acceleration", "energy"],
      guide: "Let's break down this **Physics** principle:\n1. Identify the two main quantities acting on the object.\n2. Think about how changing one quantity affects the motion or energy of the object.\n\nWhat happens to acceleration if you apply a larger force to the same mass?",
      keywords: ["increase", "increases", "faster", "bigger", "greater", "f=ma", "proportional"],
      hint: "💡 **Hint:** According to Newton's Second Law (**F = m × a**), a bigger force causes greater **acceleration**!"
    }
  ],
  Geography: [
    {
      triggers: ["earthquake", "volcano", "tectonic", "plate", "crust"],
      guide: "Let's look beneath the Earth's surface in **Geography**:\n1. The Earth's crust is broken into giant slabs called **tectonic plates**.\n2. As these plates move, friction causes pressure to build up along plate boundaries.\n\nWhat happens when that built-up pressure is suddenly released?",
      keywords: ["plate", "plates", "tectonic", "friction", "pressure", "move", "collide", "rub", "boundary", "crust"],
      hint: "💡 **Hint:** Think about **tectonic plates** getting stuck due to friction and then suddenly slipping!"
    },
    {
      triggers: ["river", "erosion", "coast", "coastal", "water cycle", "weather"],
      guide: "Let's trace this physical **Geography** process step-by-step:\n1. Think about the natural forces at work (water, wind, gravity, or heat).\n2. Consider how material is worn away, transported, or deposited.\n\nWhich natural force is driving the change here?",
      keywords: ["water", "waves", "wind", "evaporation", "condensation", "precipitation", "wear", "transport"],
      hint: "💡 **Hint:** Focus on how moving **water** or **waves** wear away rock and carry sediment!"
    }
  ],
  History: [
    {
      triggers: ["world war", "ww2", "wwii", "ww1", "wwi", "end", "1945", "1918", "war"],
      guide: "Let's place this event on our **History** timeline:\n1. Think about the major turning points in the **20th century** (between 1900 and 1950).\n2. Remember that World War I ended in **1918**, and World War II began roughly two decades later in **1939**.\n\nWhich year did World War II finally come to an end?",
      keywords: ["1945", "1918", "1939", "1914", "surrender", "allies"],
      hint: "💡 **Hint:** World War II lasted 6 years—add 6 years to **1939**!"
    },
    {
      triggers: ["source", "cause", "causes", "impact", "king", "parliament", "industrial"],
      guide: "Let's use a **History** analytical framework:\n1. Break your thinking into **short-term triggers** and **long-term causes**.\n2. If analysing a source, check its **Nature, Origin, and Purpose (NOP)**.\n\nWhat is one major factor or piece of evidence you can point to?",
      keywords: ["trigger", "long-term", "short-term", "economic", "political", "social", "purpose", "origin", "bias"],
      hint: "💡 **Hint:** Try grouping your answer into **political**, **economic**, or **social** factors!"
    }
  ],
  "Computer Science": [
    {
      triggers: ["variable", "coding", "program", "data", "store", "memory"],
      guide: "Let's think like a programmer in **Computer Science**:\n1. When a program runs, it needs to remember pieces of information (like a player's score or name).\n2. We give that piece of memory a label so we can use or change it later.\n\nHow would you describe what a **variable** acts like inside a computer's memory?",
      keywords: ["container", "box", "store", "stores", "memory", "value", "data", "change", "label"],
      hint: "💡 **Hint:** Picture a labelled **box or container** in memory that **stores a value** that can change!"
    },
    {
      triggers: ["loop", "binary", "algorithm", "ram", "rom", "cpu"],
      guide: "Let's break down this **Computer Science** concept:\n1. Identify whether we are dealing with **hardware** (physical parts) or **software/logic** (instructions).\n2. Trace how data moves or repeats step-by-step.\n\nWhat is the main purpose of this component or instruction?",
      keywords: ["repeat", "iteration", "memory", "temporary", "permanent", "process", "execute", "search", "half", "0", "1"],
      hint: "💡 **Hint:** Focus on its core job—for example, **loops** repeat code, **RAM** is temporary memory, and **binary** uses 0s and 1s!"
    }
  ]
};
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
  activeMathProblem = null;
  activeTopic = null;
  optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
  appendMessage(subject, 'user-message');
  userInput.placeholder = `Type a ${subject} question...`;
  appendMessage(`Brilliant! Let's work on **${subject}**. Share a question or problem, and I'll guide you through the method step-by-step.`, 'bot-message', true);
}

function evaluateExpression(expr) {
  const cleaned = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').trim();
  if (/^[0-9+\-*/().\s]+$/.test(cleaned) && /[+\-*/]/.test(cleaned)) {
    try {
      const val = Function(`"use strict"; return (${cleaned})`)();
      return Number.isFinite(val) ? val : null;
    } catch { return null; }
  }
  return null;
}

function getSmartSocraticReply(userText, subject, history) {
  const lower = userText.toLowerCase();

  if (subject === "Maths") {
    const possibleAnswer = evaluateExpression(userText);
    if (possibleAnswer !== null && !userText.includes("=")) {
      const opSymbol = userText.includes('+') ? '+' : userText.includes('-') ? '-' : userText.includes('*') ? '*' : '/';
      const opNames = {
        '+': ['addition', 'add', 'plus', 'sum'],
        '-': ['subtraction', 'subtract', 'minus', 'take away'],
        '*': ['multiplication', 'multiply', 'times'],
        '/': ['division', 'divide', 'divided']
      };
      activeMathProblem = { expr: userText.trim(), answer: possibleAnswer, opSymbol, validWords: opNames[opSymbol] };
      const nums = userText.match(/\d+(\.\d+)?/g) || [];
      return `Let's look at the numbers **${nums.join(' and ')}** in your problem:\n1. Identify what the question is asking you to find.\n2. Choose the right operation (**+**, **−**, **×**, or **÷**).\n\nWhich operation connects **${nums[0]}** and **${nums[1]}**, and why?`;
    }

    if (activeMathProblem !== null) {
      const allOpWords = ['addition', 'add', 'plus', 'subtraction', 'subtract', 'minus', 'multiplication', 'multiply', 'times', 'division', 'divide'];
      const mentionedWords = allOpWords.filter(w => lower.includes(w));

      if (mentionedWords.length > 0) {
        const hasWrongWord = mentionedWords.some(w => !activeMathProblem.validWords.includes(w));
        if (hasWrongWord) {
          return `Hold on—check that symbol again! The **${activeMathProblem.opSymbol}** sign isn't that operation.\n\nWhat operation does **${activeMathProblem.opSymbol}** actually stand for?`;
        }
      }

      const userNums = userText.match(/-?\d+(\.\d+)?/g);
      if (userNums) {
        const lastNum = parseFloat(userNums[userNums.length - 1]);
        if (Math.abs(lastNum - activeMathProblem.answer) < 0.0001) {
          const solvedExpr = activeMathProblem.expr;
          activeMathProblem = null;
          return `✅ **Correct! Well done!** You worked out **${solvedExpr}** using the right method.\n\nReady to try another Maths problem?`;
        } else if (!userText.includes(activeMathProblem.expr)) {
          return `Not quite! Check your calculation again—apply **${activeMathProblem.validWords[0]}** step-by-step to **${activeMathProblem.expr}**.\n\nHave another go! What do you get?`;
        }
      }

      return `Spot on! That's **${activeMathProblem.validWords[0]}** (**${activeMathProblem.opSymbol}**). Now apply it to **${activeMathProblem.expr}**.\n\nWhat final value do you get?`;
    }

    if (userText.includes("=")) {
      return `Let's solve **${userText}** using the **balancing method**:\n1. Look at what is happening to the unknown letter.\n2. Use the **inverse (opposite) operation** on both sides.\n\nWhat is the very first operation you should undo?`;
    }

    return "Let's break this **Maths** problem down:\n1. **Identify** what information you are given.\n2. **Choose** the right operation or formula.\n\nWhat is the first step you think we should take?";
  }

  const guides = topicGuides[subject] || [];

  if (activeTopic !== null) {
    const matched = activeTopic.keywords.some(kw => lower.includes(kw));
    if (matched) {
      activeTopic = null;
      return `✅ **Correct! Well done!** You nailed the key concept for **${subject}**.\n\nWant to try another **${subject}** question or switch subjects?`;
    } else {
      return `You're thinking along the right lines, but you're missing a key detail! Re-read the guiding steps above (or click **💡 Hint** if you need a nudge).\n\nHow would you refine your answer?`;
    }
  }

  const foundTopic = guides.find(g => g.triggers.some(t => lower.includes(t)));
  if (foundTopic) {
    activeTopic = foundTopic;
    return foundTopic.guide;
  }

  const cleanQuestion = userText.replace(/[?.,!]/g, '');
  activeTopic = {
    keywords: cleanQuestion.split(' ').filter(w => w.length > 3).map(w => w.toLowerCase()),
    hint: `💡 **Hint:** Focus on defining the core terms in **"${userText}"** and explaining *why* or *how* it works in **${subject}**!`
  };

  return `Let's work through **"${userText}"** together using a **${subject}** revision method:\n1. **Define** the main term or process involved.\n2. **Explain** the cause, function, or effect in clear steps.\n\nWhat do you already know about this topic?`;
}

async function fetchAIResponse(userText) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  conversationHistory.push({ role: "user", content: userText });

  const systemPrompt = `You are Learner AI for the World Ready programme, tutoring ${selectedSubject || 'General Studies'}.
CORE RULE — NEVER GIVE THE FINAL ANSWER FIRST:
- Do NOT solve the problem for the student or state the final answer upfront.
- Teach the learning method step-by-step and ask ONE guiding question at a time.
- When the student replies with the CORRECT answer or concept, praise them with "✅ Correct! Well done!" and confirm why their method worked.
- If they are incorrect, gently point out the mistake without giving the answer and let them retry.
- Use British English spelling (e.g., Maths, colour, programme, analyse).`;

  try {
    if (typeof puter === 'undefined') throw new Error("No Puter");
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
  if (activeMathProblem) {
    appendMessage(`💡 **Hint:** Look at the symbol in **${activeMathProblem.expr}** and combine the two numbers step-by-step. Give it a try!`, 'bot-message', true);
    return;
  }
  if (activeTopic && activeTopic.hint) {
    appendMessage(activeTopic.hint, 'bot-message', true);
    return;
  }
  handleSend("I'm stuck. Give me a small hint on the method without telling me the answer.");
});

resetBtn.addEventListener('click', () => {
  selectedSubject = null;
  activeMathProblem = null;
  activeTopic = null;
  userInput.placeholder = "Select a subject first...";
  showSubjectPrompt();
});

sendBtn.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

showSubjectPrompt();
