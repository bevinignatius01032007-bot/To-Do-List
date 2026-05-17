const STORAGE_KEYS = {
  USERS: 'users',
  LOGGED_IN_USER: 'loggedInUser',
  THEME: 'theme',
  ARCHIVE: 'archive',
};

const body = document.body;
const themeToggleButton = document.getElementById('theme-toggle');
const pageType = body.dataset.page || '';

// Replace these values with your EmailJS account details after setting up a Gmail service and template.
// Get them from https://www.emailjs.com after creating a service and template.
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

function initEmailJS() {
  const hasEmailJS = typeof window.emailjs !== 'undefined';
  const hasKeys = EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

  if (!hasEmailJS) {
    console.warn('EmailJS library is not loaded. Welcome email will not be sent.');
    return false;
  }

  if (!hasKeys) {
    console.warn('EmailJS keys are not configured in app.js. Welcome email will not be sent. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY.');
    return false;
  }

  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized successfully.');
  return true;
}

async function sendWelcomeEmail(name, email) {
  if (!window.emailjs || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS is not configured. Welcome email will not be sent.');
    return;
  }

  console.log('Attempting to send welcome email to', email);
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name: name,
      to_email: email,
    });
    console.log('Welcome email sent successfully to', email);
  } catch (error) {
    console.error('Welcome email failed to send:', error);
  }
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getLoggedInEmail() {
  return localStorage.getItem(STORAGE_KEYS.LOGGED_IN_USER);
}

function setLoggedInEmail(email) {
  localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, email);
}

function clearLoggedInUser() {
  localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_USER);
}

