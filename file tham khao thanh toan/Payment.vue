<template>
  <div class="payment min-h-screen bg-cream-50 py-12">
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-amber-900 mb-2">Xác nhận đặt món</h1>
        <p class="text-gray-600">Kiểm tra lại giỏ hàng và chọn phương thức thanh toán</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          
          <div class="bg-white rounded-xl shadow-md p-6 border border-amber-100">
            <h2 class="text-xl font-bold text-amber-800 border-b pb-4 mb-4">Danh sách món ăn</h2>
            
            <div v-if="cartStore.items.length === 0" class="text-center py-8">
              <div class="text-gray-500 italic mb-4">Giỏ hàng của bạn đang trống.</div>
              <button @click="router.push('/menu')" class="bg-amber-100 text-amber-800 font-semibold py-2 px-6 rounded-lg hover:bg-amber-200 transition-colors">
                Quay lại Menu để chọn món
              </button>
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="(item, index) in cartStore.items" 
                :key="index"
                class="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-gray-100 last:border-0 gap-4 group"
              >
                <div class="flex-1">
                  <span class="font-bold text-gray-800 text-lg">{{ item.name }}</span>
                  <div class="text-sm text-gray-500 mt-1">
                    Size: {{ item.size }} | Đường: {{ item.sugar }} | Đá: {{ item.ice }}
                  </div>
                  <div class="text-amber-600 font-semibold mt-1">
                    {{ formatPrice(item.price) }} / món
                  </div>
                </div>
                
                <div class="flex flex-col items-end gap-2">
                  <div class="font-bold text-amber-800 text-xl">
                    {{ formatPrice(item.price * item.quantity) }}
                  </div>
                  
                  <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button 
                      @click="decreaseQty(index)" 
                      class="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 hover:bg-amber-100 hover:text-amber-800 transition-colors border border-gray-200 shadow-sm"
                    >
                      <span class="font-bold text-lg leading-none">-</span>
                    </button>
                    
                    <span class="w-8 text-center font-bold text-gray-800">{{ item.quantity }}</span>
                    
                    <button 
                      @click="increaseQty(index)" 
                      class="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 hover:bg-amber-100 hover:text-amber-800 transition-colors border border-gray-200 shadow-sm"
                    >
                      <span class="font-bold text-lg leading-none">+</span>
                    </button>

                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    
                    <button 
                      @click="confirmRemoveItem(index)" 
                      class="w-8 h-8 flex items-center justify-center bg-white rounded-md text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors border border-gray-200 shadow-sm" 
                      title="Xóa món này"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border border-amber-100">
            <h2 class="text-xl font-bold text-amber-800 border-b pb-4 mb-4">Mức độ thanh toán trước</h2>
            <p class="text-sm text-gray-600 mb-4">Vui lòng chọn mức tiền bạn muốn thanh toán/đặt cọc trước khi đến quán:</p>
            
            <div class="space-y-3">
              <label 
                v-for="option in depositOptions" 
                :key="option.value"
                :class="[
                  'flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all',
                  selectedDeposit === option.value 
                    ? 'border-amber-600 bg-amber-50' 
                    : 'border-gray-200 hover:border-amber-300'
                ]"
              >
                <input 
                  type="radio" 
                  :value="option.value" 
                  v-model="selectedDeposit"
                  class="w-5 h-5 text-amber-600 focus:ring-amber-500"
                />
                <div class="ml-4 flex-1">
                  <span class="block font-bold text-gray-800">{{ option.title }}</span>
                  <span class="block text-sm text-gray-500">{{ option.description }}</span>
                </div>
                <div class="font-bold text-amber-700 text-lg">
                  {{ formatPrice(calculateDeposit(option.value)) }}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="space-y-6 sticky top-24">
            
            <div v-if="authStore.isAuthenticated" class="bg-white rounded-xl shadow-md p-6 border border-amber-100">
              <h3 class="text-xl font-bold text-amber-800 border-b pb-3 mb-3">Thẻ thành viên</h3>
              <p class="text-sm text-gray-600 mb-3">Điểm hiện có: <strong class="text-amber-600 text-lg">{{ userPoints }}</strong> đ</p>
              
              <div v-if="userPoints > 0" class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <input 
                    v-model.number="inputPoints" 
                    type="number" 
                    min="0"
                    :max="maxPointsCanUse"
                    class="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-right font-semibold"
                    placeholder="Số điểm..."
                  />
                  <button @click="applyPoints" class="bg-amber-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-900 whitespace-nowrap transition">
                    Đổi điểm
                  </button>
                </div>
                <button @click="inputPoints = maxPointsCanUse; applyPoints()" class="text-xs text-blue-600 hover:underline text-right">
                  Dùng tối đa ({{ maxPointsCanUse }} điểm)
                </button>

                <p v-if="pointsToUse > 0" class="text-green-600 text-sm mt-1 font-semibold flex items-center bg-green-50 p-2 rounded">
                  <i class="fas fa-check-circle mr-2"></i> Đã dùng {{ pointsToUse }} điểm (-{{ formatPrice(discountAmount) }})
                </p>
              </div>
              <div v-else class="text-sm text-gray-500 italic bg-gray-50 p-2 rounded">
                Bạn chưa có điểm tích lũy. Mua thêm để tích điểm nhé!
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-md p-6 border border-amber-100">
              <h3 class="text-xl font-bold text-amber-800 border-b pb-4 mb-4">Tóm tắt chi phí</h3>
              
              <div class="space-y-3 mb-6 text-gray-700">
                <div class="flex justify-between">
                  <span>Tạm tính ({{ cartStore.totalItems }} món):</span>
                  <span class="font-semibold">{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Thuế VAT (10%):</span>
                  <span class="font-semibold">{{ formatPrice(vat) }}</span>
                </div>
                
                <div v-if="pointsToUse > 0" class="flex justify-between text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                  <span>Giảm giá (Điểm):</span>
                  <span>- {{ formatPrice(discountAmount) }}</span>
                </div>

                <div class="border-t border-dashed border-gray-300 my-2 pt-2 flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span class="text-amber-700">{{ formatPrice(finalTotal) }}</span>
                </div>
              </div>

              <div class="bg-amber-100 p-4 rounded-lg mb-6 text-center">
                <span class="block text-sm text-amber-800 mb-1">Số tiền cần thanh toán ngay:</span>
                <span class="block text-3xl font-bold text-amber-900">
                  {{ formatPrice(calculateDeposit(selectedDeposit)) }}
                </span>
              </div>

              <button 
                @click="submitOrder" 
                :disabled="isProcessing || cartStore.items.length === 0"
                class="w-full bg-amber-800 text-white font-bold py-4 rounded-xl hover:bg-amber-900 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isProcessing ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT MÓN' }}
              </button>
            </div>
          </div>
        </div>

      </div>

      <div v-if="showQRModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative">
          <h2 class="text-2xl font-bold text-amber-900 mb-2">Thanh toán Quét Mã</h2>
          <p class="text-gray-600 mb-6">Mở App ngân hàng để quét mã QR bên dưới</p>
          
          <div class="bg-gray-100 p-4 rounded-xl inline-block mb-6 border-2 border-dashed border-amber-300">
            <img :src="qrData.url" alt="QR Code" class="w-64 h-64 object-contain mx-auto" />
          </div>

          <div class="text-left bg-amber-50 p-4 rounded-lg mb-6 border border-amber-100 text-sm">
            <div class="flex justify-between mb-2">
              <span class="text-gray-600">Số tiền:</span>
              <span class="font-bold text-amber-800 text-lg">{{ formatPrice(qrData.amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Nội dung CK:</span>
              <span class="font-mono font-bold text-blue-700 bg-white px-2 py-1 rounded border border-blue-200">
                {{ qrData.content }}
              </span>
            </div>
          </div>

          <p class="text-xs text-red-500 italic mb-6">
            *Hệ thống sẽ tự động cập nhật trạng thái sau khi nhận được tiền (3-5 giây).
          </p>

          <button @click="finishPayment" class="w-full bg-amber-800 text-white font-bold py-3 rounded-xl hover:bg-amber-900 transition-all">
            Tôi đã chuyển khoản xong
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const isProcessing = ref(false);
const showQRModal = ref(false);
const selectedDeposit = ref(30);

// =========================================================
// 💥 HÀM FORMAT TIỀN BỊ THIẾU ĐÃ ĐƯỢC THÊM VÀO ĐÂY
// =========================================================
const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
};

// =========================================================
// LOGIC TÍCH / ĐỔI ĐIỂM
// =========================================================
const userPoints = ref(0);
const inputPoints = ref(0);
const pointsToUse = ref(0);

// Lấy điểm của khách từ Backend
const fetchUserPoints = async () => {
  if (authStore.user?.soDienThoai) {
    try {
      const res = await axios.get(`https://localhost:7098/api/NguoiDung/TraCuu/${authStore.user.soDienThoai}`);
      userPoints.value = res.data.diemTichLuy || 0;
    } catch (error) {
      console.log("Không tìm thấy điểm tích lũy", error);
    }
  }
};
// =========================================================

// Dữ liệu tạo QR
const qrData = ref({
  amount: 0,
  content: '',
  url: ''
});

// Các tùy chọn cọc
const depositOptions = [
  { value: 0, title: 'Thanh toán sau (0%)', description: 'Đến quán trải nghiệm rồi thanh toán toàn bộ.' },
  { value: 30, title: 'Đặt cọc giữ món (30%)', description: 'Cọc một phần để quán chuẩn bị nguyên liệu trước.' },
  { value: 100, title: 'Thanh toán toàn bộ (100%)', description: 'Thanh toán đủ, đến quán chỉ việc thưởng thức.' }
];

// =========================================================
// TÍNH TOÁN TIỀN BẠC 
// =========================================================
const subtotal = computed(() => cartStore.totalPrice);
const vat = computed(() => Math.round(subtotal.value * 0.1));
const totalBill = computed(() => subtotal.value + vat.value);

// Tính số điểm tối đa được dùng
const maxPointsCanUse = computed(() => {
  return Math.min(userPoints.value, Math.floor(totalBill.value / 1000));
});

// Áp dụng điểm khi bấm nút
const applyPoints = () => {
  if (inputPoints.value < 0) inputPoints.value = 0;
  if (inputPoints.value > maxPointsCanUse.value) {
    inputPoints.value = maxPointsCanUse.value;
    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: `Chỉ được dùng tối đa ${maxPointsCanUse.value} điểm!`, showConfirmButton: false, timer: 3000 });
  }
  pointsToUse.value = inputPoints.value;
};

// Tính tổng tiền THỰC TẾ sau khi trừ điểm
const discountAmount = computed(() => pointsToUse.value * 1000);
const finalTotal = computed(() => Math.max(0, totalBill.value - discountAmount.value));

const calculateDeposit = (percent) => {
  return Math.round(finalTotal.value * percent / 100); 
};
// =========================================================

// ================= CÁC HÀM XỬ LÝ SỐ LƯỢNG MÓN =================
const confirmRemoveItem = (index) => {
  Swal.fire({
    title: 'Xóa món này?',
    text: "Bạn có muốn bỏ món này khỏi giỏ hàng không?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Giữ lại'
  }).then((result) => {
    if (result.isConfirmed) {
      cartStore.removeItem(index);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã xóa khỏi đơn',
        showConfirmButton: false,
        timer: 1500
      });
    }
  });
};

