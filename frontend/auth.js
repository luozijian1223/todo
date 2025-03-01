// API基地址
const API_BASE_URL = 'http://localhost:5000/api';

// 当前用户信息
const currentUser = 'luozijian1223';
const currentDateTime = new Date('2025-02-28 12:56:30');

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    checkAuth();
    
    // 注册表单处理
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 登录表单处理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 登出按钮处理
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// 检查认证状态
async function checkAuth() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            // 如果当前页面不是登录或注册页面，则重定向到登录页面
            const currentPage = window.location.pathname;
            if (!currentPage.includes('login.html') && !currentPage.includes('register.html')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        // 尝试获取用户信息来验证token
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('认证失败');
        }
        
        const userData = await response.json();
        
        // 将用户信息存储在本地存储中
        localStorage.setItem('user', JSON.stringify(userData));
        
        // 如果当前在登录或注册页面，重定向到主页
        const currentPage = window.location.pathname;
        if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
            window.location.href = 'index.html';
        } else {
            // 更新页面上的用户信息
            updateUserInfo(userData);
        }
    } catch (error) {
        console.error('认证检查失败:', error);
        // 清除无效的token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 如果当前页面不是登录或注册页面，则重定向到登录页面
        const currentPage = window.location.pathname;
        if (!currentPage.includes('login.html') && !currentPage.includes('register.html')) {
            window.location.href = 'login.html';
        }
    }
}

// 更新页面上的用户信息
function updateUserInfo(user) {
    const userDisplayElement = document.querySelector('.user-display');
    if (userDisplayElement) {
        userDisplayElement.textContent = `你好，${user.username || currentUser}`;
    }
}

// 处理注册表单提交
async function handleRegister(event) {
    event.preventDefault();
    
    const errorMessageElement = document.getElementById('errorMessage');
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 简单的表单验证
    if (password !== confirmPassword) {
        displayError('两次输入的密码不一致');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '注册失败');
        }
        
        // 保存token和用户信息
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            username: data.username,
            email: data.email
        }));
        
        // 注册成功后重定向到主页
        window.location.href = 'index.html';
    } catch (error) {
        displayError(error.message);
    }
}

// 修改登录处理函数以显示详细错误
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        console.log('开始登录请求到:', `${API_BASE_URL}/users/login`);
        
        // 使用fetch的更详细格式
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            }),
            credentials: 'include',
            // 超时设置
            signal: AbortSignal.timeout(10000)
        });
        
        console.log('收到响应:', response);
        
        const data = await response.json();
        console.log('响应数据:', data);
        
        if (!response.ok) {
            throw new Error(data.message || '登录失败');
        }
        
        // 保存token和用户信息
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            username: data.username,
            email: data.email
        }));
        
        // 登录成功后重定向到主页
        window.location.href = 'index.html';
    } catch (error) {
        console.error('登录错误详情:', error);
        displayError(`登录失败: ${error.message}`);
    }
}

// 处理登出
async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        // 无论服务器响应如何，都清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 重定向到登录页面
        window.location.href = 'login.html';
    } catch (error) {
        console.error('登出失败:', error);
        // 即使请求失败，也强制登出
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// 显示错误消息
function displayError(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        
        // 5秒后自动隐藏错误消息
        setTimeout(() => {
            errorMessageElement.style.display = 'none';
        }, 5000);
    }
}