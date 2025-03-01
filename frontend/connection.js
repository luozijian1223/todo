// API连接管理工具
const ConnectionManager = {
    // API基地址
    baseURL: 'http://localhost:5000/api',
    
    // 测试连接
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/test`);
            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // 发送认证请求
    async sendAuthRequest(endpoint, data) {
        try {
            // 先测试连接
            const testResult = await this.testConnection();
            if (!testResult.success) {
                throw new Error(`无法连接到API服务器: ${testResult.error}`);
            }
            
            const response = await fetch(`${this.baseURL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || `请求失败，状态码: ${response.status}`);
            }
            
            return {
                success: true,
                data: responseData
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // 用户登录
    async login(username, password) {
        return this.sendAuthRequest('users/login', { username, password });
    },
    
    // 用户注册
    async register(username, email, password) {
        return this.sendAuthRequest('users/register', { username, email, password });
    }
};

// 导出连接管理器
window.ConnectionManager = ConnectionManager;