import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Customer routes
import CustomerLayout from '../layouts/CustomerLayout.vue'
import Home from '../views/customer/Home.vue'
import Booking from '../views/customer/Booking.vue'
import Menu from '../views/customer/Menu.vue'
import News from '../views/customer/News.vue'
import Service from '../views/customer/Service.vue'
import About from '../views/customer/About.vue'
import Contact from '../views/customer/Contact.vue'
import Feedback from '../views/customer/Feedback.vue'
import Login from '../views/customer/Login.vue'
import Register from '../views/customer/Register.vue'
import TableMenu from '../views/customer/TableMenu.vue'
import OrderStatus from '../views/customer/OrderStatus.vue'
import Payment from '../views/customer/Payment.vue'
import TraCuuDiem from '../views/customer/TraCuuDiem.vue'

// Đã gộp code của bạn (Profile) và code từ main (MyOrders, PhaCheBoard)
import Profile from '../views/customer/Profile.vue'
import MyOrders from '../views/customer/MyOrders.vue'
import PhaCheBoard from '../views/customer/PhaCheBoard.vue'

import ForgotPassword from '../views/customer/ForgotPassword.vue'
import ResetPassword from '../views/customer/ResetPassword.vue'

// Admin routes
import AdminLayout from '../layouts/AdminLayout.vue'
import AdminDashboard from '../views/customer/Dashboard.vue'
import AdminLogin from '../views/admin/Login.vue'
import EmployeeManagement from '../views/admin/EmployeeManagement.vue'
import CustomerManagement from '../views/admin/CustomerManagement.vue'
import MenuManagement from '../views/admin/MenuManagement.vue'
import OrderManagement from '../views/admin/OrderManagement.vue'
import FeedbackManagement from '../views/admin/FeedbackManagement.vue'
import ServiceManagement from '../views/admin/ServiceManagement.vue'
import FloorManagement from '../views/admin/FloorManagement.vue'

import PaymentManagement from '../views/admin/PaymentManagement.vue'

import MusicRequest from '../views/admin/MusicRequest.vue'
import DeviceRequest from '../views/admin/DeviceRequest.vue'


// IMPORT TỪ CÁC NHÁNH KHÁC NHAU
import PlaylistManagement from '../views/admin/PlaylistManagement.vue'
import QuanLyTichDiem from '../views/admin/QuanLyTichDiem.vue'
import AdminStatistics from '../views/admin/Statistics.vue'
// import HoaDon from "@/views/customer/HoaDon.vue";

