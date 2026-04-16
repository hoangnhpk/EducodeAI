import React, { useState } from 'react';
import './KhoaHocModule.css';

import CourseListPage from './pages/CourseListPage';
import CourseFormPage from './pages/CourseFormPage';
import PlaylistImportPage from './pages/PlaylistImportPage';
import CourseManagePage from './pages/CourseManagePage';

// ============================================================
//  View State Machine
//  list → create/edit → manage → import
// ============================================================
type View =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; maKhoaHoc: number }
  | { type: 'import'; maKhoaHoc: number }
  | { type: 'manage'; maKhoaHoc: number };

const KhoaHocCuaToi: React.FC = () => {
  const [view, setView] = useState<View>({ type: 'list' });

  const goList = () => setView({ type: 'list' });
  const goCreate = () => setView({ type: 'create' });
  const goEdit = (maKhoaHoc: number) => setView({ type: 'edit', maKhoaHoc });
  const goImport = (maKhoaHoc: number) => setView({ type: 'import', maKhoaHoc });
  const goManage = (maKhoaHoc: number) => setView({ type: 'manage', maKhoaHoc });

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
        onSavedAndContinue={goImport}
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
    const { maKhoaHoc } = view;
    return (
      <CourseManagePage
        maKhoaHoc={maKhoaHoc}
        onBack={goList}
        onEdit={() => goEdit(maKhoaHoc)}
        onImportPlaylist={() => goImport(maKhoaHoc)}
      />
    );
  }

  return null;
};

export default KhoaHocCuaToi;
