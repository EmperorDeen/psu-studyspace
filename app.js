/**
 * PSU Student Assignment & Timetable Tracker
 * Core Javascript Logic (Fixed Single Copy)
 */

// --- App State ---
let state = {
    tasks: [],
    classes: [],
    soundEnabled: true,
    activeTab: 'view-assignments',
    tempSubtasks: [], // Holds subtasks temporarily when writing a new task in form
    selectedMobileDay: 'Mon' // Pre-selected day for mobile timetable view
};

// --- Preloaded PSU Timetable Data (from user screenshot) ---
const DEFAULT_CLASSES = [
    // Mon
    { id: 'c1', code: '263-402 TECHNOLOGY PLANNING', room: '05102', day: 'Mon', start: '10:00', end: '12:00', color: 'color-red' },
    { id: 'c2', code: '263-403 LEARNING MANAGEMENT', room: '05101', day: 'Mon', start: '15:00', end: '17:00', color: 'color-grey' },
    // Tue
    { id: 'c3', code: '870-101 MEDIA LITERACY AND UTILIZATION', room: '38101', day: 'Tue', start: '15:00', end: '18:00', color: 'color-blue' },
    // Wed
    { id: 'c4', code: '263-401 PROJECT AND RESEARCH', room: '05101', day: 'Wed', start: '08:00', end: '10:00', color: 'color-red' },
    // Thu
    { id: 'c5', code: '263-403 LEARNING MANAGEMENT', room: '05101', day: 'Thu', start: '10:00', end: '12:00', color: 'color-grey' },
    // Fri
    { id: 'c6', code: '263-402 TECHNOLOGY PLANNING', room: '03102', day: 'Fri', start: '08:00', end: '10:00', color: 'color-red' },
    { id: 'c7', code: '263-401 PROJECT AND RESEARCH', room: '05101', day: 'Fri', start: '15:00', end: '17:00', color: 'color-red' }
];

// --- Web Audio API Chime Synthesizer ---
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!state.soundEnabled) return;
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        
        if (type === 'success') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.12, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.55);
            });
        } else if (type === 'warning') {
            const notes = [293.66, 349.23];
            notes.forEach((freq) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.4);
            });
        } else if (type === 'add') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } // FIXED SYNTAX ERROR: CHANGED }); TO }
    } catch (e) {
        console.error("Audio error:", e);
    }
}

// --- Canvas Confetti Celebration System ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];
let animationFrameId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 7 + 4;
        this.speedX = Math.random() * 8 - 4;
        this.speedY = Math.random() * -12 - 8;
        this.gravity = 0.4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 8 - 4;
        this.opacity = 1;
    }
    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) {
            this.opacity = 0;
        } else {
            this.opacity -= 0.006;
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function startConfetti() {
    confettiParticles = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < 60; i++) {
        confettiParticles.push(new ConfettiParticle(
            canvas.width * 0.1, 
            canvas.height, 
            colors[Math.floor(Math.random() * colors.length)]
        ));
        confettiParticles.push(new ConfettiParticle(
            canvas.width * 0.9, 
            canvas.height, 
            colors[Math.floor(Math.random() * colors.length)]
        ));
    }
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    confettiParticles.forEach((p) => {
        p.update();
        p.draw();
        if (p.opacity > 0) active = true;
    });
    if (active) {
        animationFrameId = requestAnimationFrame(animateConfetti);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// --- Data Management (LocalStorage) ---
function loadData() {
    const savedTasks = localStorage.getItem('psu_tasks');
    const savedClasses = localStorage.getItem('psu_classes');
    const savedSound = localStorage.getItem('psu_sound');

    state.tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    if (savedClasses) {
        state.classes = JSON.parse(savedClasses);
    } else {
        state.classes = [...DEFAULT_CLASSES];
        localStorage.setItem('psu_classes', JSON.stringify(state.classes));
    }

    state.soundEnabled = savedSound !== 'false';
    updateSoundUI();
}

function saveData() {
    localStorage.setItem('psu_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('psu_classes', JSON.stringify(state.classes));
    localStorage.setItem('psu_sound', state.soundEnabled.toString());
}

// --- Image Compression ---
function compressImage(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            const canvasEl = document.createElement('canvas');
            canvasEl.width = width;
            canvasEl.height = height;
            const ctxEl = canvasEl.getContext('2d');
            ctxEl.drawImage(img, 0, 0, width, height);
            const dataUrl = canvasEl.toDataURL('image/jpeg', quality);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- Dynamic Notification / Toast System ---
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    container.appendChild(toast);
    
    const timer = setTimeout(() => {
        toast.style.animation = 'slideIn var(--transition-normal) reverse forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 5000);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer);
        toast.remove();
    });
}

// --- Desktop Notification requests ---
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showToast('ไม่รองรับ', 'บราวเซอร์นี้ไม่รองรับการแจ้งเตือนสไตล์เดสก์ท็อป', 'warning');
        return;
    }
    Notification.requestPermission().then((permission) => {
        updateNotificationPermissionUI(permission);
        if (permission === 'granted') {
            showToast('สำเร็จ', 'เปิดใช้งานการแจ้งเตือนสไตล์เดสก์ท็อปเรียบร้อยแล้ว', 'success');
            playSound('add');
        } else {
            showToast('คำชี้แจง', 'การเข้าถึงการแจ้งเตือนถูกปฏิเสธ', 'warning');
        }
    });
}

function updateNotificationPermissionUI(permission) {
    const badge = document.getElementById('notify-status-badge');
    const btn = document.getElementById('btn-notify-req');
    if (!badge) return;
    
    if (permission === 'granted') {
        badge.className = 'badge badge-success';
        badge.textContent = 'อนุญาตแล้ว';
        if (btn) btn.style.display = 'none';
    } else if (permission === 'denied') {
        badge.className = 'badge badge-danger';
        badge.textContent = 'บล็อกสิทธิ์';
        if (btn) btn.style.display = 'inline-flex';
    } else {
        badge.className = 'badge badge-danger';
        badge.textContent = 'ไม่ได้อนุญาต';
        if (btn) btn.style.display = 'inline-flex';
    }
}

function checkDeadlinesForNotifications() {
    if (Notification.permission !== 'granted') return;
    
    const now = new Date();
    state.tasks.forEach((task) => {
        if (task.completed) return;
        const deadline = new Date(task.dateDeadline);
        deadline.setHours(0,0,0,0);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3 && diffDays >= 0 && !task.notified) {
            triggerNativeNotification(task, diffDays);
            task.notified = true;
        }
    });
    saveData();
}

