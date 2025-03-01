// 在登录页面添加一个调试按钮
function addDebugTools() {
    const container = document.querySelector('.auth-container');
    if (!container) return;
    
    const debugDiv = document.createElement('div');
    debugDiv.style.marginTop = '20px';
    debugDiv.style.padding = '10px';
    debugDiv.style.border = '1px solid #ddd';
    debugDiv.style.borderRadius = '4px';
    
    const debugButton = document.createElement('button');
    debugButton.textContent = '测试API连接';
    debugButton.style.padding = '5px 10px';
    debugButton.style.backgroundColor = '#4a90e2';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.style.cursor = 'pointer';
    
    debugButton.addEventListener('click', async () => {
        const resultDiv = document.createElement('div');
        resultDiv.style.marginTop = '10px';
        resultDiv.style.padding = '10px';
        resultDiv.style.backgroundColor = '#f5f5f5';
        resultDiv.style.borderRadius = '4px';
        resultDiv.textContent = '测试中...';
        
        debugDiv.appendChild(resultDiv);
        
        try {
            const response = await fetch(`${API_BASE_URL}/test`);
            const data = await response.json();
            resultDiv.textContent = `API测试结果: ${JSON.stringify(data)}`;
            resultDiv.style.color = 'green';
        } catch (error) {
            resultDiv.textContent = `API测试错误: ${error.message}`;
            resultDiv.style.color = 'red';
        }
    });
    
    debugDiv.appendChild(debugButton);
    container.appendChild(debugDiv);
}

// 页面加载时添加调试工具
document.addEventListener('DOMContentLoaded', addDebugTools);