const increaseQty = (index) => {
  const currentQty = cartStore.items[index].quantity;
  cartStore.updateQuantity(index, currentQty + 1);
};

const decreaseQty = (index) => {
  const currentQty = cartStore.items[index].quantity;
  if (currentQty > 1) {
    cartStore.updateQuantity(index, currentQty - 1);
  } else {
    // Nếu ly nước đang là 1 mà khách bấm giảm (-), thì hỏi xóa món
    confirmRemoveItem(index);
  }
};
// ===============================================================

// Kiểm tra bảo mật khi vừa vào trang
onMounted(() => {
  if (!cartStore.maDonDat) {
    Swal.fire('Lỗi', 'Không tìm thấy thông tin đặt bàn. Vui lòng đặt bàn trước!', 'error').then(() => {
      router.push('/booking');
    });
  } else {
    fetchUserPoints(); // Gọi API lấy điểm khi vừa vào trang
  }
});

// Hàm Chốt đơn gửi xuống Backend
const submitOrder = async () => {
  isProcessing.value = true;
  Swal.fire({ title: 'Đang tạo đơn hàng...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

  try {
    const payload = {
      maDonDat: cartStore.maDonDat,
      maNguoiDung: authStore.user?.maNguoiDung || null,
      ghiChu: "Khách đặt món trước qua Web",
      phanTramCoc: selectedDeposit.value,
      soDiemMuonDung: pointsToUse.value, // GỬI ĐIỂM XUỐNG CHO BACKEND TRỪ
      items: cartStore.items.map(item => ({
        maMonAn: item.id,
        soLuong: item.quantity,
        size: item.size,
        mucDo: `Đường ${item.sugar}, Đá ${item.ice}`,
        giaTaiThoiDiem: item.price,
        ghiChu: item.notes || ''
      }))
    };

    const res = await axios.post('https://localhost:7098/api/DonHang/CreatePreOrder', payload);

    if (res.data.success) {
      Swal.close();
      const soTienCanCoc = res.data.soTienCanCoc;
      const maDonDat = res.data.maDonDat; 

      cartStore.items.splice(0, cartStore.items.length);

      if (soTienCanCoc === 0) {
        Swal.fire({
          icon: 'success',
          title: 'Ghi nhận thành công!',
          text: `Đã lưu danh sách món cho đơn ${maDonDat}. Hẹn gặp bạn tại quán nhé!`,
          confirmButtonColor: '#78350f',
          allowOutsideClick: false
        }).then(() => {
          router.push('/');
        });
      } else {
        const MY_BANK = "BIDV"; 
        const MY_ACCOUNT = "962470Y7UF"; 
        const ACCOUNT_NAME = "NGUYEN HUY HOANG";
        
        qrData.value = {
          amount: soTienCanCoc,
          content: `${maDonDat}`, 
          url: `https://img.vietqr.io/image/${MY_BANK}-${MY_ACCOUNT}-compact2.png?amount=${soTienCanCoc}&addInfo=${maDonDat}&accountName=${ACCOUNT_NAME}`
        };
        
        showQRModal.value = true;
      }
    }
  } catch (error) {
    Swal.fire('Lỗi', error.response?.data?.message || 'Không thể tạo đơn hàng.', 'error');
  } finally {
    isProcessing.value = false;
  }
};

// Hàm xử lý khi khách tắt Modal QR
const finishPayment = () => {
  showQRModal.value = false;
  Swal.fire({
    icon: 'success',
    title: 'Đang xử lý thanh toán',
    text: 'Hệ thống đang kiểm tra giao dịch của bạn. Vui lòng theo dõi trạng thái tại Lịch sử đơn hàng.',
    confirmButtonColor: '#78350f',
    allowOutsideClick: false
  }).then(() => {
    router.push('/'); 
  });
};
</script>