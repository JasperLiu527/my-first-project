'use strict';

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const STORAGE_KEY = 'workout-planner-v1';

// ---------- 模板 ----------

const ex = (name, sets, reps, weight = '') => ({ name, sets, reps, weight });

const TEMPLATES = {
  beginner: [
    { focus: '全身 A', exercises: [ex('深蹲', 3, '8-10'), ex('卧推', 3, '8-10'), ex('杠铃划船', 3, '8-10'), ex('平板支撑', 3, '30秒')] },
    { focus: '', exercises: [] },
    { focus: '全身 B', exercises: [ex('硬拉', 3, '5'), ex('站姿推举', 3, '8-10'), ex('引体向上', 3, '尽力'), ex('卷腹', 3, '15')] },
    { focus: '', exercises: [] },
    { focus: '全身 A', exercises: [ex('深蹲', 3, '8-10'), ex('卧推', 3, '8-10'), ex('杠铃划船', 3, '8-10'), ex('平板支撑', 3, '30秒')] },
    { focus: '', exercises: [] },
    { focus: '', exercises: [] },
  ],
  ppl: [
    { focus: '推（胸/肩/三头）', exercises: [ex('卧推', 4, '6-8'), ex('上斜哑铃卧推', 3, '8-12'), ex('站姿推举', 3, '8-10'), ex('侧平举', 3, '12-15'), ex('绳索下压', 3, '10-12')] },
    { focus: '拉（背/二头）', exercises: [ex('引体向上', 4, '6-10'), ex('杠铃划船', 3, '8-10'), ex('坐姿划船', 3, '10-12'), ex('面拉', 3, '15'), ex('哑铃弯举', 3, '10-12')] },
    { focus: '腿', exercises: [ex('深蹲', 4, '6-8'), ex('罗马尼亚硬拉', 3, '8-10'), ex('腿举', 3, '10-12'), ex('腿弯举', 3, '12'), ex('提踵', 4, '15')] },
    { focus: '推（胸/肩/三头）', exercises: [ex('站姿推举', 4, '6-8'), ex('哑铃卧推', 3, '8-12'), ex('双杠臂屈伸', 3, '尽力'), ex('侧平举', 3, '12-15')] },
    { focus: '拉（背/二头）', exercises: [ex('硬拉', 3, '5'), ex('高位下拉', 3, '10-12'), ex('单臂哑铃划船', 3, '10'), ex('锤式弯举', 3, '12')] },
    { focus: '腿', exercises: [ex('前蹲', 4, '8'), ex('保加利亚分腿蹲', 3, '10'), ex('腿屈伸', 3, '12-15'), ex('提踵', 4, '15')] },
    { focus: '', exercises: [] },
  ],
  upperlower: [
    { focus: '上肢（力量）', exercises: [ex('卧推', 4, '5'), ex('杠铃划船', 4, '5'), ex('站姿推举', 3, '6-8'), ex('引体向上', 3, '6-8')] },
    { focus: '下肢（力量）', exercises: [ex('深蹲', 4, '5'), ex('罗马尼亚硬拉', 3, '6-8'), ex('提踵', 3, '12')] },
    { focus: '', exercises: [] },
    { focus: '上肢（肌肥大）', exercises: [ex('上斜哑铃卧推', 3, '10-12'), ex('高位下拉', 3, '10-12'), ex('侧平举', 3, '15'), ex('哑铃弯举', 3, '12'), ex('绳索下压', 3, '12')] },
    { focus: '下肢（肌肥大）', exercises: [ex('腿举', 3, '12'), ex('保加利亚分腿蹲', 3, '10'), ex('腿弯举', 3, '12'), ex('卷腹', 3, '15')] },
    { focus: '', exercises: [] },
    { focus: '', exercises: [] },
  ],
  home: [
    { focus: '徒手全身', exercises: [ex('俯卧撑', 4, '尽力'), ex('徒手深蹲', 4, '20'), ex('弓步蹲', 3, '12/腿'), ex('平板支撑', 3, '45秒')] },
    { focus: '', exercises: [] },
    { focus: '有氧 + 核心', exercises: [ex('开合跳', 4, '40秒'), ex('登山跑', 4, '30秒'), ex('卷腹', 3, '20'), ex('俄罗斯转体', 3, '20')] },
    { focus: '', exercises: [] },
    { focus: '徒手全身', exercises: [ex('窄距俯卧撑', 4, '尽力'), ex('臀桥', 4, '15'), ex('靠墙静蹲', 3, '45秒'), ex('超人式', 3, '15')] },
    { focus: '', exercises: [] },
    { focus: '', exercises: [] },
  ],
};

// ---------- 状态与存储 ----------

const uid = () => Math.random().toString(36).slice(2, 10);

function emptyPlan() {
  return DAY_NAMES.map(() => ({ focus: '', exercises: [] }));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.plan) && saved.plan.length === 7) {
      return { plan: saved.plan, history: saved.history || [], session: saved.session || null };
    }
  } catch (e) { /* 存储不可用时使用默认值 */ }
  return { plan: applyTemplate('beginner'), history: [], session: null };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* 忽略 */ }
}