const routes = [
  {
    path: '/',
    component: CustomerLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'booking', name: 'Booking', component: Booking, meta: { requiresAuth: true } },
      { path: 'service', name: 'Service', component: Service },
      { path: 'menu', name: 'Menu', component: Menu },
      { path: 'news', name: 'News', component: News },

      { path: 'about', name: 'About', component: About },
      { path: 'contact', name: 'Contact', component: Contact },
      { path: 'feedback', name: 'Feedback', component: Feedback },
      { path: 'table/:tableId', name: 'TableMenu', component: TableMenu },
      { path: 'order-status', name: 'OrderStatus', component: OrderStatus },
      { path: 'payment', name: 'Payment', component: Payment },
      { path: '/my-orders', name: 'MyOrders', component: MyOrders },
      { path: '/pha-che', name: 'PhaCheBoard', component: PhaCheBoard, meta: { title: 'Màn hình Pha Chế' } },
      { path: 'TraCuuDiem', name: 'TraCuuDiem', component: TraCuuDiem },
      { path: 'profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },

//       {
//   path: 'hoa-don',
//   name: 'HoaDon',
//   component: () => import("@/views/customer/HoaDon.vue"),
//   meta: { requiresAuth: true }
// }
      
    ]
  },


    
  // Thêm vào trong mảng routes
  {
    path: '/nhan-vien',
    component: () => import('../views/staff/StaffLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'StaffTableMap',
        component: () => import('../views/staff/StaffTableMap.vue')
      }
    ]
  },

  // --- AUTH ROUTES ---
  {
    path: '/auth',
    children: [
      { path: 'login', name: 'Login', component: Login },
      { path: 'register', name: 'Register', component: Register },
      { path: 'forgot-password', name: 'ForgotPassword', component: ForgotPassword },
      { path: 'reset-password', name: 'ResetPassword', component: ResetPassword }
    ]
  },
  // --- ADMIN ROUTES ---
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'employees', name: 'EmployeeManagement', component: EmployeeManagement },
      { path: 'customers', name: 'CustomerManagement', component: CustomerManagement },
      { path: 'menu', name: 'MenuManagement', component: MenuManagement },
      { path: 'orders', name: 'OrderManagement', component: OrderManagement },
      { path: 'feedback', name: 'FeedbackManagement', component: FeedbackManagement },
      {
        path: 'services',
        component: ServiceManagement,
        children: [
          {
            path: 'device-requests',
            name: 'DeviceRequest',
            component: DeviceRequest
          },
          {
            path: 'music-requests',
            name: 'MusicRequest',
            component: MusicRequest
          }
        ]
      },
      { path: 'floors', name: 'FloorManagement', component: FloorManagement },
      { path: 'statistics', name: 'AdminStatistics', component: AdminStatistics },
      { path: 'playlist', name: 'PlaylistManagement', component: PlaylistManagement },
      { path: 'TichDiem', name: 'AdminTichDiem', component: QuanLyTichDiem },

      { path: 'paymentManagement', name: 'PaymentManagement', component: PaymentManagement },



    ]
  },
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },
  { path: '/admin/forgot-password', name: 'AdminForgotPassword', component: ForgotPassword },
  { path: '/admin/reset-password', name: 'AdminResetPassword', component: ResetPassword }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  // Nạp lại dữ liệu đăng nhập từ localStorage trước khi kiểm tra
  authStore.initAuth()

  const staffToken = sessionStorage.getItem('staff_token')
  const staffInfo = JSON.parse(sessionStorage.getItem('staff_info') || '{}')

  // 1. Danh sách các trang KHÔNG cần kiểm tra quyền (Public Pages)
  const publicPages = [
    'Login', 'Register', 'ForgotPassword', 'ResetPassword',
    'AdminLogin', 'AdminForgotPassword', 'AdminResetPassword',
    'Home', 'Menu', 'News', 'About', 'Contact',
    'Feedback', 'TableMenu', 'TraCuuDiem'
  ]

  // 2. Nếu trang nằm trong danh sách Public HOẶC không yêu cầu Auth -> Cho qua luôn
  if (publicPages.includes(to.name) || !to.meta.requiresAuth) {
    next()
    return
  }

  // 3. CHẶN TRUY CẬP TRANG NHÂN VIÊN
  if (to.path.startsWith('/nhan-vien')) {
    if (!staffToken) {
      next('/admin/login')
      return
    }

    const isStaff = staffInfo.maNhanVien?.startsWith('NV') || ['Admin', 'Quản lý', 'Nhân viên'].includes(staffInfo.chucVu)
    if (isStaff) {
      next()
    } else {
      alert('Bạn không có quyền truy cập khu vực nhân viên!')
      next('/')
    }
    return
  }

  // 4. XỬ LÝ CHO KHU VỰC ADMIN
  if (to.path.startsWith('/admin')) {
    if (!staffToken) {
      next({ name: 'AdminLogin' })
      return
    }

    if (to.meta.requiresAdmin) {
      const allowedRoles = ['Admin', 'Quản lý']
      if (!allowedRoles.includes(staffInfo.chucVu)) {
        alert('Tài khoản của bạn không có quyền truy cập khu vực quản trị!')
        next({ name: 'AdminLogin' })
        return
      }
    }
    next()
    return
  }

  // 5. XỬ LÝ CHO KHU VỰC KHÁCH HÀNG CẦN AUTH (Booking, Profile...)
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      alert('Vui lòng đăng nhập để thực hiện chức năng này!')
      next({ name: 'Login' })
    } else {
      next()
    }
    return
  }

  // Fallback an toàn (Trường hợp lọt lưới)
  next()
})

export default router