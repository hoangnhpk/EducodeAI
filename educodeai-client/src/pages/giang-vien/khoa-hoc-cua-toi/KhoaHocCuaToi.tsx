import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './KhoaHocModule.css';

import CourseListPage from './pages/CourseListPage';
import CourseFormPage from './pages/CourseFormPage';
import PlaylistImportPage from './pages/PlaylistImportPage';
import CourseManagePage from './pages/CourseManagePage';

// ============================================================
//  View State Machine
//  list → create/edit → manage → import
// ============================================================
type ManageTab = 'overview' | 'content' | 'import' | 'certificate' | 'settings';

type View =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; maKhoaHoc: number }
  | { type: 'import'; maKhoaHoc: number }
  | { type: 'manage'; maKhoaHoc: number; tab?: ManageTab };

const parseView = (searchParams: URLSearchParams): View => {
  const view = searchParams.get('view');
  const maKhoaHoc = Number(searchParams.get('maKhoaHoc'));

  if (view === 'create') return { type: 'create' };
  if ((view === 'edit' || view === 'import' || view === 'manage') && Number.isInteger(maKhoaHoc) && maKhoaHoc > 0) {
    if (view === 'manage') {
      const tab = searchParams.get('tab') as ManageTab | null;
      return { type: 'manage', maKhoaHoc, tab: tab ?? undefined };
    }
    return { type: view, maKhoaHoc };
  }

  return { type: 'list' };
};

const KhoaHocCuaToi: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setViewState] = useState<View>(() => parseView(searchParams));

  const setView = (nextView: View) => {
    setViewState(nextView);

    if (nextView.type === 'list') {
      setSearchParams({});
    } else if (nextView.type === 'create') {
      setSearchParams({ view: 'create' });
    } else if (nextView.type === 'manage') {
      const params: Record<string, string> = { view: 'manage', maKhoaHoc: String(nextView.maKhoaHoc) };
      if (nextView.tab) params.tab = nextView.tab;
      setSearchParams(params);
    } else {
      setSearchParams({ view: nextView.type, maKhoaHoc: String(nextView.maKhoaHoc) });
    }
  };

  const goList = () => setView({ type: 'list' });
  const goCreate = () => setView({ type: 'create' });
  const goEdit = (maKhoaHoc: number) => setView({ type: 'edit', maKhoaHoc });
  const goImport = (maKhoaHoc: number) => setView({ type: 'import', maKhoaHoc });
  const goManage = (maKhoaHoc: number, tab?: ManageTab) => setView({ type: 'manage', maKhoaHoc, tab });

  // ---- LIST ----
  if (view.type === 'list') {
    return (
      <CourseListPage
        onCreateNew={goCreate}
        onEdit={goEdit}
        onManage={goManage}
      />
    );
  }

  // ---- CREATE ----
  if (view.type === 'create') {
    return (
      <CourseFormPage
        onSaved={goManage}
        onSavedAndContinue={(id) => goManage(id, 'content')}
        onCancel={goList}
      />
    );
  }

  // ---- EDIT ----
  if (view.type === 'edit') {
    const { maKhoaHoc } = view;
    return (
      <CourseFormPage
        maKhoaHoc={maKhoaHoc}
        onSaved={() => goManage(maKhoaHoc)}
        onSavedAndContinue={() => goImport(maKhoaHoc)}
        onCancel={() => goManage(maKhoaHoc)}
      />
    );
  }

  // ---- IMPORT ----
  if (view.type === 'import') {
    const { maKhoaHoc } = view;
    return (
      <PlaylistImportPage
        maKhoaHoc={maKhoaHoc}
        onSuccess={() => goManage(maKhoaHoc)}
        onCancel={goList}
      />
    );
  }

  // ---- MANAGE ----
  if (view.type === 'manage') {
    const { maKhoaHoc, tab } = view;
    return (
      <CourseManagePage
        maKhoaHoc={maKhoaHoc}
        initialTab={tab}
        onBack={goList}
        onEdit={() => goEdit(maKhoaHoc)}
        onImportPlaylist={() => goImport(maKhoaHoc)}
      />
    );
  }

  return null;
};

export default KhoaHocCuaToi;
