import { useState, useEffect, FormEvent } from 'react';
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
    if (!editing) return () => { document.body.style.overflow = ''; };
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setEditing(null);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
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

  // ─── Login ──────────────────────────────────────────────────────

  if (!loggedIn) {
    return (
      <>
        <Head><title>Admin Login</title></Head>
        <div className={styles.loginPage}>
          <div className={styles.loginBox}>
            <h1>부스 관리</h1>
            <p className={styles.loginSub}>관리자 인증이 필요합니다</p>
            <form className={styles.loginForm} onSubmit={handleLogin}>
              <input
                className={styles.loginInput}
                type="password"
                placeholder="API Key 입력"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <button className={styles.loginBtn} type="submit">로그인</button>
            </form>
            {loginError && <p className={styles.error}>{loginError}</p>}
          </div>
        </div>
      </>
    );
  }

  // ─── Dashboard ──────────────────────────────────────────────────

  return (
    <>
      <Head><title>Admin - 부스 관리</title></Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>부스 관리</h1>
          <div className={styles.headerActions}>
            <button className={styles.btnAdd} onClick={openCreate}>+ 새 부스</button>
            <button className={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
          </div>
        </div>

        {booths.length === 0 ? (
          <div className={styles.emptyState}>
            등록된 부스가 없습니다. 위의 &ldquo;+ 새 부스&rdquo; 버튼으로 추가하세요.
          </div>
        ) : (
          <div className={styles.boothList}>
            {booths.map(booth => (
              <div className={styles.boothCard} key={booth.id}>
                {booth.image ? (
                  <img className={styles.boothThumb} src={booth.image} alt={booth.name} />
                ) : (
                  <div className={styles.boothThumbEmpty}>?</div>
                )}
                <div className={styles.boothInfo}>
                  <span className={styles.boothId}>#{booth.id}</span>
                  <p className={styles.boothName}>{booth.name}</p>
                  <p className={styles.boothSub}>{booth.subtitle}</p>
                </div>
                <div className={styles.boothActions}>
                  <button className={styles.btnEdit} onClick={() => openEdit(booth)}>수정</button>
                  <button className={styles.btnDelete} onClick={() => handleDelete(booth.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Edit / Create modal ─────────────────────────────── */}
        {editing && (
          <div className={styles.modal} onClick={() => setEditing(null)}>
            <form className={styles.form} onClick={e => e.stopPropagation()} onSubmit={handleSave}>
              {saving && <div className={styles.loadingOverlay}><span className={styles.spinner} /></div>}

              <div className={styles.formHeader}>
                <h2>{isNew ? '새 부스 추가' : `부스 #${editing.id} 수정`}</h2>
              </div>

              <div className={styles.formBody}>
                {/* 기본 정보 */}
                <div className={styles.fieldGroup}>
                  <p className={styles.fieldGroupLabel}>기본 정보</p>

                  {isNew && (
                    <div className={styles.field}>
                      <label>ID (비우면 자동 생성)</label>
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
                    {uploading && <p className={styles.uploadHint}>업로드 중...</p>}
                    {editing.image && (
                      <div className={styles.imagePreview}>
                        <img src={editing.image} alt="미리보기" />
                        <input
                          className={styles.imageUrl}
                          type="text"
                          value={editing.image}
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 게임 설정 */}
                <div className={styles.fieldGroup}>
                  <p className={styles.fieldGroupLabel}>게임 설정</p>

                  <div className={styles.field}>
                    <label>게임 방식 *</label>
                    <textarea required rows={5} value={editing.method || ''} onChange={e => updateField('method', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label>승리 조건</label>
                    <textarea rows={2} value={editing.winCondition || ''} onChange={e => updateField('winCondition', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label>점령 포인트</label>
                    <textarea rows={2} value={editing.conquestPoints || ''} onChange={e => updateField('conquestPoints', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label>참가 인원 *</label>
                    <textarea required rows={2} value={editing.participants || ''} onChange={e => updateField('participants', e.target.value)} />
                  </div>
                </div>

                {/* 운영 규칙 */}
                <div className={styles.fieldGroup}>
                  <p className={styles.fieldGroupLabel}>운영 규칙</p>

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
                </div>
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