function applyTemplate(key) {
  return TEMPLATES[key].map(day => ({
    focus: day.focus,
    exercises: day.exercises.map(e => ({ ...e, id: uid() })),
  }));
}

const state = loadState();

// ---------- 工具函数 ----------

const $ = sel => document.querySelector(sel);

function todayIndex() {
  return (new Date().getDay() + 6) % 7; // 周一 = 0
}

function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekStart(d) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s.getTime();
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) node.append(c);
  return node;
}

// ---------- 标签切换 ----------

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${tab.dataset.view}`));
    render();
  });
});

// ---------- 今日训练 ----------

const daySelect = $('#today-day');
DAY_NAMES.forEach((name, i) => daySelect.append(el('option', { value: i, text: name })));

function currentSession() {
  const day = Number(daySelect.value);
  const s = state.session;
  if (!s || s.date !== dateKey() || s.day !== day) {
    state.session = { date: dateKey(), day, done: {} };
  }
  return state.session;
}

daySelect.addEventListener('change', () => {
  state.session = null;
  saveState();
  renderToday();
});

function renderToday() {
  const day = Number(daySelect.value);
  const plan = state.plan[day];
  const session = currentSession();
  const list = $('#today-list');
  list.innerHTML = '';

  $('#today-title').textContent = plan.focus || (plan.exercises.length ? '训练日' : '休息日');

  if (!plan.exercises.length) {
    list.append(el('div', { class: 'rest-day', text: '今天是休息日 🛌 好好恢复！可以在「每周计划」中添加动作。' }));
  }

  let total = 0;
  let done = 0;
  for (const e of plan.exercises) {
    const sets = Math.max(1, Number(e.sets) || 1);
    const marks = session.done[e.id] || [];
    const buttons = [];
    for (let i = 0; i < sets; i++) {
      total++;
      if (marks[i]) done++;
      buttons.push(el('button', {
        class: `set-btn${marks[i] ? ' done' : ''}`,
        text: marks[i] ? `✓ ${i + 1}` : `第${i + 1}组`,
        onclick: () => toggleSet(e.id, i),
      }));
    }
    const detail = [`${sets} 组 × ${e.reps || '—'}`, e.weight ? `${e.weight} kg` : ''].filter(Boolean).join(' · ');
    list.append(el('div', { class: 'exercise' }, [
      el('div', { class: 'exercise-head' }, [
        el('span', { class: 'exercise-name', text: e.name || '未命名动作' }),
        el('span', { class: 'muted', text: detail }),
      ]),
      el('div', { class: 'sets' }, buttons),
    ]));
  }

  const pct = total ? Math.round((done / total) * 100) : 0;
  $('#today-progress-bar').style.width = `${pct}%`;
  $('#today-progress-text').textContent = total ? `已完成 ${done}/${total} 组（${pct}%）` : '';
  $('#finish-workout').disabled = done === 0;
}

function toggleSet(exId, i) {
  const session = currentSession();
  const marks = session.done[exId] || (session.done[exId] = []);
  marks[i] = !marks[i];
  saveState();
  renderToday();
  if (marks[i]) startTimer(); // 完成一组后自动开始休息计时
}

$('#finish-workout').addEventListener('click', () => {
  const day = Number(daySelect.value);
  const plan = state.plan[day];
  const session = currentSession();
  const exercises = plan.exercises
    .map(e => ({
      name: e.name || '未命名动作',
      sets: Number(e.sets) || 1,
      setsDone: (session.done[e.id] || []).filter(Boolean).length,
      reps: e.reps,
      weight: e.weight,
    }))
    .filter(e => e.setsDone > 0);
  if (!exercises.length) return;

  state.history.unshift({ id: uid(), date: dateKey(), day, focus: plan.focus, exercises });
  state.session = { date: dateKey(), day, done: {} };
  saveState();
  renderToday();
  alert('训练已保存，干得漂亮！🎉');
});

// ---------- 休息计时器 ----------

let timerSeconds = 90;
let timerLeft = 90;
let timerHandle = null;

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function renderTimer() {
  const display = $('#timer-display');
  display.textContent = formatTime(timerLeft);
  display.classList.toggle('finished', timerLeft === 0);
  $('#timer-start').textContent = timerHandle ? '暂停' : '开始';
  document.querySelectorAll('.chip[data-seconds]').forEach(c =>
    c.classList.toggle('active', Number(c.dataset.seconds) === timerSeconds));
}

function startTimer() {
  stopTimer();
  if (timerLeft === 0) timerLeft = timerSeconds;
  const endAt = Date.now() + timerLeft * 1000;
  timerHandle = setInterval(() => {
    timerLeft = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    if (timerLeft === 0) {
      stopTimer();
      beep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    renderTimer();
  }, 250);
  renderTimer();
}

function stopTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
  renderTimer();
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = 880;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) { /* 不支持音频时静默 */ }
}

$('#timer-start').addEventListener('click', () => (timerHandle ? stopTimer() : startTimer()));
$('#timer-reset').addEventListener('click', () => {
  stopTimer();
  timerLeft = timerSeconds;
  renderTimer();
});
document.querySelectorAll('.chip[data-seconds]').forEach(chip => {
  chip.addEventListener('click', () => {
    stopTimer();
    timerSeconds = timerLeft = Number(chip.dataset.seconds);
    renderTimer();
  });
});

// ---------- 每周计划编辑 ----------

function renderPlan() {
  const container = $('#plan-days');
  container.innerHTML = '';
  state.plan.forEach((day, d) => {
    const exList = el('div');
    day.exercises.forEach((e, i) => exList.append(exerciseEditor(d, i)));

    container.append(el('div', { class: 'card day-card' }, [
      el('div', { class: 'day-head' }, [
        el('span', { class: 'day-label', text: DAY_NAMES[d] }),
        el('div', { class: 'day-focus' }, [
          el('input', {
            value: day.focus,
            placeholder: day.exercises.length ? '训练重点，如：胸 + 三头' : '休息日（可填写训练重点）',
            oninput: ev => { day.focus = ev.target.value; saveState(); },
          }),
        ]),
      ]),
      exList,
      el('button', {
        class: 'add-ex',
        text: '+ 添加动作',
        onclick: () => {
          day.exercises.push({ id: uid(), name: '', sets: 3, reps: '10', weight: '' });
          saveState();
          renderPlan();
          const inputs = container.querySelectorAll('.day-card')[d].querySelectorAll('.ex-name');
          inputs[inputs.length - 1].focus();
        },
      }),
    ]));
  });
}

function exerciseEditor(d, i) {
  const e = state.plan[d].exercises[i];
  const node = $('#exercise-row').content.firstElementChild.cloneNode(true);
  const bind = (sel, key) => {
    const input = node.querySelector(sel);
    input.value = e[key];
    input.addEventListener('input', () => { e[key] = input.value; saveState(); });
  };
  bind('.ex-name', 'name');
  bind('.ex-sets', 'sets');
  bind('.ex-reps', 'reps');
  bind('.ex-weight', 'weight');
  node.querySelector('.ex-remove').addEventListener('click', () => {
    state.plan[d].exercises.splice(i, 1);
    saveState();
    renderPlan();
  });
  return node;
}

$('#template-select').addEventListener('change', ev => {
  const key = ev.target.value;
  ev.target.value = '';
  if (!key || !confirm('套用模板会覆盖当前的每周计划，确定吗？')) return;
  state.plan = applyTemplate(key);
  state.session = null;
  saveState();
  renderPlan();
});

$('#clear-plan').addEventListener('click', () => {
  if (!confirm('确定清空整个每周计划吗？')) return;
  state.plan = emptyPlan();
  state.session = null;
  saveState();
  renderPlan();
});

// ---------- 训练记录 ----------

function renderHistory() {
  const now = new Date();
  const thisWeek = weekStart(now);
  const toDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const weeks = new Set(state.history.map(h => weekStart(toDate(h.date))));

  // 连续周数：从本周（若本周还没练则从上周）往前数
  const prevWeek = t => { const d = new Date(t); d.setDate(d.getDate() - 7); return d.getTime(); };
  let cursor = weeks.has(thisWeek) ? thisWeek : prevWeek(thisWeek);
  let streak = 0;
  while (weeks.has(cursor)) {
    streak++;
    cursor = prevWeek(cursor);
  }

  $('#stat-total').textContent = state.history.length;
  $('#stat-week').textContent = state.history.filter(h => weekStart(toDate(h.date)) === thisWeek).length;
  $('#stat-streak').textContent = streak;

  const list = $('#history-list');
  list.innerHTML = '';
  if (!state.history.length) {
    list.append(el('div', { class: 'card muted', text: '还没有训练记录。完成一次训练后点击「完成训练并保存」即可记录。' }));
    return;
  }
  for (const h of state.history) {
    list.append(el('div', { class: 'card history-item' }, [
      el('div', { class: 'row between' }, [
        el('strong', { text: `${h.date} ${DAY_NAMES[h.day]}${h.focus ? ' · ' + h.focus : ''}` }),
        el('button', {
          class: 'icon danger',
          title: '删除记录',
          text: '✕',
          onclick: () => {
            if (!confirm('删除这条训练记录？')) return;
            state.history = state.history.filter(x => x.id !== h.id);
            saveState();
            renderHistory();
          },
        }),
      ]),
      el('ul', {}, h.exercises.map(e => el('li', {
        text: `${e.name}：${e.setsDone}/${e.sets} 组 × ${e.reps || '—'}${e.weight ? ` @ ${e.weight} kg` : ''}`,
      }))),
    ]));
  }
}

// ---------- 初始化 ----------

function render() {
  const view = document.querySelector('.tab.active').dataset.view;
  if (view === 'today') renderToday();
  else if (view === 'plan') renderPlan();
  else renderHistory();
}

daySelect.value = state.session && state.session.date === dateKey() ? state.session.day : todayIndex();
renderTimer();
render();
