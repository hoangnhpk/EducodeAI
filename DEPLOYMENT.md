# Triển khai EduCodeAI (Dự án 2) cùng Caddy của CuocThiAI

EduCodeAI chạy trên cùng VPS Ubuntu với **Dự án 1 – CuocThiAI**. Caddy tổng của CuocThiAI tiếp tục là service duy nhất sử dụng cổng `80/443` và cấp HTTPS. Stack EduCodeAI chỉ xuất gateway nội bộ:

```text
Internet → Caddy Dự án 1 :80/:443
         → host.docker.internal:8082
         → 127.0.0.1:8082 trên VPS
         → frontend Nginx của EduCodeAI
         → backend:8080 / static SPA
```

Không mở backend, Supabase PostgreSQL hoặc Redis ra Internet.

## 1. Điều kiện cần

- Docker Engine và Docker Compose plugin đã hoạt động trên VPS.
- DNS `A` của `educodeai.top` trỏ tới IPv4 VPS.
- Repository được clone tại `/home/deploy/duan2`.
- Cổng loopback `8082` chưa được ứng dụng khác sử dụng:

```bash
sudo ss -lntp | grep ':8082' || true
```

Nếu 8082 đã dùng, chọn cổng khác trong `.env.production` và dùng cùng cổng trong Caddyfile Dự án 1.

## 2. Chuẩn bị Dự án 2 trên VPS

```bash
sudo install -d -m 755 -o deploy -g deploy /home/deploy/duan2
sudo -u deploy git clone <URL_REPOSITORY_EDUCODEAI> /home/deploy/duan2
cd /home/deploy/duan2
git checkout main
cp .env.production.example .env.production
mkdir -p secrets
chmod 700 secrets
chmod 600 .env.production
```

Sửa `.env.production` và thay mọi giá trị `CHANGE_ME`:

```bash
nano .env.production
```

Các giá trị bắt buộc cho domain/cổng:

```dotenv
APP_PORT=8082
DOMAIN=educodeai.top
CORS_ALLOWED_ORIGIN=https://educodeai.top
VITE_API_URL=https://educodeai.top
```

Tạo secret ngẫu nhiên:

```bash
openssl rand -base64 48
openssl rand -hex 32
```

Lưu Google Cloud service account ngoài Git:

```bash
nano secrets/gcp-service-account.json
chmod 600 secrets/gcp-service-account.json
```

Giữ cấu hình:

```dotenv
GCP_SERVICE_ACCOUNT_HOST_PATH=./secrets/gcp-service-account.json
```

> Biến `VITE_*` và `HASHIDS_SALT` được nhúng vào JavaScript phía trình duyệt, không được coi là bí mật. Tuyệt đối không đặt private key hoặc server secret trong biến Vite.

Đăng ký `https://educodeai.top` tại Google OAuth, Facebook, Firebase và reCAPTCHA nếu các dịch vụ đó được sử dụng.

## 3. Khởi động Dự án 2

```bash
cd /home/deploy/duan2
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --remove-orphans
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Kiểm tra gateway và backend qua loopback:

```bash
curl -fsS http://127.0.0.1:8082/gateway-health
curl -fsS http://127.0.0.1:8082/health
```

Kiểm tra chỉ loopback được publish:

```bash
sudo ss -lntp | grep ':8082'
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Kết quả phải là `127.0.0.1:8082->8080`; không có mapping `0.0.0.0`, `80`, `443`, `5432`, `6379` hoặc backend `8080`.

## 4. Khai báo domain trong Caddy tổng của Dự án 1

Trên VPS, mở file `deploy/caddy/Caddyfile` thuộc repository **CuocThiAI**. Ví dụ:

```bash
cd /home/deploy/cuoc-thi-ai
nano deploy/caddy/Caddyfile
```

Thêm block:

```caddyfile
educodeai.top {
    reverse_proxy host.docker.internal:8082
}
```

Nếu dùng domain khác, thay `educodeai.top` và cập nhật đồng thời `DOMAIN`, `CORS_ALLOWED_ORIGIN`, `VITE_API_URL`, OAuth/reCAPTCHA/Firebase.

### Bắt buộc trên Docker Linux: host gateway

Container Caddy của Dự án 1 cần phân giải được `host.docker.internal`. Trong service `caddy` của `docker-compose.prod.yml` thuộc CuocThiAI, bảo đảm có:

```yaml
services:
  caddy:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Nếu vừa thêm `extra_hosts`, recreate Caddy trước:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d caddy
```

Xác minh từ container Caddy:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec caddy \
  wget -qO- http://host.docker.internal:8082/health
```

### Validate và reload Caddy

Chạy trong thư mục Dự án 1:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec caddy \
  caddy validate --config /etc/caddy/Caddyfile

docker compose --env-file .env.production -f docker-compose.prod.yml exec caddy \
  caddy reload --config /etc/caddy/Caddyfile
```

