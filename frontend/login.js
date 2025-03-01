// 处理登录表单提交
async function handleLogin(event) {
    event.preventDefault();
    
    const errorMessageElement = document.getElementById('errorMessage');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 显示加载状态
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = '登录中...';
    submitButton.disabled = true;
    
    // 使用连接管理器发送请求
    const result = await ConnectionManager.login(username, password);
    
    // 恢复按钮状态
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    
    if (result.success) {
        // 登录成功
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: result.data._id,
            username: result.data.username,
            email: result.data.email
        }));
        
        // 显示成功消息并跳转
        displaySuccess('登录成功，即将跳转...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        // 登录失败
        displayError(`登录失败: ${result.error}`);
    }
}

// 显示错误消息
function displayError(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    errorMessageElement.style.backgroundColor = '#ffecec';
    errorMessageElement.style.border = '1px solid #f5aca6';
}

// 显示成功消息
function displaySuccess(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    errorMessageElement.style.backgroundColor = '#e7f6e7';
    errorMessageElement.style.border = '1px solid #b6d7b6';
}

// 页面加载时添加事件监听
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 添加连接测试按钮
    const container = document.querySelector('.auth-container');
    if (container) {
        const testButton = document.createElement('button');
        testButton.textContent = '测试API连接';
        testButton.className = 'test-connection-btn';
        testButton.style.marginTop = '10px';
        testButton.style.width = '100%';
        testButton.style.padding = '8px';
        testButton.style.backgroundColor = '#4CAF50';
        testButton.style.color = 'white';
        testButton.style.border = 'none';
        testButton.style.borderRadius = '4px';
        testButton.style.cursor = 'pointer';
        
        testButton.addEventListener('click', async () => {
            testButton.textContent = '测试中...';
            const result = await ConnectionManager.testConnection();
            if (result.success) {
                displaySuccess(`API连接正常: ${JSON.stringify(result.data)}`);
            } else {
                displayError(`API连接失败: ${result.error}`);
            }
            testButton.textContent = '测试API连接';
        });
        
        container.appendChild(testButton);
    }
});