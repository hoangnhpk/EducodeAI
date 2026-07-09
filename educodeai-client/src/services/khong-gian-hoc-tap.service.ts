import axiosClient from '@/configs/axios';

export interface KhongGianHocTapItem {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  hinhAnh: string | null;
  tongSoBaiHoc: number;
  soBaiDaHoc: number;
  phanTramTienDo: number;
  slug: string;
  ngayDangKy: string;
  trangThaiDangKy: string | null;
}

export async function layDanhSachKhongGianHocTap(): Promise<KhongGianHocTapItem[]> {
  const body = await axiosClient.get<{ success: boolean; data: KhongGianHocTapItem[] }>(
    '/api/hoc-vien/khong-gian-hoc-tap'
  );
  return body.data ?? [];
}

export type SkillTreeNodeStatus = 'done' | 'in_progress' | 'not_registered' | 'locked';

export interface SkillTreeLoTrinhOption {
  maLoTrinh: number;
  tenLoTrinh: string;
  trangThai: string;
  tongSoKhoaHoc: number;
}

export interface SkillTreeNode {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  hinhAnh: string | null;
  slug: string;
  giaiDoan: number;
  mucTieuGiaiDoan: string;
  thuTu: number;
  trangThai: SkillTreeNodeStatus;
  phanTramTienDo: number;
  tongSoBaiHoc: number;
  soBaiDaHoc: number;
  laBuocTiepTheo: boolean;
  daDangKy: boolean;
}

export interface SkillTreeEdge {
  fromMaKhoaHoc: number;
  toMaKhoaHoc: number;
}

export interface SkillTreeResponse {
  maLoTrinh: number | null;
  tenLoTrinh: string;
  moTaChung: string;
  tongSoKhoaHoc: number;
  soKhoaHoanThanh: number;
  phanTramTong: number;
  tongThoiGianTuan: number;
  danhSachLoTrinh: SkillTreeLoTrinhOption[];
  nodes: SkillTreeNode[];
  edges: SkillTreeEdge[];
}

/** Chuẩn hóa payload (camelCase hoặc PascalCase từ .NET). */
function normalizeSkillTreePayload(raw: unknown): SkillTreeResponse {
  const wrap = raw as Record<string, unknown>;
  const inner = (wrap.data ?? wrap) as Record<string, unknown>;

  const pick = <T>(camel: string, pascal: string): T | undefined =>
    (inner[camel] ?? inner[pascal]) as T | undefined;

  const nodesRaw = (pick<unknown[]>('nodes', 'Nodes') ?? []) as Record<string, unknown>[];
  const edgesRaw = (pick<unknown[]>('edges', 'Edges') ?? []) as Record<string, unknown>[];

  const nodes: SkillTreeNode[] = nodesRaw.map((n, i) => ({
    maKhoaHoc: Number(n.maKhoaHoc ?? n.MaKhoaHoc ?? 0),
    tenKhoaHoc: String(n.tenKhoaHoc ?? n.TenKhoaHoc ?? ''),
    hinhAnh: (n.hinhAnh ?? n.HinhAnh ?? null) as string | null,
    slug: String(n.slug ?? n.Slug ?? ''),
    giaiDoan: Number(n.giaiDoan ?? n.GiaiDoan ?? 1),
    mucTieuGiaiDoan: String(n.mucTieuGiaiDoan ?? n.MucTieuGiaiDoan ?? ''),
    thuTu: Number(n.thuTu ?? n.ThuTu ?? i + 1),
    trangThai: String(n.trangThai ?? n.TrangThai ?? 'locked') as SkillTreeNodeStatus,
    phanTramTienDo: Number(n.phanTramTienDo ?? n.PhanTramTienDo ?? 0),
    tongSoBaiHoc: Number(n.tongSoBaiHoc ?? n.TongSoBaiHoc ?? 0),
    soBaiDaHoc: Number(n.soBaiDaHoc ?? n.SoBaiDaHoc ?? 0),
    laBuocTiepTheo: Boolean(n.laBuocTiepTheo ?? n.LaBuocTiepTheo ?? false),
    daDangKy: Boolean(n.daDangKy ?? n.DaDangKy ?? false),
  }));

  const edges: SkillTreeEdge[] = edgesRaw.map((e) => ({
    fromMaKhoaHoc: Number(e.fromMaKhoaHoc ?? e.FromMaKhoaHoc ?? 0),
    toMaKhoaHoc: Number(e.toMaKhoaHoc ?? e.ToMaKhoaHoc ?? 0),
  }));

  const danhSachLoTrinhRaw = (pick<unknown[]>('danhSachLoTrinh', 'DanhSachLoTrinh') ?? []) as Record<
    string,
    unknown
  >[];

  return {
    maLoTrinh: (pick<number | null>('maLoTrinh', 'MaLoTrinh') ?? null) as number | null,
    tenLoTrinh: String(pick<string>('tenLoTrinh', 'TenLoTrinh') ?? ''),
    moTaChung: String(pick<string>('moTaChung', 'MoTaChung') ?? ''),
    tongSoKhoaHoc: Number(pick<number>('tongSoKhoaHoc', 'TongSoKhoaHoc') ?? nodes.length),
    soKhoaHoanThanh: Number(pick<number>('soKhoaHoanThanh', 'SoKhoaHoanThanh') ?? 0),
    phanTramTong: Number(pick<number>('phanTramTong', 'PhanTramTong') ?? 0),
    tongThoiGianTuan: Number(pick<number>('tongThoiGianTuan', 'TongThoiGianTuan') ?? 0),
    danhSachLoTrinh: danhSachLoTrinhRaw.map((lt) => ({
      maLoTrinh: Number(lt.maLoTrinh ?? lt.MaLoTrinh ?? 0),
      tenLoTrinh: String(lt.tenLoTrinh ?? lt.TenLoTrinh ?? ''),
      trangThai: String(lt.trangThai ?? lt.TrangThai ?? ''),
      tongSoKhoaHoc: Number(lt.tongSoKhoaHoc ?? lt.TongSoKhoaHoc ?? 0),
    })),
    nodes,
    edges,
  };
}

export async function laySkillTree(maLoTrinh?: number): Promise<SkillTreeResponse> {
  const body = await axiosClient.get<unknown>(
    '/api/hoc-vien/khong-gian-hoc-tap/skill-tree',
    { params: maLoTrinh ? { maLoTrinh } : undefined }
  );
  return normalizeSkillTreePayload(body);
}