Lệnh reload dạng rút gọn theo cấu hình mặc định của image:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec caddy caddy reload
```

Caddy sẽ tự xin/gia hạn SSL cho `educodeai.top`. Kiểm tra:

```bash
curl -I https://educodeai.top
curl -fsS https://educodeai.top/health
```

Nếu Caddy báo không kết nối được upstream, kiểm tra Dự án 2 đang chạy, `APP_PORT`, loopback listener và `extra_hosts`.

## 5. GitHub Actions auto-deploy

Workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) chạy khi push/merge vào `main` hoặc chạy thủ công. Nó build frontend/backend, validate Compose, SSH tới VPS, cập nhật `main`, rebuild stack, kiểm tra health rồi dọn image cũ.

Khai báo tại **Repository → Settings → Secrets and variables → Actions**:

### Repository/Environment secrets

| Secret | Nội dung |
|---|---|
| `VPS_HOST` | IP hoặc hostname VPS |
| `VPS_USER` | User SSH, ví dụ `deploy` |
| `VPS_PORT` | Cổng SSH, ví dụ `22` |
| `VPS_SSH_PRIVATE_KEY` | Toàn bộ private key SSH, gồm BEGIN/END |

### Repository variable tùy chọn

| Variable | Nội dung |
|---|---|
| `VPS_PROJECT_PATH` | Mặc định `/home/deploy/duan2`; chỉ đặt khi dùng đường dẫn khác |

Public key tương ứng phải nằm trong `/home/deploy/.ssh/authorized_keys`. User deploy phải có quyền chạy Docker và repository trên VPS phải `git fetch` không cần nhập mật khẩu.

Workflow dùng lệnh production tương đương yêu cầu:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --remove-orphans
docker image prune -f
```

`--env-file .env.production` được thêm rõ ràng vì Compose mặc định chỉ tự đọc file tên `.env`, không tự đọc `.env.production`.

## 6. Log và trạng thái

```bash
cd /home/deploy/duan2

docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 backend
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=200 migrate
```

Log Caddy phải xem từ Dự án 1:

```bash
cd /home/deploy/cuoc-thi-ai
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 caddy
```

## 7. Cập nhật hoặc khởi động lại thủ công

```bash
cd /home/deploy/duan2
git checkout main
git pull --ff-only origin main
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --remove-orphans
docker image prune -f
```

Restart riêng service:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml restart frontend backend
```

Không dùng `docker compose down -v` trong production vì `-v` xóa Redis và uploads dữ liệu bền vững. Database nằm trên Supabase Cloud; thao tác database/backup thực hiện trong Supabase hoặc bằng `pg_dump` với connection string Supabase.

## 8. Backup tối thiểu

### Supabase PostgreSQL

Database production nằm trên Supabase Cloud. Bật backup tự động trong Supabase Dashboard; nếu cần backup thủ công, dùng `pg_dump` trên máy quản trị với connection string Supabase (không ghi connection string vào shell history hoặc Git).

### Uploads

```bash
docker run --rm \
  -v educodeai_backend_uploads:/data:ro \
  -v "$HOME/backups:/backup" \
  alpine:3.22 sh -c 'tar czf /backup/educodeai-uploads-$(date +%F-%H%M%S).tar.gz -C /data .'
```

Xác nhận tên volume bằng `docker volume ls`; prefix phụ thuộc `COMPOSE_PROJECT_NAME`.

## 9. Xử lý lỗi thường gặp

### Caddy trả 502

```bash
curl -v http://127.0.0.1:8082/health
cd /home/deploy/cuoc-thi-ai
docker compose --env-file .env.production -f docker-compose.prod.yml exec caddy \
  wget -S -O- http://host.docker.internal:8082/health
```

- Lệnh đầu lỗi: kiểm tra stack EduCodeAI và `APP_PORT`.
- Lệnh đầu thành công nhưng lệnh trong Caddy lỗi: thêm `extra_hosts` rồi recreate Caddy.

### Domain chưa có HTTPS

```bash
dig +short educodeai.top
curl -Iv https://educodeai.top
```

Kiểm tra DNS trỏ đúng VPS, firewall mở 80/443 và log Caddy Dự án 1. Không chạy Caddy/Nginx thứ hai trên 80/443.

### Migration thất bại

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps -a migrate
docker compose --env-file .env.production -f docker-compose.prod.yml logs migrate
```

Backend cố ý không start khi migration lỗi. Sửa cấu hình hoặc migration và chạy lại Compose; backup trước migration quan trọng.

### SignalR/WebSocket lỗi

Frontend Nginx đã chuyển tiếp `Upgrade`/`Connection`. Caddy hỗ trợ WebSocket mặc định. Kiểm tra browser Network, log frontend/backend và bảo đảm client dùng `https://educodeai.top`, không gọi trực tiếp `localhost` hoặc `:8082`.

## 10. Checklist

- [ ] `educodeai.top` trỏ đúng VPS.
- [ ] `.env.production` có `APP_PORT=8082`, URL/CORS dùng HTTPS domain.
- [ ] Dự án 2 chỉ listen `127.0.0.1:8082`.
- [ ] PostgreSQL, Redis và backend không publish port.
- [ ] Caddyfile CuocThiAI có block `educodeai.top`.
- [ ] Caddy Compose CuocThiAI có `host.docker.internal:host-gateway`.
- [ ] Caddy validate/reload thành công.
- [ ] `https://educodeai.top/health` trả trạng thái healthy.
- [ ] Bốn GitHub Secrets đã được cấu hình.
- [ ] Có backup PostgreSQL và uploads.
