'use client';

import { useState } from 'react';

async function getResponseMessage(response) {
  const body = await response.text();

  if (!body) {
    return response.ok
      ? 'تم تنفيذ الطلب بنجاح.'
      : `تعذر تنفيذ الطلب (${response.status} ${response.statusText}).`;
  }

  try {
    const data = JSON.parse(body);

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      const message = data.message ?? data.error;
      return message ? String(message) : JSON.stringify(data);
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  return body;
}

export default function Index() {
  const [pendingAction, setPendingAction] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);

  async function sendRequest(action, url, method, body) {
    setPendingAction(action);
    setResponseMessage(null);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const message = await getResponseMessage(response);

      setResponseMessage({
        type: response.ok ? 'success' : 'error',
        text: message,
      });
    } catch (error) {
      setResponseMessage({
        type: 'error',
        text:
          error instanceof Error
            ? `تعذر الاتصال بالخادم: ${error.message}`
            : 'تعذر الاتصال بالخادم.',
      });
    } finally {
      setPendingAction(null);
    }
  }

  function handleSave(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      mac_address: formData.get('mac_address'),
      m3u_link: formData.get('m3u_link'),
      xtream_url: formData.get('xtream_url'),
      xtream_username: formData.get('xtream_username'),
      xtream_password: formData.get('xtream_password'),
    };

    sendRequest('save', '/api/save', 'POST', payload);
  }

  function handleDelete(event) {
    const formData = new FormData(event.currentTarget.form);
    const macAddress = String(formData.get('mac_address') ?? '').trim();

    if (!macAddress) {
      setResponseMessage({
        type: 'error',
        text: 'يرجى إدخال عنوان MAC قبل الحذف.',
      });
      return;
    }

    sendRequest('delete', '/api/delete', 'DELETE', {
      mac_address: macAddress,
    });
  }

  const inputStyle = {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: 46,
    padding: '11px 14px',
    border: '1px solid #d5dbe5',
    borderRadius: 10,
    background: '#fff',
    color: '#152238',
    font: 'inherit',
    outlineColor: '#4f6bed',
  };

  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: '56px 20px',
        background:
          'radial-gradient(ellipse at top right, #e8edff 0, transparent 42%), #f5f7fb',
        color: '#152238',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 620,
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: 'clamp(24px, 5vw, 42px)',
          border: '1px solid #e8ebf2',
          borderRadius: 20,
          background: '#fff',
          boxShadow: '0 20px 60px rgba(31, 48, 80, 0.09)',
        }}
      >
        <header style={{ marginBottom: 30 }}>
          <p
            style={{
              margin: '0 0 10px',
              color: '#5269d8',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            إدارة الاشتراكات
          </p>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.3 }}>
            بوابة IPTV
          </h1>
          <p style={{ margin: '10px 0 0', color: '#697586', lineHeight: 1.7 }}>
            أدخل بيانات الاتصال لحفظ اشتراك أو حذفه.
          </p>
        </header>

        <form onSubmit={handleSave}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
              gap: 18,
            }}
          >
            <label style={{ display: 'grid', gap: 8, gridColumn: '1 / -1' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                عنوان MAC <span style={{ color: '#dc3545' }}>*</span>
              </span>
              <input
                autoComplete="off"
                name="mac_address"
                placeholder="مثال: 00:1A:2B:3C:4D:5E"
                required
                style={inputStyle}
                type="text"
              />
            </label>

            <label style={{ display: 'grid', gap: 8, gridColumn: '1 / -1' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>رابط M3U</span>
              <input
                autoComplete="url"
                name="m3u_link"
                placeholder="https://example.com/playlist.m3u"
                style={inputStyle}
                type="url"
              />
            </label>

            <label style={{ display: 'grid', gap: 8, gridColumn: '1 / -1' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                رابط Xtream
              </span>
              <input
                autoComplete="url"
                name="xtream_url"
                placeholder="https://example.com:8080"
                style={inputStyle}
                type="url"
              />
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                اسم مستخدم Xtream
              </span>
              <input
                autoComplete="username"
                name="xtream_username"
                placeholder="اسم المستخدم"
                style={inputStyle}
                type="text"
              />
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                كلمة مرور Xtream
              </span>
              <input
                autoComplete="new-password"
                name="xtream_password"
                placeholder="كلمة المرور"
                style={inputStyle}
                type="password"
              />
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 26,
            }}
          >
            <button
              disabled={pendingAction !== null}
              style={{
                flex: '1 1 180px',
                minHeight: 48,
                padding: '12px 20px',
                border: 0,
                borderRadius: 10,
                background: '#4f6bed',
                color: '#fff',
                cursor: pendingAction ? 'wait' : 'pointer',
                font: 'inherit',
                fontWeight: 700,
                opacity: pendingAction ? 0.7 : 1,
              }}
              type="submit"
            >
              {pendingAction === 'save' ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
            <button
              disabled={pendingAction !== null}
              onClick={handleDelete}
              style={{
                flex: '1 1 180px',
                minHeight: 48,
                padding: '12px 20px',
                border: '1px solid #f0c7ca',
                borderRadius: 10,
                background: '#fff7f7',
                color: '#bd303a',
                cursor: pendingAction ? 'wait' : 'pointer',
                font: 'inherit',
                fontWeight: 700,
                opacity: pendingAction ? 0.7 : 1,
              }}
              type="button"
            >
              {pendingAction === 'delete' ? 'جارٍ الحذف…' : 'حذف'}
            </button>
          </div>
        </form>

        {responseMessage && (
          <p
            aria-live="polite"
            role={responseMessage.type === 'error' ? 'alert' : 'status'}
            style={{
              margin: '22px 0 0',
              padding: '13px 15px',
              borderRadius: 10,
              background:
                responseMessage.type === 'success' ? '#effaf3' : '#fff1f1',
              color: responseMessage.type === 'success' ? '#187343' : '#a92932',
              lineHeight: 1.6,
              overflowWrap: 'anywhere',
            }}
          >
            {responseMessage.text}
          </p>
        )}
      </section>
    </main>
  );
}