// Custom push notification trigger
function triggerNativeNotification(task, daysLeft) {
    let title = `⚠️ ใกล้ส่งงาน! วิชา ${task.course || 'ทั่วไป'}`;
    let body = `งาน "${task.title}" ส่งวันที่ ${formatThaiDate(task.dateDeadline)} (${daysLeft === 0 ? 'ส่งวันนี้!' : 'อีก ' + daysLeft + ' วัน'})`;
    
    try {
        const notification = new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        });
        notification.onclick = () => {
            window.focus();
            switchTab('view-assignments');
        };
        playSound('warning');
        showToast(title, body, 'warning');
    } catch (e) {
        console.error(e);
    }
}

// --- Date Formatting Helpers ---
function formatThaiDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function getDaysRemaining(deadlineStr) {
    const deadline = new Date(deadlineStr);
    deadline.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getCountdownText(deadlineStr) {
    const deadline = new Date(deadlineStr + 'T23:59:59');
    const now = new Date();
    const diffTime = deadline - now;
    if (diffTime < 0) return 'เลยกำหนดส่ง 🚨';
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 3) {
        return `เหลือเวลา ${days} วัน`;
    } else if (days > 0) {
        return `ส่งใน ${days} วัน ${hours} ชม. ⚠️`;
    } else {
        return `ด่วน! ${hours} ชม. ${minutes} น. 🔥`;
    }
}

function updateSoundUI() {
    const onIcon = document.getElementById('sound-icon-on');
    const offIcon = document.getElementById('sound-icon-off');
    const toggleInput = document.getElementById('toggle-audio-effects');
    if (state.soundEnabled) {
        if (onIcon) onIcon.style.display = 'inline-block';
        if (offIcon) offIcon.style.display = 'none';
        if (toggleInput) toggleInput.checked = true;
    } else {
        if (onIcon) onIcon.style.display = 'none';
        if (offIcon) offIcon.style.display = 'inline-block';
        if (toggleInput) toggleInput.checked = false;
    }
}

