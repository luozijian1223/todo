// API基地址
const API_BASE_URL = 'http://localhost:5000/api';

// 当前用户信息和时间
const currentUser = 'luozijian1223';
const currentDateTime = new Date('2025-02-28 13:29:33');

// 存储待办事项
let tasks = [];
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
    document.getElementById('currentDate').textContent = currentDateTime.toLocaleDateString('zh-CN', options);
}

// 获取认证头
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// 从API获取任务
async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // 认证失败，重定向到登录页面
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('获取任务失败');
        }
        
        const data = await response.json();
        tasks = data;
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        // 如果API请求失败，尝试从本地存储加载
        const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        if (localTasks.length > 0) {
            tasks = localTasks;
            renderTasks();
        }
    }
}

// 添加新任务
async function addTask(title, description, dueDate, dueTime) {
    try {
        const dueDateTimeStr = `${dueDate}T${dueTime}:00`;
        
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title,
                description,
                dueDate: dueDateTimeStr
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // 认证失败，重定向到登录页面
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return null;
            }
            throw new Error('添加任务失败');
        }
        
        const newTask = await response.json();
        tasks.unshift(newTask); // 添加到数组开头
        renderTasks();
        
        return newTask;
    } catch (error) {
        console.error('Error adding task:', error);
        // 后备方案：使用本地存储
        const id = generateId();
        const task = {
            id,
            title,
            description,
            dueDate: `${dueDate} ${dueTime}`,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        return task;
    }
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 完成任务
async function completeTask(id) {
    try {
        const task = tasks.find(t => t._id === id || t.id === id);
        if (!task) return;
        
        const updatedTask = { ...task, completed: !task.completed };
        
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ completed: updatedTask.completed }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // 认证失败，重定向到登录页面
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('更新任务失败');
        }
        
        // 更新本地任务列表
        const taskIndex = tasks.findIndex(t => t._id === id || t.id === id);
        tasks[taskIndex].completed = updatedTask.completed;
        renderTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        // 后备方案：使用本地存储
        const taskIndex = tasks.findIndex(task => task._id === id || task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    }
}

// 删除任务
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // 认证失败，重定向到登录页面
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('删除任务失败');
        }
        
        // 从本地任务列表移除
        tasks = tasks.filter(task => task._id !== id && task.id !== id);
        renderTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        // 后备方案：使用本地存储
        tasks = tasks.filter(task => task._id !== id && task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
}

// 检查任务是否过期
function isTaskOverdue(dueDate) {
    const due = new Date(dueDate);
    return due < currentDateTime && due.toDateString() !== currentDateTime.toDateString();
}

// 渲染任务列表
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return; // 如果不在任务页面，直接返回
    
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
            completeTask(task._id || task.id);
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
            showTaskDetails(task._id || task.id);
        });
        
        tasksList.appendChild(taskItem);
    });
}

// 显示任务详情
function showTaskDetails(id) {
    const task = tasks.find(task => task._id === id || task.id === id);
    if (!task) return;
    
    currentTaskId = id;
    
    document.getElementById('modalTaskTitle').textContent = task.title;
    document.getElementById('modalTaskDescription').textContent = task.description || '没有描述';
    
    const dueDate = new Date(task.dueDate);
    document.getElementById('modalTaskDueDate').textContent = `截止时间: ${dueDate.toLocaleDateString('zh-CN')} ${dueDate.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}`;
    
    document.getElementById('completeTaskBtn').textContent = task.completed ? '标记为未完成' : '标记为完成';
    
    document.getElementById('taskModal').style.display = 'block';
}

// 关闭模态框
function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    currentTaskId = null;
}

// 应用过滤器
function applyFilter(filter) {
    currentFilter = filter;
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderTasks();
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

// 初始化
function init() {
    showCurrentDate();
    
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // 获取任务列表
    fetchTasks();
    
    // 添加任务表单提交事件
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const dueDate = document.getElementById('dueDate').value;
            const dueTime = document.getElementById('dueTime').value;
            
            addTask(title, description, dueDate, dueTime);
            addTaskForm.reset();
        });
    }
    
    // 过滤按钮点击事件
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyFilter(btn.dataset.filter);
        });
    });
    
    // 模态框关闭按钮事件
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeTaskModal);
    }
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('taskModal');
        if (e.target === modal) {
            closeTaskModal();
        }
    });
    
    // 完成任务按钮事件
    const completeTaskBtn = document.getElementById('completeTaskBtn');
    if (completeTaskBtn) {
        completeTaskBtn.addEventListener('click', () => {
            if (currentTaskId) {
                completeTask(currentTaskId);
                closeTaskModal();
            }
        });
    }
    
    // 删除任务按钮事件
    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', () => {
            if (currentTaskId) {
                deleteTask(currentTaskId);
                closeTaskModal();
            }
        });
    }
    
    // 更新用户信息显示
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userDisplay = document.querySelector('.user-display');
    if (userDisplay) {
        userDisplay.textContent = `你好，${user.username || currentUser}`;
    }
    
    // 检查并提醒即将到期的任务
    checkDueTasks();
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);