function findUser(email) {
  if (!email) return null;
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

function getCurrentUser() {
  const email = getLoggedInEmail();
  return email ? findUser(email) : null;
}

function getTaskKey(email) {
  return `tasks_${encodeURIComponent(email)}`;
}

function loadTasks(email) {
  try {
    return JSON.parse(localStorage.getItem(getTaskKey(email))) || [];
  } catch {
    return [];
  }
}

function saveTasks(email, tasks) {
  localStorage.setItem(getTaskKey(email), JSON.stringify(tasks));
}

function loadArchive(email) {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEYS.ARCHIVE}_${encodeURIComponent(email)}`)) || [];
  } catch {
    return [];
  }
}

function saveArchive(email, archive) {
  localStorage.setItem(`${STORAGE_KEYS.ARCHIVE}_${encodeURIComponent(email)}`, JSON.stringify(archive));
}

function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  body.classList.toggle('light', normalized === 'light');
  body.classList.toggle('dark', normalized === 'dark');
  localStorage.setItem(STORAGE_KEYS.THEME, normalized);
  if (themeToggleButton) {
    themeToggleButton.innerHTML = normalized === 'light' ? '<span class="material-symbols-outlined">light_mode</span>' : '<span class="material-symbols-outlined">dark_mode</span>';
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function toggleTheme() {
  const nextTheme = body.classList.contains('light') ? 'dark' : 'light';
  applyTheme(nextTheme);
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

function redirectToApp() {
  window.location.href = 'app.html';
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    redirectToLogin();
    return null;
  }
  return user;
}

function showError(message, elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function initSignupPage() {
  const signupForm = document.getElementById('signup-form');
  if (!signupForm) return;

  const googleSigninButton = document.getElementById('google-signin');
  if (googleSigninButton) {
    googleSigninButton.addEventListener('click', () => {
      alert('Google Sign-In is not fully implemented. Please use email/password signup.');
    });
  }

  signupForm.addEventListener('submit', event => {
    event.preventDefault();
    showError('', 'signup-error');

    const name = document.getElementById('full-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    if (!name || !email || !password || !confirmPassword) {
      showError('Please fill in every field.', 'signup-error');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.', 'signup-error');
      return;
    }

    if (findUser(email)) {
      showError('An account with this email already exists.', 'signup-error');
      return;
    }

    const users = getUsers();
    users.push({ name, email, password });
    saveUsers(users);
    setLoggedInEmail(email);
    if (initEmailJS()) {
      sendWelcomeEmail(name, email).finally(() => redirectToApp());
    } else {
      redirectToApp();
    }
  });
}

function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  if (getCurrentUser()) {
    redirectToApp();
    return;
  }

  const forgotPasswordLink = document.getElementById('forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', event => {
      event.preventDefault();
      alert('Password recovery is not implemented yet. Please contact support or reset manually.');
    });
  }

  const googleSigninButton = document.getElementById('google-signin');
  if (googleSigninButton) {
    googleSigninButton.addEventListener('click', () => {
      alert('Google Sign-In is not fully implemented. Please use email/password login.');
    });
  }

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    showError('', 'login-error');

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showError('Please enter your email and password.', 'login-error');
      return;
    }

    const user = findUser(email);
    if (!user || user.password !== password) {
      showError('Email or password is incorrect.', 'login-error');
      return;
    }

    setLoggedInEmail(user.email);
    redirectToApp();
  });
}

function initAppPage() {
  const user = requireAuth();
  if (!user) return;

  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearLoggedInUser();
      redirectToLogin();
    });
  }

  let tasks = loadTasks(user.email);
  let archive = loadArchive(user.email);
  let activeFilter = 'all';
  let activePriority = 'all';
  let activeCategory = 'all';

  const taskForm = document.getElementById('todo-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const remainingCount = document.getElementById('remaining-count');
  const progressBar = document.getElementById('progress-bar');
  const filterButtons = document.querySelectorAll('.filter-button');
  const priorityButtons = document.querySelectorAll('.priority-button');
  const categoryButtons = document.querySelectorAll('.category-button');
  const archiveButton = document.getElementById('archive-button');
  const archiveList = document.getElementById('archive-list');
  const newTaskBtn = document.getElementById('new-task-btn');

  function saveAndRender() {
    saveTasks(user.email, tasks);
    saveArchive(user.email, archive);
    renderTasks();
    updateProgress();
  }

  function getFilteredTasks() {
    let filtered = tasks;

    if (activeFilter === 'ongoing') {
      filtered = filtered.filter(task => !task.completed);
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }

    if (activePriority !== 'all') {
      filtered = filtered.filter(task => task.priority === activePriority);
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(task => task.category === activeCategory);
    }

    return filtered;
  }

  function updateCount() {
    const ongoing = tasks.filter(task => !task.completed).length;
    if (remainingCount) {
      remainingCount.textContent = `${ongoing} task${ongoing === 1 ? '' : 's'} remaining`;
    }
  }

  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    // Update momentum subtitle
    const momentumSubtitle = document.querySelector('#momentum-subtitle');
    if (momentumSubtitle) {
      momentumSubtitle.textContent = `${completed} of ${total} tasks completed`;
    }

    // Update task counters
    const tasksCompleted = document.getElementById('tasks-completed');
    const tasksTotal = document.getElementById('tasks-total');
    if (tasksCompleted) tasksCompleted.textContent = completed;
    if (tasksTotal) tasksTotal.textContent = total;

    // Update stats
    const statsTotal = document.getElementById('stats-total');
    const statsCompleted = document.getElementById('stats-completed');
    if (statsTotal) statsTotal.textContent = total;
    if (statsCompleted) statsCompleted.textContent = completed;

    showMomentumFeedback(percentage, total);
  }

  function showMomentumFeedback(percentage, total) {
    const feedbackElement = document.getElementById('momentum-feedback');
    if (!feedbackElement) return;

    let message = '';
    if (percentage === 100 && total > 0) {
      message = '🎉 Excellent! All tasks completed today. Take a moment to celebrate!';
    } else if (percentage >= 75) {
      message = '🚀 Great progress! You\'re almost there. Keep up the momentum!';
    } else if (percentage >= 50) {
      message = '💪 Good job! Halfway done. Consider a short break for deep work.';
    } else if (percentage >= 25) {
      message = '📈 Steady progress. Focus on high-priority tasks next.';
    } else if (total > 0) {
      message = '🌱 Getting started is the hardest part. Complete one task to build momentum!';
    } else {
      message = '✨ Ready to start your day? Add your first task above.';
    }

    feedbackElement.textContent = message;
  }

  function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = '';
    const items = getFilteredTasks();

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'bg-surface-container-lowest rounded-3xl p-8 text-center border border-outline-variant/30';
      empty.innerHTML = '<p class="font-body-lg text-xl text-on-surface-variant">No tasks match your filters. Add one above.</p>';
      taskList.appendChild(empty);
      updateCount();
      return;
    }

    items.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = `bg-surface-container-lowest p-8 rounded-3xl border transition-all cursor-pointer group ${task.completed ? 'border-outline-variant/20 opacity-70' : 'border-outline-variant/30 shadow-[0_20px_20px_rgba(15,23,42,0.04)] border-l-8 border-l-primary hover:border-primary/30'}`;
      
      let priorityColor = 'bg-secondary-container text-on-secondary-container';
      if (task.priority === 'High') {
        priorityColor = 'bg-error-container text-on-error-container';
      }

      taskDiv.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="w-6 h-6 rounded-full border-2 transition-colors ${task.completed ? 'bg-primary border-primary flex items-center justify-center' : 'border-outline-variant group-hover:border-primary'} flex-shrink-0 cursor-pointer task-checkbox-container" data-task-id="${task.id}">
            ${task.completed ? '<span class="material-symbols-outlined text-on-primary text-sm font-bold">check</span>' : '<div class="w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>'}
          </div>
          <div class="flex-grow">
            <h3 class="font-headline-md text-xl font-bold ${task.completed ? 'text-on-surface-variant line-through' : 'text-on-surface'}">${task.text}</h3>
            <div class="flex gap-3 mt-1 flex-wrap">
              <span class="${priorityColor} text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">${task.priority} Priority</span>
              <span class="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">${task.category === 'Work' ? 'work' : task.category === 'Team' ? 'group' : 'home'}</span> ${task.category}
              </span>
            </div>
          </div>
          <button class="opacity-0 group-hover:opacity-100 material-symbols-outlined text-outline-variant hover:text-error transition-all task-delete-btn" data-task-id="${task.id}">delete</button>
        </div>
      `;

      const checkboxContainer = taskDiv.querySelector('.task-checkbox-container');
      if (checkboxContainer) {
        checkboxContainer.addEventListener('click', () => toggleTaskCompletion(task.id));
      }

      const deleteBtn = taskDiv.querySelector('.task-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });
      }

      taskList.appendChild(taskDiv);
    });

    updateCount();
  }

  function renderArchive() {
    if (!archiveList) return;
    archiveList.innerHTML = '';

    const archiveCountElement = document.getElementById('archive-count');
    const archiveWeeklyElement = document.getElementById('archive-weekly-count');
    const archiveRestoreElement = document.getElementById('archive-restore-count');

    const weeklyArchiveCount = archive.filter(task => {
      const createdDate = new Date(task.created);
      const daysAgo = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).length;

    if (archiveCountElement) archiveCountElement.textContent = archive.length;
    if (archiveWeeklyElement) archiveWeeklyElement.textContent = weeklyArchiveCount;
    if (archiveRestoreElement) archiveRestoreElement.textContent = archive.length;

    if (archive.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'bg-surface-container-lowest rounded-3xl p-8 text-center border border-outline-variant/30';
      empty.innerHTML = '<p class="font-body-lg text-xl text-on-surface-variant">No archived tasks yet. Complete tasks to see them here.</p>';
      archiveList.appendChild(empty);
      return;
    }

    archive.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-[0_20px_20px_0_rgba(15,23,42,0.04)] flex items-center gap-4 transition-all hover:shadow-lg';
      
      let priorityColor = 'bg-secondary-container text-on-secondary-container';
      if (task.priority === 'High') {
        priorityColor = 'bg-error-container text-on-error-container';
      }

      taskDiv.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-on-primary text-sm font-bold">check</span>
        </div>
        <div class="flex-grow">
          <h3 class="font-headline-md text-xl font-bold text-on-surface-variant line-through">${task.text}</h3>
          <div class="flex gap-3 mt-2 flex-wrap">
            <span class="${priorityColor} text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">${task.priority}</span>
            <span class="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">${task.category === 'Work' ? 'work' : task.category === 'Team' ? 'group' : 'home'}</span> ${task.category}
            </span>
          </div>
        </div>
        <button class="opacity-0 group-hover:opacity-100 material-symbols-outlined text-outline-variant hover:text-primary transition-all task-restore-btn" data-task-id="${task.id}">restore</button>
      `;

      const restoreBtn = taskDiv.querySelector('.task-restore-btn');
      if (restoreBtn) {
        restoreBtn.addEventListener('click', () => restoreTask(task.id));
      }

      archiveList.appendChild(taskDiv);
    });
  }

  function addTask(event) {
    event.preventDefault();
    if (!taskInput) return;

    const text = taskInput.value.trim();
    if (!text) return;

    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;

    tasks.unshift({
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      category,
      created: new Date().toISOString()
    });
    taskInput.value = '';
    saveAndRender();
  }

  function toggleTaskCompletion(taskId) {
    tasks = tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task);
    saveAndRender();
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveAndRender();
  }

  function archiveTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      archive.push(task);
      tasks = tasks.filter(t => t.id !== taskId);
      saveAndRender();
      renderArchive();
    }
  }

  function restoreTask(taskId) {
    const task = archive.find(t => t.id === taskId);
    if (task) {
      tasks.push(task);
      archive = archive.filter(t => t.id !== taskId);
      saveAndRender();
      renderArchive();
    }
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.filter === filter);
    });
    renderTasks();
  }

  function setPriority(priority) {
    activePriority = priority;
    priorityButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.priority === priority);
    });
    renderTasks();
  }

  function setCategory(category) {
    activeCategory = category;
    categoryButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.category === category);
    });
    renderTasks();
  }

  if (taskForm) {
    taskForm.addEventListener('submit', addTask);
  }

  if (newTaskBtn) {
    newTaskBtn.addEventListener('click', () => {
      if (taskInput) {
        taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        taskInput.focus();
      }
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  priorityButtons.forEach(button => {
    button.addEventListener('click', () => setPriority(button.dataset.priority));
  });

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => setCategory(button.dataset.category));
  });

  if (archiveButton) {
    archiveButton.addEventListener('click', () => {
      const tasksView = document.getElementById('tasks-view');
      const archiveView = document.getElementById('archive-view');
      const navArchive = document.getElementById('nav-archive');
      const navTasks = document.getElementById('nav-tasks');
      
      if (tasksView && archiveView) {
        tasksView.classList.add('hidden');
        archiveView.classList.remove('hidden');
        if (navArchive) navArchive.classList.add('bg-secondary-container', 'text-on-secondary-container');
        if (navTasks) navTasks.classList.remove('bg-secondary-container', 'text-on-secondary-container');
        renderArchive();
      }
    });
  }

  // Navigation events
  const backToTasks = document.getElementById('back-to-tasks');
  if (backToTasks) {
    backToTasks.addEventListener('click', () => {
      const tasksView = document.getElementById('tasks-view');
      const archiveView = document.getElementById('archive-view');
      const navTasks = document.getElementById('nav-tasks');
      const navArchive = document.getElementById('nav-archive');
      
      if (tasksView && archiveView) {
        tasksView.classList.remove('hidden');
        archiveView.classList.add('hidden');
        if (navTasks) navTasks.classList.add('bg-secondary-container', 'text-on-secondary-container');
        if (navArchive) navArchive.classList.remove('bg-secondary-container', 'text-on-secondary-container');
      }
    });
  }

  const navArchiveLink = document.getElementById('nav-archive');
  if (navArchiveLink) {
    navArchiveLink.addEventListener('click', () => {
      const tasksView = document.getElementById('tasks-view');
      const archiveView = document.getElementById('archive-view');
      const navTasks = document.getElementById('nav-tasks');
      
      if (tasksView && archiveView) {
        tasksView.classList.add('hidden');
        archiveView.classList.remove('hidden');
        if (navArchiveLink) navArchiveLink.classList.add('bg-secondary-container', 'text-on-secondary-container');
        if (navTasks) navTasks.classList.remove('bg-secondary-container', 'text-on-secondary-container');
        renderArchive();
      }
    });
  }

  const navTasksLink = document.getElementById('nav-tasks');
  if (navTasksLink) {
    navTasksLink.addEventListener('click', () => {
      const tasksView = document.getElementById('tasks-view');
      const archiveView = document.getElementById('archive-view');
      const navArchive = document.getElementById('nav-archive');
      
      if (tasksView && archiveView) {
        tasksView.classList.remove('hidden');
        archiveView.classList.add('hidden');
        if (navTasksLink) navTasksLink.classList.add('bg-secondary-container', 'text-on-secondary-container');
        if (navArchive) navArchive.classList.remove('bg-secondary-container', 'text-on-secondary-container');
      }
    });
  }

  renderTasks();
  updateProgress();
}

loadTheme();
if (themeToggleButton) {
  themeToggleButton.addEventListener('click', toggleTheme);
}

if (pageType === 'signup') {
  initSignupPage();
} else if (pageType === 'login') {
  initLoginPage();
} else if (pageType === 'app') {
  initAppPage();
}
