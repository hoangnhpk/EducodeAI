namespace educodeai_server.Helpers
{
    public static class AiRequestQueueHelper
    {
        private static readonly SemaphoreSlim _queue = new SemaphoreSlim(3, 3);

        public static async Task<T> EnqueueAsync<T>(Func<Task<T>> apiCall)
        {
            // 1. Xin phép vào hàng đợi. Nếu đang có đủ 3 người xử lý, luồng này sẽ đứng chờ (chứ không bị lỗi).
            await _queue.WaitAsync();

            try
            {
                // 2. Tới lượt -> Thực thi hàm gọi AI
                return await apiCall();
            }
            finally
            {
                // 3. Xử lý xong -> Nhả vị trí ra để người tiếp theo trong hàng đợi được vào
                _queue.Release();
            }
        }
    }
}
