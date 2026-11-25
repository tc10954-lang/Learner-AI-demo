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
      guide: "Let's analyse this **English** language technique:\n1. Think about whether it **compares** two things directly.\n2. Ask yourself: does it use the words *'like'* or *'as'*?\n\nIn your own words, how does a metaphor compare two things?",
      keywords: ["compare", "compares", "comparing", "comparison", "without", "direct", "directly", "something", "says"],
      minMatches: 2,
      hint: "💡 **Hint:** A simile uses *'like'* or *'as'*, whereas a **metaphor** directly **compares** two things by saying one thing *is* another!"
    },
    {
      triggers: ["paragraph", "pee", "peel", "essay", "structure", "quote"],
      guide: "Let's structure a strong **English** analytical paragraph:\n1. Start with a clear **Point** answering the question.\n2. Back it up with **Evidence** (a short quote).\n\nWhat comes right after you introduce your quote?",
      keywords: ["explain", "explanation", "analyse", "analysis", "effect", "reader", "zoom"],
      minMatches: 1,
      hint: "💡 **Hint:** Think about **P-E-E**—after Point and Evidence, you need to **explain** the effect on the reader!"
    }
  ],
  Biology: [
    {
      triggers: ["mitochondria", "respiration", "cell", "organelle"],
      guide: "Let's look inside the cell for **Biology**:\n1. Every organelle has a specific job to keep the cell alive.\n2. Think about what process happens inside the **mitochondria** using glucose and oxygen.\n\nWhat vital resource does this process release for the cell?",
      keywords: ["energy", "respiration", "atp", "aerobic"],
      minMatches: 1,
      hint: "💡 **Hint:** Mitochondria release **energy** for the cell during aerobic **respiration**!"
    },
    {
      triggers: ["photosynthesis", "chloroplast", "plant", "leaf"],
      guide: "Let's break down how plants make food in **Biology**:\n1. Plants take in **carbon dioxide** and **water**.\n2. They capture a specific type of energy using green **chlorophyll**.\n\nWhat energy source is needed, and what useful gas do plants release?",
      keywords: ["light", "sun", "sunlight", "oxygen", "glucose"],
      minMatches: 1,
      hint: "💡 **Hint:** Plants use **sunlight** to turn water and carbon dioxide into glucose and **oxygen**!"
    }
  ],
  Chemistry: [
    {
      triggers: ["water", "h2o", "formula", "symbol", "compound"],
      guide: "Let's work out the **Chemistry** behind this compound:\n1. Look at the two elements that bond together to make pure water.\n2. Check how many atoms of each element are in one molecule.\n\nWhich two elements make up water, and what is its chemical formula?",
      keywords: ["h2o", "hydrogen", "oxygen"],
      minMatches: 1,
      hint: "💡 **Hint:** Each molecule has **2 Hydrogen** atoms and **1 Oxygen** atom—put their symbols together!"
    },
    {
      triggers: ["atom", "proton", "neutron", "electron", "bond", "ionic", "covalent"],
      guide: "Let's look at atomic structure in **Chemistry**:\n1. Atoms have a central **nucleus** surrounded by shells.\n2. Subatomic particles have positive (+), negative (−), or neutral (0) charges.\n\nWhich particle orbits in the shells and gets transferred or shared during bonding?",
      keywords: ["electron", "electrons", "negative", "shell", "shells"],
      minMatches: 1,
      hint: "💡 **Hint:** It's the negatively charged particle orbiting outside the nucleus—the **electron**!"
    }
  ],
  Physics: [
    {
      triggers: ["speed", "velocity", "distance", "time", "formula", "calculate"],
      guide: "Let's set up the **Physics** formula triangle:\n1. Think about the units used for speed, such as **metres per second (m/s)**.\n2. Notice how the unit itself tells you which quantity goes on top and which goes on the bottom!\n\nHow do **distance** and **time** combine to give speed?",
      keywords: ["divide", "divided", "distance", "time"],
      minMatches: 2,
      hint: "💡 **Hint:** Look at *metres **per** second*—'per' means **divided by** (Distance ÷ Time)!"
    },
    {
      triggers: ["force", "newton", "gravity", "mass", "acceleration", "energy"],
      guide: "Let's break down this **Physics** principle:\n1. Identify the two main quantities acting on the object.\n2. Think about how changing one quantity affects the motion of the object.\n\nWhat happens to acceleration if you apply a larger force to the same mass?",
      keywords: ["increase", "increases", "faster", "bigger", "greater", "proportional"],
      minMatches: 1,
      hint: "💡 **Hint:** According to Newton's Second Law (**F = m × a**), a bigger force causes greater **acceleration**!"
    }
  ],
  Geography: [
    {
      triggers: ["earthquake", "volcano", "tectonic", "plate", "crust"],
      guide: "Let's look beneath the Earth's surface in **Geography**:\n1. The Earth's crust is broken into giant slabs called **tectonic plates**.\n2. As these plates move, friction causes pressure to build up along plate boundaries.\n\nWhat happens when that built-up pressure is suddenly released?",
      keywords: ["plate", "plates", "tectonic", "friction", "pressure", "collide", "rub", "slip"],
      minMatches: 1,
      hint: "💡 **Hint:** Think about **tectonic plates** getting stuck due to friction and then suddenly slipping!"
    },
    {
      triggers: ["river", "erosion", "coast", "coastal", "water cycle", "weather"],
      guide: "Let's trace this physical **Geography** process step-by-step:\n1. Think about the natural forces at work (water, wind, gravity, or heat).\n2. Consider how material is worn away, transported, or deposited.\n\nWhich natural force is driving the change here?",
      keywords: ["water", "waves", "wind", "evaporation", "condensation", "precipitation", "transport"],
      minMatches: 1,
      hint: "💡 **Hint:** Focus on how moving **water** or **waves** wear away rock and carry sediment!"
    }
  ],
  History: [
    {
      triggers: ["world war", "ww2", "wwii", "ww1", "wwi", "end", "1945", "1918", "war"],
      guide: "Let's place this event on our **History** timeline:\n1. Think about the major turning points in the **20th century** (between 1900 and 1950).\n2. Remember that World War I ended in **1918**, and World War II began roughly two decades later in **1939**.\n\nWhich year did World War II finally come to an end?",
      keywords: ["1945", "1918", "1939", "1914"],
      minMatches: 1,
      hint: "💡 **Hint:** World War II lasted 6 years—add 6 years to **1939**!"
    },
    {
      triggers: ["source", "cause", "causes", "impact", "king", "parliament", "industrial"],
      guide: "Let's use a **History** analytical framework:\n1. Break your thinking into **short-term triggers** and **long-term causes**.\n2. If analysing a source, check its **Nature, Origin, and Purpose (NOP)**.\n\nWhat is one major factor or piece of evidence you can point to?",
      keywords: ["trigger", "long-term", "short-term", "economic", "political", "social", "purpose", "origin", "bias"],
      minMatches: 1,
      hint: "💡 **Hint:** Try grouping your answer into **political**, **economic**, or **social** factors!"
    }
  ],
  "Computer Science": [
    {
      triggers: ["variable", "coding", "program", "data", "store", "memory"],
      guide: "Let's think like a programmer in **Computer Science**:\n1. When a program runs, it needs to remember pieces of information (like a player's score or name).\n2. We give that piece of memory a label so we can use or change it later.\n\nHow would you describe what a **variable** acts like inside a computer's memory?",
      keywords: ["container", "box", "store", "stores", "memory", "value", "data", "label"],
      minMatches: 1,
      hint: "💡 **Hint:** Picture a labelled **box or container** in memory that **stores a value** that can change!"
    },
    {
      triggers: ["loop", "binary", "algorithm", "ram", "rom", "cpu"],
      guide: "Let's break down this **Computer Science** concept:\n1. Identify whether we are dealing with **hardware** (physical parts) or **software/logic** (instructions).\n2. Trace how data moves or repeats step-by-step.\n\nWhat is the main purpose of this component or instruction?",
      keywords: ["repeat", "iteration", "memory", "temporary", "permanent", "process", "execute", "search", "half"],
      minMatches: 1,
      hint: "💡 **Hint:** Focus on its core job—for example, **loops** repeat code, **RAM** is temporary memory, and **binary** uses 0s and 1s!"
    }
  ]
};
  const guides = topicGuides[subject] || [];

  if (activeTopic !== null) {
    // Count WHOLE-WORD matches only (prevents "as" matching inside "massive"!)
    const matchCount = activeTopic.keywords.filter(kw => {
      const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${safeKw}\\b`, 'i').test(lower);
    }).length;

    const needed = activeTopic.minMatches || 1;
    const isSillyQuestion = userText.trim().endsWith("?") && matchCount < needed;

    if (matchCount >= needed && !isSillyQuestion) {
      activeTopic = null;
      return `✅ **Correct! Well done!** You nailed the key concept for **${subject}**.\n\nWant to try another **${subject}** question or switch subjects?`;
    } else {
      return `Not quite! That doesn't match the key **${subject}** concept yet—re-read the guiding steps above (or click **💡 Hint** if you need a nudge).\n\nHave another go! How would you explain it?`;
    }
  }

  const foundTopic = guides.find(g => g.triggers.some(t => lower.includes(t)));
  if (foundTopic) {
    activeTopic = foundTopic;
    return foundTopic.guide;
  }

  const cleanQuestion = userText.replace(/[?.,!]/g, '');
  activeTopic = {
    keywords: cleanQuestion.split(' ').filter(w => w.length > 4).map(w => w.toLowerCase()),
    minMatches: 2,
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
- If they are incorrect or give a silly guess, gently point out the mistake without giving the answer and let them retry.
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

