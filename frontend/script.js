console.log('script.js 已成功加载！');

// DOM元素
const addTaskForm = document.getElementById('addTaskForm');
const tasksList = document.getElementById('tasksList');
const currentDateElement = document.getElementById('currentDate');
const taskModal = document.getElementById('taskModal');
const modalTaskTitle = document.getElementById('modalTaskTitle');
const modalTaskDescription = document.getElementById('modalTaskDescription');
const modalTaskDueDate = document.getElementById('modalTaskDueDate');
const completeTaskBtn = document.getElementById('completeTaskBtn');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

// 用户信息和当前时间
const currentUser = 'luozijian1223';
const currentDateTime = new Date('2025-02-28 09:55:56');

// 存储待办事项
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentTaskId = null;

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 格式化时间
function formatTime(timeString) {
    return timeString;
}

// 显示当前日期
function showCurrentDate() {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    currentDateElement.textContent = currentDateTime.toLocaleDateString('zh-CN', options);
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 添加新任务
function addTask(title, description, dueDate, dueTime) {
    const id = generateId();
    const task = {
        id,
        title,
        description,
        dueDate: `${dueDate} ${dueTime}`,
        completed: false,
        createdAt: currentDateTime.toISOString()
    };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    return task;
}

// 完成任务
function completeTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
}

// 删除任务
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// 检查任务是否过期
function isTaskOverdue(dueDate) {
    const due = new Date(dueDate);
    return due < currentDateTime && due.toDateString() !== currentDateTime.toDateString();
}

// 渲染任务列表
function renderTasks() {
    tasksList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
        const noTasksMessage = document.createElement('p');
        noTasksMessage.textContent = '没有待办事项';
        noTasksMessage.style.textAlign = 'center';
        noTasksMessage.style.color = '#888';
        noTasksMessage.style.padding = '20px 0';
        tasksList.appendChild(noTasksMessage);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        if (isTaskOverdue(task.dueDate) && !task.completed) {
            taskItem.classList.add('task-overdue');
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            completeTask(task.id);
        });
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        const dueDate = new Date(task.dueDate);
        const formattedDueDate = `${dueDate.toLocaleDateString('zh-CN')} ${dueDate.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}`;
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        taskContent.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-due">截止时间: ${formattedDueDate}</div>
        `;
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskContent);
        
        taskItem.addEventListener('click', () => {
            showTaskDetails(task.id);
        });
        
        tasksList.appendChild(taskItem);
    });
}

// 显示任务详情
function showTaskDetails(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    currentTaskId = id;
    modalTaskTitle.textContent = task.title;
    modalTaskDescription.textContent = task.description || '没有描述';
    
    const dueDate = new Date(task.dueDate);
    modalTaskDueDate.textContent = `截止时间: ${dueDate.toLocaleDateString('zh-CN')} ${dueDate.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}`;
    
    completeTaskBtn.textContent = task.completed ? '标记为未完成' : '标记为完成';
    
    taskModal.style.display = 'block';
}

// 关闭模态框
function closeTaskModal() {
    taskModal.style.display = 'none';
    currentTaskId = null;
}

// 应用过滤器
function applyFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderTasks();
}

// 初始化
function init() {
    console.log('初始化应用...');
    showCurrentDate();
    renderTasks();
    
    // 添加任务表单提交事件
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('dueDate').value;
        const dueTime = document.getElementById('dueTime').value;
        
        addTask(title, description, dueDate, dueTime);
        addTaskForm.reset();
    });
    
    // 过滤按钮点击事件
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyFilter(btn.dataset.filter);
        });
    });
    
    // 模态框关闭按钮事件
    document.querySelector('.close-button').addEventListener('click', closeTaskModal);
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });
    
    // 完成任务按钮事件
    completeTaskBtn.addEventListener('click', () => {
        if (currentTaskId) {
            completeTask(currentTaskId);
            closeTaskModal();
        }
    });
    
    // 删除任务按钮事件
    deleteTaskBtn.addEventListener('click', () => {
        if (currentTaskId) {
            deleteTask(currentTaskId);
            closeTaskModal();
        }
    });
    
    // 显示用户名
    document.querySelector('.user-display').textContent = `你好，${currentUser}`;
    
    // 检查并提醒即将到期的任务
    checkDueTasks();
}

// 检查即将到期的任务
function checkDueTasks() {
    const activeTasks = tasks.filter(task => !task.completed);
    const comingDueTasks = activeTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate - currentDateTime;
        // 如果任务将在24小时内到期
        return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000;
    });
    
    if (comingDueTasks.length > 0) {
        alert(`你有 ${comingDueTasks.length} 个任务即将到期！`);
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);

// 在文件末尾添加以下代码确认文件加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 已完全加载，应用初始化中...');
    // 应用已经通过最后的 init() 函数启动
});