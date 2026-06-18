import { useState, useEffect, useCallback, FormEvent } from 'react';
import Head from 'next/head';
import { Booth } from '@/types/booth';
import styles from '@/styles/Admin.module.scss';

const EMPTY_FORM: Partial<Booth> = {
  name: '', subtitle: '', image: '', method: '',
  winCondition: '', conquestPoints: '', participants: '',
  coinCondition: '', rules: '', preparation: '', postCheck: '',
};

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [booths, setBooths] = useState<Booth[]>([]);
  const [editing, setEditing] = useState<Partial<Booth> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = editing ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editing]);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_api_key');
    if (saved) {
      setApiKey(saved);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) loadBooths();
  }, [loggedIn]);

  async function loadBooths() {
    const res = await fetch('/api/booths');
    setBooths(await res.json());
  }

  function headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/booths', { headers: { Authorization: `Bearer ${apiKey}` } });
    if (res.ok) {
      sessionStorage.setItem('admin_api_key', apiKey);
      setLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('인증 실패');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_api_key');
    setApiKey('');
    setLoggedIn(false);
  }

  function openCreate() {
    setEditing({ ...EMPTY_FORM });
    setIsNew(true);
  }

  function openEdit(booth: Booth) {
    setEditing({ ...booth });
    setIsNew(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing || saving) return;
    if (!editing.image) { alert('이미지를 업로드해주세요'); return; }

    setSaving(true);
    try {
      if (isNew) {
        await fetch('/api/booths', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(editing),
        });
      } else {
        await fetch(`/api/booths/${editing.id}`, {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify(editing),
        });
      }
      setEditing(null);
      loadBooths();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/booths/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    loadBooths();
  }

  function updateField(key: keyof Booth, value: string | number) {
    setEditing(prev => prev ? { ...prev, [key]: value } : prev);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      updateField('image', url);
    } catch {
      alert('이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  }

  if (!loggedIn) {
    return (
      <>
        <Head><title>Admin Login</title></Head>
        <div className={styles.loginBox}>
          <h1>Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <button type="submit">로그인</button>
          </form>
          {loginError && <p className={styles.error}>{loginError}</p>}
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Admin - 부스 관리</title></Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>부스 관리</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={styles.btnAdd} onClick={openCreate}>+ 추가</button>
            <button className={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>서브타이틀</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {booths.map(booth => (
              <tr key={booth.id}>
                <td>{booth.id}</td>
                <td>{booth.name}</td>
                <td>{booth.subtitle}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => openEdit(booth)}>수정</button>
                    <button className={styles.btnDelete} onClick={() => handleDelete(booth.id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editing && (
          <div className={styles.modal} onClick={() => setEditing(null)}>
            <form className={styles.form} onClick={e => e.stopPropagation()} onSubmit={handleSave}>
              {saving && <div className={styles.loadingOverlay}><span className={styles.spinner} /></div>}
              <h2>{isNew ? '부스 추가' : `부스 ${editing.id} 수정`}</h2>

              {isNew && (
                <div className={styles.field}>
                  <label>ID (선택, 비우면 자동 생성)</label>
                  <input type="number" value={editing.id || ''} onChange={e => updateField('id', e.target.value ? Number(e.target.value) : 0)} />
                </div>
              )}

              <div className={styles.field}>
                <label>이름 *</label>
                <input required value={editing.name || ''} onChange={e => updateField('name', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>서브타이틀 *</label>
                <input required value={editing.subtitle || ''} onChange={e => updateField('subtitle', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>이미지 *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p style={{ fontSize: 13, color: '#666' }}>업로드 중...</p>}
                {editing.image && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={editing.image}
                      alt="미리보기"
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                    />
                    <input
                      type="text"
                      value={editing.image}
                      readOnly
                      style={{ marginTop: 4, width: '100%', fontSize: 12, color: '#888' }}
                    />
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <label>게임 방식 *</label>
                <textarea required rows={6} value={editing.method || ''} onChange={e => updateField('method', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>승리 조건</label>
                <textarea rows={3} value={editing.winCondition || ''} onChange={e => updateField('winCondition', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>점령 포인트</label>
                <textarea rows={2} value={editing.conquestPoints || ''} onChange={e => updateField('conquestPoints', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>참가 인원 *</label>
                <textarea required rows={3} value={editing.participants || ''} onChange={e => updateField('participants', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>코인 조건</label>
                <textarea rows={2} value={editing.coinCondition || ''} onChange={e => updateField('coinCondition', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>규칙</label>
                <textarea rows={2} value={editing.rules || ''} onChange={e => updateField('rules', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>사전 준비</label>
                <textarea rows={2} value={editing.preparation || ''} onChange={e => updateField('preparation', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>사후 확인</label>
                <textarea rows={2} value={editing.postCheck || ''} onChange={e => updateField('postCheck', e.target.value)} />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setEditing(null)} disabled={saving}>취소</button>
                <button type="submit" className={styles.btnSave} disabled={saving}>{saving ? '저장 중...' : isNew ? '추가' : '저장'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