// --- Switch Tabs ---
function switchTab(targetId) {
    state.activeTab = targetId;
    document.querySelectorAll('.nav-tabs .tab-btn').forEach((btn) => {
        if (btn.getAttribute('data-target') === targetId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    document.querySelectorAll('.view-section').forEach((section) => {
        if (section.id === targetId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    if (targetId === 'view-timetable') {
        renderTimetableGrid();
        renderMobileTimetable();
    }
}

// --- Update course selection dropdown ---
function updateCourseDropdown() {
    const select = document.getElementById('task-course');
    if (!select) return;
    select.innerHTML = '<option value="">-- เลือกวิชาเรียน --</option>';
    const uniqueCourses = [...new Set(state.classes.map(c => c.code))].sort();
    uniqueCourses.forEach((course) => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        select.appendChild(option);
    });
}

// --- Subtasks Temporary Form Handlers ---
function addTempSubtask() {
    const input = document.getElementById('new-subtask-input');
    const text = input.value.trim();
    if (!text) return;
    const subtask = {
        id: 'temp-' + Date.now() + Math.random().toString(36).substr(2, 5),
        title: text,
        completed: false
    };
    state.tempSubtasks.push(subtask);
    input.value = '';
    renderTempSubtasks();
}

function deleteTempSubtask(id) {
    state.tempSubtasks = state.tempSubtasks.filter(st => st.id !== id);
    renderTempSubtasks();
}

function renderTempSubtasks() {
    const container = document.getElementById('form-subtask-list');
    if (!container) return;
    container.innerHTML = '';
    state.tempSubtasks.forEach((st) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.background = 'var(--input-bg)';
        li.style.padding = '0.35rem 0.6rem';
        li.style.borderRadius = 'var(--radius-sm)';
        li.style.fontSize = '0.8rem';
        li.style.border = '1px solid var(--border-color)';
        li.innerHTML = `
            <span>${st.title}</span>
            <button type="button" class="action-btn delete" style="padding:0.2rem; min-height:24px; min-width:24px;" onclick="deleteTempSubtask('${st.id}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        container.appendChild(li);
    });
}

// --- CRUD Operations: Assignments ---
function handleAssignmentSubmit(e) {
    e.preventDefault();
    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('task-title').value.trim();
    const course = document.getElementById('task-course').value;
    const professor = document.getElementById('task-professor').value.trim();
    const score = parseInt(document.getElementById('task-score').value) || 0;
    const type = document.getElementById('task-type').value;
    const priority = document.getElementById('task-priority').value;
    const dateOrdered = document.getElementById('task-date-ordered').value;
    const dateDeadline = document.getElementById('task-date-deadline').value;
    const link = document.getElementById('task-link').value.trim();
    const notes = document.getElementById('task-notes').value.trim();
    
    if (taskId) {
        const idx = state.tasks.findIndex(t => t.id === taskId);
        if (idx > -1) {
            state.tasks[idx] = {
                ...state.tasks[idx],
                title, course, professor, score, type, priority, dateOrdered, dateDeadline, link, notes,
                subtasks: [...state.tempSubtasks]
            };
            showToast('อัปเดตงาน', `บันทึกการแก้ไขงาน "${title}" เรียบร้อย`, 'success');
        }
    } else {
        const newTask = {
            id: 'task-' + Date.now(),
            title, course, professor, score, type, priority, dateOrdered, dateDeadline, link, notes,
            completed: false, notified: false,
            subtasks: [...state.tempSubtasks]
        };
        state.tasks.push(newTask);
        showToast('เพิ่มงานสำเร็จ', `บันทึกรายวิชา "${title}" เรียบร้อยแล้ว`, 'success');
        playSound('add');
    }
    
    document.getElementById('assignment-form').reset();
    document.getElementById('edit-task-id').value = '';
    state.tempSubtasks = [];
    renderTempSubtasks();
    document.getElementById('btn-cancel-edit').style.display = 'none';
    document.getElementById('form-panel-title').innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        เพิ่มรายการงานใหม่
    `;
    saveData();
    renderTasks();
    updateDashboardStats();
}

function startEditTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-course').value = task.course || '';
    document.getElementById('task-professor').value = task.professor || '';
    document.getElementById('task-score').value = task.score || '';
    document.getElementById('task-type').value = task.type || 'เดี่ยว';
    document.getElementById('task-priority').value = task.priority || 'ปกติ';
    document.getElementById('task-date-ordered').value = task.dateOrdered;
    document.getElementById('task-date-deadline').value = task.dateDeadline;
    document.getElementById('task-link').value = task.link || '';
    document.getElementById('task-notes').value = task.notes || '';
    
    state.tempSubtasks = task.subtasks ? [...task.subtasks] : [];
    renderTempSubtasks();
    
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';
    document.getElementById('form-panel-title').innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        แก้ไขงาน: ${task.title}
    `;
    document.getElementById('form-panel-title').scrollIntoView({ behavior: 'smooth' });
}

function cancelEditTask() {
    document.getElementById('assignment-form').reset();
    document.getElementById('edit-task-id').value = '';
    state.tempSubtasks = [];
    renderTempSubtasks();
    document.getElementById('btn-cancel-edit').style.display = 'none';
    document.getElementById('form-panel-title').innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        เพิ่มรายการงานใหม่
    `;
}

function deleteTask(taskId) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการงานนี้?')) {
        const task = state.tasks.find(t => t.id === taskId);
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        showToast('ลบงานเรียบร้อย', `ลบงาน "${task.title}" แล้ว`, 'info');
        saveData();
        renderTasks();
        updateDashboardStats();
    }
}

// --- SUBMISSION PROOF HANDLING MODALS ---
const submissionModal = document.getElementById('submission-modal');
const lightboxModal = document.getElementById('lightbox-modal');

function toggleTaskComplete(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!task.completed) {
        document.getElementById('submission-task-id').value = task.id;
        document.getElementById('submission-proof-form').reset();
        document.getElementById('image-preview-container').style.display = 'none';
        document.getElementById('image-preview-container').innerHTML = '';
        submissionModal.classList.add('active');
    } else {
        task.completed = false;
        delete task.submissionProofImg;
        delete task.submissionNotes;
        if (task.subtasks) task.subtasks.forEach(st => st.completed = false);
        saveData();
        renderTasks();
        updateDashboardStats();
        showToast('กู้คืนงาน', `นำงาน "${task.title}" กลับมาดำเนินการต่อ`, 'info');
    }
}

function handleSubmissionForm(e) {
    e.preventDefault();
    const taskId = document.getElementById('submission-task-id').value;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const note = document.getElementById('submission-notes').value.trim();
    const fileInput = document.getElementById('submission-image');
    
    const finalizeCompletion = (imgData = null) => {
        task.completed = true;
        if (note) task.submissionNotes = note;
        if (imgData) task.submissionProofImg = imgData;
        if (task.subtasks) task.subtasks.forEach(st => st.completed = true);
        
        submissionModal.classList.remove('active');
        saveData();
        renderTasks();
        updateDashboardStats();
        playSound('success');
        startConfetti();
        showToast('สำเร็จ! 🎉', `ส่งงาน "${task.title}" เรียบร้อยแล้ว`, 'success');
    };
    
    if (fileInput.files.length > 0) {
        compressImage(fileInput.files[0], 600, 600, 0.65, (compressedBase64) => {
            finalizeCompletion(compressedBase64);
        });
    } else {
        finalizeCompletion(null);
    }
}

function handleSkipSubmissionProof() {
    const taskId = document.getElementById('submission-task-id').value;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = true;
    if (task.subtasks) task.subtasks.forEach(st => st.completed = true);
    
    submissionModal.classList.remove('active');
    saveData();
    renderTasks();
    updateDashboardStats();
    playSound('success');
    startConfetti();
    showToast('สำเร็จ! 🎉', `ทำรายการ "${task.title}" เสร็จสิ้นแล้ว`, 'success');
}

function openLightbox(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !task.submissionProofImg) return;
    
    document.getElementById('lightbox-image').src = task.submissionProofImg;
    document.getElementById('lightbox-title').textContent = `หลักฐานการส่ง: ${task.title}`;
    document.getElementById('lightbox-notes').textContent = task.submissionNotes ? `โน้ตบันทึก: ${task.submissionNotes}` : 'ไม่มีบันทึกช่วยจำเพิ่มเติม';
    lightboxModal.classList.add('active');
}

function closeLightbox() {
    lightboxModal.classList.remove('active');
}

function toggleSubtaskComplete(taskId, subtaskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;
    
    subtask.completed = !subtask.completed;
    const allDone = task.subtasks.every(st => st.completed);
    if (allDone && !task.completed) {
        toggleTaskComplete(taskId);
        return;
    }
    saveData();
    renderTasks();
}

// --- Google Calendar Link Generator ---
function getGoogleCalendarUrl(task) {
    const deadlineDate = new Date(task.dateDeadline);
    const yearStr = deadlineDate.getFullYear();
    const monthStr = String(deadlineDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(deadlineDate.getDate()).padStart(2, '0');
    const dateFormatted = `${yearStr}${monthStr}${dayStr}`;
    
    const title = encodeURIComponent(`[ส่งการบ้าน] ${task.title} - วิชา ${task.course || 'ทั่วไป'}`);
    const details = encodeURIComponent(
        `ชื่องาน: ${task.title}\n` +
        `วิชาเรียน: ${task.course || 'ทั่วไป'}\n` +
        `ผู้สอน: ${task.professor || '-'}\n` +
        `ระดับคะแนน: ${task.score || 0}%\n` +
        `ประเภทงาน: งาน${task.type}\n` +
        `ลิงก์ข้อมูล: ${task.link || '-'}\n\n` +
        `บันทึกเพิ่มเติม: ${task.notes || '-'}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${dateFormatted}&details=${details}&sf=true&output=xml`;
}

// --- Render Tasks Cards ---
let activeFilter = 'all';
let currentSort = 'deadline-asc';

function renderTasks() {
    const container = document.getElementById('tasks-list');
    if (!container) return;
    
    let filteredTasks = [...state.tasks];
    if (activeFilter === 'pending') {
        filteredTasks = filteredTasks.filter(t => !t.completed);
    } else if (activeFilter === 'urgent') {
        filteredTasks = filteredTasks.filter(t => !t.completed && getDaysRemaining(t.dateDeadline) <= 3 && getDaysRemaining(t.dateDeadline) >= 0);
    } else if (activeFilter === 'overdue') {
        filteredTasks = filteredTasks.filter(t => !t.completed && getDaysRemaining(t.dateDeadline) < 0);
    } else if (activeFilter === 'completed') {
        filteredTasks = filteredTasks.filter(t => t.completed);
    }
    
    filteredTasks.sort((a, b) => {
        if (currentSort === 'deadline-asc') {
            return new Date(a.dateDeadline) - new Date(b.dateDeadline);
        } else if (currentSort === 'deadline-desc') {
            return new Date(b.dateDeadline) - new Date(a.dateDeadline);
        } else if (currentSort === 'priority-desc') {
            const pVal = { 'ด่วนที่สุด': 3, 'สูง': 2, 'ปกติ': 1 };
            return (pVal[b.priority] || 1) - (pVal[a.priority] || 1);
        } else if (currentSort === 'score-desc') {
            return b.score - a.score;
        }
        return 0;
    });
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>ไม่พบรายการวิชา/การบ้าน</h3>
                <p>เลือกฟิลเตอร์อื่นหรือเริ่มเพิ่มคลาสเรียนจากแบบฟอร์มด้านซ้าย</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    filteredTasks.forEach((task) => {
        const daysLeft = getDaysRemaining(task.dateDeadline);
        let statusClass = 'status-safe';
        if (task.completed) {
            statusClass = 'status-completed';
        } else if (daysLeft < 0) {
            statusClass = 'status-danger';
        } else if (daysLeft <= 3) {
            statusClass = 'status-urgent';
        }
        
        const card = document.createElement('article');
        card.className = `task-card ${statusClass}`;
        card.id = `card-${task.id}`;
        
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        const totalSubtasks = hasSubtasks ? task.subtasks.length : 0;
        const doneSubtasks = hasSubtasks ? task.subtasks.filter(st => st.completed).length : 0;
        const progressPct = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;
        
        let priorityBadge = '';
        if (task.priority === 'ด่วนที่สุด') {
            priorityBadge = `<span style="background:var(--danger-glow); color:var(--danger); font-size:0.7rem; font-weight:700; padding:0.15rem 0.4rem; border-radius:var(--radius-sm); margin-left:0.4rem; border:1px solid var(--danger);">ด่วนที่สุด</span>`;
        } else if (task.priority === 'สูง') {
            priorityBadge = `<span style="background:var(--warning-glow); color:var(--warning); font-size:0.7rem; font-weight:700; padding:0.15rem 0.4rem; border-radius:var(--radius-sm); margin-left:0.4rem; border:1px solid var(--warning);">ความสำคัญสูง</span>`;
        }
        
        const countdownText = task.completed ? 'ส่งงานเสร็จสิ้นแล้ว ✅' : getCountdownText(task.dateDeadline);
        
        let subtasksHTML = '';
        if (hasSubtasks && !task.completed) {
            subtasksHTML = `
                <div class="subtasks-wrapper">
                    <div class="subtasks-header">
                        <span>รายการย่อย</span>
                        <span>${doneSubtasks}/${totalSubtasks} (${progressPct}%)</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
                    </div>
                    <div class="subtasks-list">
                        ${task.subtasks.map(st => `
                            <div class="subtask-item">
                                <input type="checkbox" id="st-${st.id}" class="subtask-checkbox" ${st.completed ? 'checked' : ''} onchange="toggleSubtaskComplete('${task.id}', '${st.id}')">
                                <label for="st-${st.id}" class="subtask-label">${st.title}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        let proofHTML = '';
        if (task.completed && (task.submissionProofImg || task.submissionNotes)) {
            proofHTML = `
                <div class="submission-proof-box">
                    ${task.submissionProofImg ? `
                        <img src="${task.submissionProofImg}" class="proof-thumbnail" alt="หลักฐาน" onclick="openLightbox('${task.id}')" title="กดเพื่อดูรูปภาพขนาดใหญ่">
                    ` : `
                        <div class="proof-thumbnail" style="display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:var(--text-muted);">📄</div>
                    `}
                    <div class="proof-details">
                        <span class="proof-title">ข้อมูลหลักฐานส่งงาน</span>
                        ${task.submissionNotes ? `<span class="proof-note">"${task.submissionNotes}"</span>` : `<span class="proof-note" style="color:var(--text-secondary);">ไม่มีข้อความโน้ต</span>`}
                        ${task.submissionProofImg ? `<button type="button" class="proof-view-btn" onclick="openLightbox('${task.id}')">คลิกดูรูปขยายใหญ่</button>` : ''}
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="task-card-header">
                <div class="task-card-left">
                    <div style="display:flex; align-items:center; flex-wrap:wrap; gap:0.25rem;">
                        ${task.course ? `<span class="task-subject">${task.course}</span>` : ''}
                        <span style="font-size:0.7rem; background:var(--input-bg); padding:0.15rem 0.4rem; border-radius:var(--radius-sm); border: 1px solid var(--border-color); color:var(--text-secondary);">${task.type === 'กลุ่ม' ? 'งานกลุ่ม 👥' : 'งานเดี่ยว 👤'}</span>
                        ${priorityBadge}
                    </div>
                    <h3 class="task-title">${task.title}</h3>
                </div>
                <div class="task-actions">
                    <button class="action-btn complete" title="${task.completed ? 'กู้คืนงานกลับมาทำใหม่' : 'ทำเสร็จ/แนบส่งรูปหลักฐาน'}" onclick="toggleTaskComplete('${task.id}')">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button class="action-btn" title="แก้ไขงาน" onclick="startEditTask('${task.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn delete" title="ลบงาน" onclick="deleteTask('${task.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
            
            ${task.notes ? `<p class="task-details">${task.notes.replace(/\n/g, '<br>')}</p>` : ''}
            
            ${task.link ? `
                <a href="${task.link}" target="_blank" class="task-link">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    ห้องเรียนวิชา / ลิงก์แนบงาน
                </a>
            ` : ''}

            ${subtasksHTML}
            ${proofHTML}
            
            <div class="task-meta-grid">
                <div class="meta-item">
                    <span class="meta-label">อาจารย์ผู้ตรวจ</span>
                    <span class="meta-val">${task.professor || 'ไม่ระบุ'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">คะแนนเก็บ</span>
                    <span class="meta-val">${task.score ? task.score + ' คะแนน' : 'ไม่มีคะแนน'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">วันสั่ง - กำหนดส่ง</span>
                    <span class="meta-val" style="font-size:0.7rem;">${formatThaiDate(task.dateOrdered)} - ${formatThaiDate(task.dateDeadline)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">การนับถอยหลัง</span>
                    <span class="meta-val countdown">${countdownText}</span>
                </div>
            </div>

            ${!task.completed ? `
                <a href="${getGoogleCalendarUrl(task)}" target="_blank" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem; margin-top:0.75rem; border-radius:var(--radius-sm); text-decoration:none; min-height:28px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    เพิ่มเข้า Google Calendar
                </a>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

function updateDashboardStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const urgent = state.tasks.filter(t => !t.completed && getDaysRemaining(t.dateDeadline) <= 3 && getDaysRemaining(t.dateDeadline) >= 0).length;
    const overdue = state.tasks.filter(t => !t.completed && getDaysRemaining(t.dateDeadline) < 0).length;
    const pendingScore = state.tasks.filter(t => !t.completed).reduce((sum, t) => sum + (t.score || 0), 0);
    
    document.getElementById('stat-total-tasks').textContent = total;
    document.getElementById('stat-urgent-tasks').textContent = urgent;
    document.getElementById('stat-overdue-tasks').textContent = overdue;
    document.getElementById('stat-completed-tasks').textContent = completed;
    document.getElementById('stat-pending-scores').textContent = pendingScore + '%';
}

// Countdown timer Ticks (every 30s)
setInterval(() => {
    if (state.activeTab === 'view-assignments') {
        state.tasks.forEach((task) => {
            const cardEl = document.getElementById(`card-${task.id}`);
            if (cardEl && !task.completed) {
                const countdownValEl = cardEl.querySelector('.meta-val.countdown');
                if (countdownValEl) {
                    countdownValEl.textContent = getCountdownText(task.dateDeadline);
                }
            }
        });
    }
}, 30000);

// --- CLASS TIMETABLE GRID RENDERING (Desktop) ---
function highlightCurrentClassAndDay() {
    document.querySelectorAll('.day-slot-header').forEach(el => el.classList.remove('current-day'));
    document.querySelectorAll('.timetable-card').forEach(el => el.classList.remove('active-class'));
    
    const now = new Date();
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = daysMap[now.getDay()];
    
    const currentDayHeader = document.querySelector(`.day-slot-header[data-day="${currentDayName}"]`);
    if (currentDayHeader) {
        currentDayHeader.classList.add('current-day');
    }
    
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    state.classes.forEach((c) => {
        if (c.day === currentDayName && currentTimeStr >= c.start && currentTimeStr < c.end) {
            const cardEl = document.querySelector(`.timetable-card[data-class-id="${c.id}"]`);
            if (cardEl) cardEl.classList.add('active-class');
            
            const mobCardEl = document.querySelector(`.mobile-class-card[data-class-id="${c.id}"]`);
            if (mobCardEl) mobCardEl.style.borderColor = 'var(--primary)';
        }
    });
}

function renderTimetableGrid() {
    const grid = document.getElementById('timetable-grid-content');
    if (!grid) return;
    
    const dynamicCards = grid.querySelectorAll('.timetable-card, .grid-cell');
    dynamicCards.forEach(c => c.remove());
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    days.forEach((day, dayIdx) => {
        const row = dayIdx + 2;
        for (let col = 2; col <= 11; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.gridRow = `${row} / ${row + 1}`;
            cell.style.gridColumn = col;
            grid.appendChild(cell);
        }
    });
    
    const dayRows = { 'Mon': 2, 'Tue': 3, 'Wed': 4, 'Thu': 5, 'Fri': 6 };
    const timeCols = {
        '08:00': 2, '09:00': 3, '10:00': 4, '11:00': 5, '12:00': 6,
        '13:00': 7, '14:00': 8, '15:00': 9, '16:00': 10, '17:00': 11, '18:00': 12
    };
    
    state.classes.forEach((c) => {
        const row = dayRows[c.day];
        const startCol = timeCols[c.start];
        const endCol = timeCols[c.end];
        
        if (!row || !startCol || !endCol) return;
        
        const card = document.createElement('div');
        card.className = `timetable-card ${c.color || 'color-grey'}`;
        card.setAttribute('data-class-id', c.id);
        card.style.gridRow = `${row} / ${row + 1}`;
        card.style.gridColumn = `${startCol} / ${endCol}`;
        
        card.innerHTML = `
            <div>
                <div class="class-title" title="${c.code}">${c.code}</div>
                <div class="class-room">ห้อง: ${c.room}</div>
            </div>
            <div class="class-time">${c.start} - ${c.end}</div>
        `;
        
        card.addEventListener('click', () => openTimetableModal(c.id));
        grid.appendChild(card);
    });
    
    highlightCurrentClassAndDay();
}

// --- PORTABLE TIMETABLE VIEW (iPhone / Mobile rendering) ---
function renderMobileTimetable() {
    const listContainer = document.getElementById('timetable-mobile-list');
    if (!listContainer) return;
    
    const dayClasses = state.classes.filter(c => c.day === state.selectedMobileDay);
    dayClasses.sort((a, b) => a.start.localeCompare(b.start));
    
    if (dayClasses.length === 0) {
        listContainer.innerHTML = `
            <div class="mobile-empty-state">
                <p>ไม่มีชั่วโมงเรียนในวันนี้ 🎉 พักผ่อนได้!</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = '';
    
    dayClasses.forEach((c) => {
        const card = document.createElement('div');
        card.className = `mobile-class-card ${c.color || 'color-grey'}`;
        card.setAttribute('data-class-id', c.id);
        
        card.innerHTML = `
            <div class="mobile-class-info">
                <div class="mobile-class-title">${c.code}</div>
                <div class="mobile-class-room">เลขห้องเรียน: ${c.room}</div>
            </div>
            <div class="mobile-class-time">${c.start} - ${c.end}</div>
        `;
        
        card.addEventListener('click', () => openTimetableModal(c.id));
        listContainer.appendChild(card);
    });
    
    highlightCurrentClassAndDay();
}

// Timetable Modals Operations
const modal = document.getElementById('timetable-modal');
const modalTitle = document.getElementById('timetable-modal-title');
const timetableForm = document.getElementById('timetable-class-form');
const btnDeleteClass = document.getElementById('btn-delete-class');

function openTimetableModal(classId = null) {
    timetableForm.reset();
    if (classId) {
        const cls = state.classes.find(c => c.id === classId);
        if (!cls) return;
        document.getElementById('edit-class-id').value = cls.id;
        document.getElementById('class-form-code').value = cls.code;
        document.getElementById('class-form-room').value = cls.room;
        document.getElementById('class-form-color').value = cls.color;
        document.getElementById('class-form-day').value = cls.day;
        document.getElementById('class-form-start').value = cls.start;
        document.getElementById('class-form-end').value = cls.end;
        modalTitle.textContent = 'แก้ไขวิชาเรียน';
        btnDeleteClass.style.display = 'block';
    } else {
        document.getElementById('edit-class-id').value = '';
        modalTitle.textContent = 'เพิ่มวิชาเรียนในตาราง';
        btnDeleteClass.style.display = 'none';
    }
    modal.classList.add('active');
}

function closeTimetableModal() {
    modal.classList.remove('active');
}

function handleTimetableSubmit(e) {
    e.preventDefault();
    const classId = document.getElementById('edit-class-id').value;
    const code = document.getElementById('class-form-code').value.trim();
    const room = document.getElementById('class-form-room').value.trim();
    const color = document.getElementById('class-form-color').value;
    const day = document.getElementById('class-form-day').value;
    const start = document.getElementById('class-form-start').value;
    const end = document.getElementById('class-form-end').value;
    
    if (start >= end) {
        alert('ผิดพลาด: เวลาเรียนไม่สอดคล้อง (เวลาเริ่มต้องก่อนเวลาเลิก)');
        return;
    }
    
    if (classId) {
        const idx = state.classes.findIndex(c => c.id === classId);
        if (idx > -1) {
            state.classes[idx] = { id: classId, code, room, color, day, start, end };
            showToast('อัปเดตวิชา', `แก้ไขข้อมูลวิชา "${code}" เรียบร้อย`, 'success');
        }
    } else {
        const newClass = { id: 'class-' + Date.now(), code, room, color, day, start, end };
        state.classes.push(newClass);
        showToast('เพิ่มวิชาเรียน', `เพิ่มวิชา "${code}" เข้าตารางแล้ว`, 'success');
        playSound('add');
    }
    saveData();
    closeTimetableModal();
    renderTimetableGrid();
    renderMobileTimetable();
    updateCourseDropdown();
}

function deleteClass() {
    const classId = document.getElementById('edit-class-id').value;
    if (!classId) return;
    const cls = state.classes.find(c => c.id === classId);
    if (confirm(`คุณต้องการลบรายวิชา "${cls.code}" ออกจากสารระบบใช่หรือไม่?`)) {
        state.classes = state.classes.filter(c => c.id !== classId);
        showToast('ลบวิชาเรียบร้อย', `ลบวิชา "${cls.code}" แล้ว`, 'info');
        saveData();
        closeTimetableModal();
        renderTimetableGrid();
        renderMobileTimetable();
        updateCourseDropdown();
    }
}

// --- Import/Export/Clean ---
function exportData() {
    const backup = { tasks: state.tasks, classes: state.classes };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `psu_space_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('สำรองข้อมูล', 'ส่งออกข้อมูลเก็บเป็นไฟล์สำรองสำเร็จ', 'success');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            if (Array.isArray(imported.tasks) && Array.isArray(imported.classes)) {
                state.tasks = imported.tasks;
                state.classes = imported.classes;
                saveData();
                renderTasks();
                renderTimetableGrid();
                renderMobileTimetable();
                updateCourseDropdown();
                updateDashboardStats();
                showToast('นำเข้าเรียบร้อย', 'ข้อมูลถูกอัปโหลดกู้คืนสำเร็จ', 'success');
                playSound('success');
                startConfetti();
            } else {
                throw new Error();
            }
        } catch (err) {
            showToast('นำเข้าผิดพลาด', 'ไฟล์ข้อมูลเสียหายหรือไม่สอดคล้อง', 'danger');
        }
    };
    reader.readAsText(file);
}

function resetAllData() {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลและล้างตารางเรียนทั้งหมดใช่หรือไม่?')) {
        localStorage.clear();
        state.tasks = [];
        state.classes = [...DEFAULT_CLASSES];
        saveData();
        renderTasks();
        renderTimetableGrid();
        renderMobileTimetable();
        updateCourseDropdown();
        updateDashboardStats();
        showToast('ล้างประวัติเสร็จสิ้น', 'ข้อมูลทั้งหมดถูกล้างแล้ว', 'info');
    }
}

// --- Initialization & UI Binding ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[now.getDay()];
    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(currentDay)) {
        state.selectedMobileDay = currentDay;
    } else {
        state.selectedMobileDay = 'Mon';
    }
    
    document.querySelectorAll('.mobile-day-btn').forEach((btn) => {
        if (btn.getAttribute('data-mobile-day') === state.selectedMobileDay) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTasks();
    renderTimetableGrid();
    renderMobileTimetable();
    updateCourseDropdown();
    updateDashboardStats();
    
    if ('Notification' in window) {
        updateNotificationPermissionUI(Notification.permission);
    }
    setTimeout(checkDeadlinesForNotifications, 1000);
    
    // Menu Switch tab actions
    document.querySelectorAll('.nav-tabs .tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-target'));
        });
    });
    
    // Sub-tasks forms bindings
    document.getElementById('btn-add-subtask').addEventListener('click', addTempSubtask);
    document.getElementById('new-subtask-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTempSubtask();
        }
    });
    
    // Image Preview logic during upload
    document.getElementById('submission-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const previewContainer = document.getElementById('image-preview-container');
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                previewContainer.innerHTML = `<img src="${evt.target.result}" alt="Preview">`;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
        }
    });
    
    // Form handlers
    document.getElementById('assignment-form').addEventListener('submit', handleAssignmentSubmit);
    document.getElementById('btn-cancel-edit').addEventListener('click', cancelEditTask);
    
    // Submission Modals Form Submission
    document.getElementById('submission-proof-form').addEventListener('submit', handleSubmissionForm);
    document.getElementById('btn-skip-submission-proof').addEventListener('click', handleSkipSubmissionProof);
    document.getElementById('submission-modal-close').addEventListener('click', () => {
        submissionModal.classList.remove('active');
    });
    
    // Lightbox modal close handlers
    document.getElementById('lightbox-modal-close').addEventListener('click', closeLightbox);
    
    // Set ordered date default to today
    document.getElementById('task-date-ordered').value = new Date().toISOString().slice(0, 10);
    
    // Sorting & Filters
    document.getElementById('task-filter-container').querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.getElementById('task-filter-container').querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter');
            renderTasks();
        });
    });
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });
    
    // Mobile Timetable Day Selector Tab bindings
    document.getElementById('timetable-mobile-tabs').querySelectorAll('.mobile-day-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.getElementById('timetable-mobile-tabs').querySelectorAll('.mobile-day-btn').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            state.selectedMobileDay = btn.getAttribute('data-mobile-day');
            renderMobileTimetable();
        });
    });

    // Sound toggle buttons
    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        updateSoundUI();
        saveData();
        if (state.soundEnabled) playSound('add');
    });
    const audioToggle = document.getElementById('toggle-audio-effects');
    if (audioToggle) {
        audioToggle.addEventListener('change', (e) => {
            state.soundEnabled = e.target.checked;
            updateSoundUI();
            saveData();
        });
    }
    
    // Class modals triggers
    document.getElementById('btn-add-class').addEventListener('click', () => openTimetableModal());
    document.getElementById('timetable-modal-close-x').addEventListener('click', closeTimetableModal);
    document.getElementById('btn-close-timetable-modal').addEventListener('click', closeTimetableModal);
    document.getElementById('btn-delete-class').addEventListener('click', deleteClass);
    document.getElementById('timetable-class-form').addEventListener('submit', handleTimetableSubmit);
    
    // Settings requests and testers
    document.getElementById('btn-notify-req').addEventListener('click', requestNotificationPermission);
    document.getElementById('btn-trigger-test-notify').addEventListener('click', () => {
        if (Notification.permission !== 'granted') {
            alert('กรุณากดเปิดใช้งานการแจ้งเตือนเดสก์ท็อป หรือกดยืนยันสิทธิ์จากแถบเปิดการใช้งานมุมขวาบนของเว็บก่อนครับ');
            requestNotificationPermission();
            return;
        }
        const mockTask = {
            id: 'mock',
            title: 'วิทยานิพนธ์หลักสูตรมหาวิทยาลัย (ตัวอย่างแจ้งเตือนส่งงาน)',
            course: '263-401 PROJECT AND RESEARCH',
            dateDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            notified: false
        };
        triggerNativeNotification(mockTask, 2);
    });
    
    document.getElementById('btn-export-data').addEventListener('click', exportData);
    document.getElementById('input-import-data').addEventListener('change', importData);
    document.getElementById('btn-reset-data').addEventListener('click', resetAllData);
});
