import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  
  // Giữ nguyên isAuthenticated để không hỏng code cũ của nhóm
  const isAuthenticated = computed(() => !!token.value)

  const login = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    // Kiểm tra xem dữ liệu có phải là rác ("undefined") không
    if (storedUser && storedToken && storedUser !== 'undefined') {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
      } catch (error) {
        console.error("Lỗi đọc dữ liệu User, tiến hành dọn dẹp:", error)
        logout() // Nếu lỗi thì tự động đăng xuất để xóa rác
      }
    } else {
      // Nếu là 'undefined' thì xóa sạch đi
      if (storedUser === 'undefined') logout()
    }
  }

  return {
    user,
    token,
    isAuthenticated, // Router sẽ dùng cái này
    login,
    logout,
    initAuth
  }
})