// ============================================================
//  Gadjah Mada High School — AI Assistant Widget
//  Powered by Claude (Anthropic API via claude.ai proxy)
// ============================================================

(function () {
  /* ---- School context given to the AI ---- */
  const SYSTEM_PROMPT = `You are the official AI assistant for Gadjah Mada High School (SMA Gadjah Mada), an elite high school established in 1985 in West Jakarta, Indonesia.

You help visitors, prospective students, parents, and community members with questions about the school.

Key facts about the school:
- Founded: 1985 | Location: Jendral Soedirman 12, West Jakarta
- Phone: (+62)812-3100-3000 | Office hours: Mon–Fri, 7:30 AM – 5:00 PM
- School hours: Mon–Fri 7:00 AM – 4:30 PM
- 98% university admission rate | 2,800+ students | 120+ expert faculty | 85+ awards
- Accredited and award-winning (2025)
- Programs: STEM, Humanities, Arts & Music, Sports, University Prep
- Student orgs: Student Council (OSIS), Science Club, Arts Collective, Sports Federation, Debate Society, Robotics Club
- Notable achievements: National Academic Excellence Award (2020–2025), National Robotics Champions (2025), UNESCO School of the Year APAC (2023), Best Performing Arts (2024), State Multi-Sport Champions (2024), Green School Platinum Certification (2023)

Admissions:
- Open Days are scheduled — direct inquiries to admissions@gadjahmadaschool.sch.id
- Scholarships available — contact the admissions office
- For tuition, fees, and applications, direct visitors to the Contact section or call the office

Tone: warm, professional, proud of the school. Always respond in English only, regardless of the language the user writes in. Keep answers concise but helpful. If you don't know something specific, kindly direct them to contact the school directly.`;

  /* ---- Inject CSS ---- */
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --cb-navy: #0B1F3A;
      --cb-gold: #C9A84C;
      --cb-gold-light: #F0D080;
      --cb-cream: #FAF7F0;
    }
    #gm-chat-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 60px; height: 60px; border-radius: 50%;
      background: var(--cb-gold); border: none; cursor: pointer;
      box-shadow: 0 8px 32px rgba(201,168,76,.45), 0 2px 8px rgba(0,0,0,.2);
      display: flex; align-items: center; justify-content: center;
      transition: transform .25s, box-shadow .25s;
    }
    #gm-chat-fab:hover { transform: scale(1.08) translateY(-2px); box-shadow: 0 16px 48px rgba(201,168,76,.5), 0 4px 12px rgba(0,0,0,.25); }
    #gm-chat-fab svg { pointer-events: none; }
    
    #gm-chat-badge {
      position: absolute; top: -3px; right: -3px;
      width: 18px; height: 18px; background: #e63946; border-radius: 50%;
      border: 2px solid #fff; display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #fff; font-weight: 700; font-family: 'DM Sans', sans-serif;
      animation: gm-pulse 2s infinite;
    }
    @keyframes gm-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
    
    #gm-chat-window {
      position: fixed; bottom: 100px; right: 28px; z-index: 9998;
      width: 380px; max-width: calc(100vw - 40px);
      height: 560px; max-height: calc(100vh - 130px);
      background: var(--cb-navy); border-radius: 18px;
      border: 1.5px solid rgba(201,168,76,.35);
      box-shadow: 0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(201,168,76,.1);
      display: flex; flex-direction: column; overflow: hidden;
      font-family: 'DM Sans', sans-serif; transform-origin: bottom right;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .3s;
    }
    #gm-chat-window.gm-hidden { transform: scale(.85) translateY(20px); opacity: 0; pointer-events: none; }
    
    .gm-chat-header {
      background: linear-gradient(135deg, #0e2845 0%, #0B1F3A 100%);
      border-bottom: 1.5px solid rgba(201,168,76,.3); padding: 16px 18px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .gm-header-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--cb-gold); display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif; font-weight: 900; font-size: 17px;
      color: var(--cb-navy); flex-shrink: 0; position: relative;
    }
    .gm-header-avatar::after {
      content: ''; position: absolute; bottom: 1px; right: 1px;
      width: 10px; height: 10px; background: #2dc653; border-radius: 50%;
      border: 2px solid var(--cb-navy);
    }
    .gm-header-info { flex: 1; min-width: 0; }
    .gm-header-name { color: #fff; font-weight: 600; font-size: 14px; letter-spacing: .3px; }
    .gm-header-status { color: rgba(255,255,255,.45); font-size: 11px; letter-spacing: .5px; }
    .gm-close-btn {
      background: rgba(255,255,255,.07); border: none; width: 30px; height: 30px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,.5); transition: background .2s, color .2s; flex-shrink: 0;
    }
    .gm-close-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
    
    .gm-messages {
      flex: 1; overflow-y: auto; padding: 18px 16px;
      display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.3) transparent;
    }
    .gm-messages::-webkit-scrollbar { width: 4px; }
    .gm-messages::-webkit-scrollbar-thumb { background: rgba(201,168,76,.3); border-radius: 4px; }
    
    .gm-msg { display: flex; flex-direction: column; max-width: 88%; animation: gm-msg-in .3s ease both; }
    @keyframes gm-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .gm-msg.gm-user { align-self: flex-end; align-items: flex-end; }
    .gm-msg.gm-bot { align-self: flex-start; align-items: flex-start; }
    
    .gm-bubble { padding: 11px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.6; word-break: break-word; }
    .gm-user .gm-bubble { background: var(--cb-gold); color: var(--cb-navy); font-weight: 500; border-bottom-right-radius: 4px; }
    .gm-bot .gm-bubble { background: rgba(255,255,255,.07); color: rgba(255,255,255,.88); border: 1px solid rgba(255,255,255,.1); border-bottom-left-radius: 4px; }
    .gm-time { font-size: 10px; color: rgba(255,255,255,.25); margin-top: 4px; padding: 0 4px; }
    
    .gm-typing .gm-bubble { display: flex; align-items: center; gap: 4px; padding: 14px 16px; }
    .gm-dot { width: 7px; height: 7px; background: var(--cb-gold); border-radius: 50%; animation: gm-bounce 1.2s infinite ease-in-out; }
    .gm-dot:nth-child(2) { animation-delay: .15s; }
    .gm-dot:nth-child(3) { animation-delay: .3s; }
    @keyframes gm-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-5px); opacity: 1; } }
    
    .gm-suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; flex-shrink: 0; }
    .gm-chip {
      background: rgba(201,168,76,.12); border: 1px solid rgba(201,168,76,.3);
      color: var(--cb-gold); font-size: 11px; padding: 5px 12px; border-radius: 20px;
      cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: .3px;
      transition: background .2s, border-color .2s; white-space: nowrap;
    }
    .gm-chip:hover { background: rgba(201,168,76,.25); border-color: rgba(201,168,76,.6); }
    
    .gm-input-row { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-top: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.2); flex-shrink: 0; }
    .gm-input {
      flex: 1; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
      border-radius: 24px; padding: 9px 16px; color: #fff; font-size: 13.5px;
      font-family: 'DM Sans', sans-serif; outline: none; transition: border-color .2s;
      resize: none; line-height: 1.4; max-height: 90px; overflow-y: auto;
    }
    .gm-input::placeholder { color: rgba(255,255,255,.28); }
    .gm-input:focus { border-color: rgba(201,168,76,.5); }
    .gm-send-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: var(--cb-gold); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .2s, transform .15s; flex-shrink: 0;
    }
    .gm-send-btn:hover:not(:disabled) { background: var(--cb-gold-light); transform: scale(1.07); }
    .gm-send-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
    .gm-send-btn svg { pointer-events: none; }
  `;
  document.head.appendChild(style);

  /* ---- Build HTML ---- */
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- FAB Button -->
    <button id="gm-chat-fab" aria-label="Open AI Assistant">
      <span id="gm-chat-badge">1</span>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#0B1F3A"/>
        <circle cx="8.5" cy="12" r="1.2" fill="#C9A84C"/>
        <circle cx="12" cy="12" r="1.2" fill="#C9A84C"/>
        <circle cx="15.5" cy="12" r="1.2" fill="#C9A84C"/>
      </svg>
    </button>

    <!-- Chat Window -->
    <div id="gm-chat-window" class="gm-hidden" role="dialog" aria-label="School AI Assistant">
      <div class="gm-chat-header">
        <div class="gm-header-avatar">G</div>
        <div class="gm-header-info">
          <div class="gm-header-name">Gadjah Mada Assistant</div>
          <div class="gm-header-status">Powered by AI · Always here to help</div>
        </div>
        <button class="gm-close-btn" id="gm-close-btn" aria-label="Close chat">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="gm-messages" id="gm-messages"></div>

      <div class="gm-suggestions" id="gm-suggestions">
        <button class="gm-chip">📋 Admissions info</button>
        <button class="gm-chip">🏆 Achievements</button>
        <button class="gm-chip">📚 Programs offered</button>
        <button class="gm-chip">📞 Contact & hours</button>
      </div>

      <div class="gm-input-row">
        <textarea class="gm-input" id="gm-input" placeholder="Ask anything about our school…" rows="1"></textarea>
        <button class="gm-send-btn" id="gm-send-btn" aria-label="Send message" disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#0B1F3A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  /* ---- State ---- */
  const state = {
    open: false,
    loading: false,
    history: [], // { role, content }
  };

  /* ---- Elements ---- */
  const fab       = document.getElementById('gm-chat-fab');
  const badge     = document.getElementById('gm-chat-badge');
  const win       = document.getElementById('gm-chat-window');
  const closeBtn  = document.getElementById('gm-close-btn');
  const messages  = document.getElementById('gm-messages');
  const input     = document.getElementById('gm-input');
  const sendBtn   = document.getElementById('gm-send-btn');
  const chips     = document.querySelectorAll('.gm-chip');

  /* ---- Toggle ---- */
  function toggleChat() {
    state.open = !state.open;
    win.classList.toggle('gm-hidden', !state.open);
    if (state.open) {
      badge.style.display = 'none';
      if (messages.children.length === 0) addWelcome();
      input.focus();
    }
  }
  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  /* ---- Welcome ---- */
  function addWelcome() {
    addMessage('bot',
      '👋 Hello! I\'m the official AI assistant for <strong>Gadjah Mada High School</strong>.\n\nI can help you with admissions, academic programs, activities, faculty, and any other questions about our school.\n\n<em>Feel free to ask me anything!</em>'
    );
  }

  /* ---- Add message to UI ---- */
  function addMessage(role, text) {
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = `gm-msg gm-${role}`;
    div.innerHTML = `
      <div class="gm-bubble">${text.replace(/\n/g, '<br>')}</div>
      <span class="gm-time">${now}</span>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  /* ---- Typing indicator ---- */
  function showTyping() {
    const div = document.createElement('div');
    div.className = 'gm-msg gm-bot gm-typing';
    div.id = 'gm-typing';
    div.innerHTML = `<div class="gm-bubble"><span class="gm-dot"></span><span class="gm-dot"></span><span class="gm-dot"></span></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('gm-typing');
    if (t) t.remove();
  }

  /* ---- Send message ---- */
  async function sendMessage(text) {
    text = text.trim();
    if (!text || state.loading) return;

    // Hide suggestion chips after first message
    document.getElementById('gm-suggestions').style.display = 'none';

    state.loading = true;
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';

    addMessage('user', escapeHtml(text));
    state.history.push({ role: 'user', content: text });

    showTyping();

    try {
      const GEMINI_API_KEY = 'AIzaSyDicrdbgAc01KZx-vKGx5Mcu4vmUYr8Eyw';
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      const contents = state.history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 1000 },
        }),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not answer that right now.';

      state.history.push({ role: 'assistant', content: reply });
      hideTyping();
      addMessage('bot', formatReply(reply));
    } catch (err) {
      console.error('Chatbot error:', err);
      hideTyping();
      addMessage('bot', '⚠️ Sorry, something went wrong. Please try again or contact us at <strong>(+62)812-3100-3000</strong>.');
    } finally {
      state.loading = false;
      sendBtn.disabled = !input.value.trim();
    }
  }

  /* ---- Format reply (basic markdown-ish) ---- */
  function formatReply(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ---- Input events ---- */
  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim() || state.loading;
    // Auto-grow textarea
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage(input.value);
    }
  });

  sendBtn.addEventListener('click', () => sendMessage(input.value));

  /* ---- Chips ---- */
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const map = {
        '📋 Admissions info': 'How do I apply to Gadjah Mada High School? What are the requirements?',
        '🏆 Achievements': 'What are the school\'s latest awards and achievements?',
        '📚 Programs offered': 'What academic programs are available at this school?',
        '📞 Contact & hours': 'What are the school\'s contact details and office hours?',
      };
      const q = map[chip.textContent.trim()] || chip.textContent;
      input.value = q;
      sendMessage(q);
    });
  });

})();
