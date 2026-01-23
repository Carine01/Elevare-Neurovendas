/**
 * GoogleCalendarSync.js
 * Componente para sincronizar posts de blog com Google Calendar
 */

import React, { useState, useEffect } from 'react';

const GoogleCalendarSync = ({ postId, onSyncSuccess }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [error, setError] = useState('');
  const [calendarUrl, setCalendarUrl] = useState('');

  // Verificar se já tem Google Calendar conectado
  useEffect(() => {
    checkGoogleCalendarConnection();
  }, []);

  // Processar callback OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const checkGoogleCalendarConnection = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'user_default';
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      
      setIsConnected(userData.google_calendar_connected || false);
      
      // Verificar se post está sincronizado
      if (postId) {
        const postResponse = await fetch(`/api/blog/posts/${postId}`);
        const postData = await postResponse.json();
        setIsSynced(postData.google_calendar_synced || false);
        setCalendarUrl(postData.google_calendar_calendar_url || '');
      }
    } catch (err) {
      console.error('Erro ao verificar conexão:', err);
    }
  };

  const getAuthUrl = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/google-calendar/auth-url');
      const data = await response.json();

      if (data.success) {
        setAuthUrl(data.auth_url);
        // Redirecionar para autenticação do Google
        window.location.href = data.auth_url;
      } else {
        setError('Erro ao obter URL de autenticação');
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async (code, state) => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId') || 'user_default';

      const response = await fetch('/api/google-calendar/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state, user_id: userId })
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(true);
        setError('');
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        alert('✅ Google Calendar conectado com sucesso!');
      } else {
        setError('Erro ao conectar Google Calendar: ' + data.detail);
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const syncPostToCalendar = async () => {
    if (!postId) {
      setError('Post ID não encontrado');
      return;
    }

    if (!isConnected) {
      setError('Google Calendar não conectado. Faça login primeiro.');
      return;
    }

    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId') || 'user_default';

      const response = await fetch(`/api/blog/posts/${postId}/sync-google-calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (data.success) {
        setIsSynced(true);
        setCalendarUrl(data.calendar_url);
        setError('');
        
        if (onSyncSuccess) {
          onSyncSuccess(data);
        }

        alert('✅ Post sincronizado ao Google Calendar!');
      } else {
        setError('Erro ao sincronizar: ' + data.detail);
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFromCalendar = async () => {
    if (!postId) {
      setError('Post ID não encontrado');
      return;
    }

    if (!confirm('Tem certeza que deseja remover a sincronização com Google Calendar?')) {
      return;
    }

    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId') || 'user_default';

      const response = await fetch(`/api/blog/posts/${postId}/disconnect-google-calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (data.success) {
        setIsSynced(false);
        setCalendarUrl('');
        setError('');
        alert('✅ Sincronização removida com sucesso!');
      } else {
        setError('Erro ao desconectar: ' + data.detail);
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Status Badge
  const StatusBadge = () => {
    if (isSynced) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Sincronizado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        Não sincronizado
      </span>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Google Calendar</h3>
            <p className="text-sm text-gray-500">Sincronizar post com seu calendário</p>
          </div>
        </div>
        <StatusBadge />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Conexão não realizada */}
      {!isConnected && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
          <p className="text-sm text-gray-700">
            Para sincronizar este post com seu Google Calendar, você precisa conectar sua conta do Google.
          </p>
          <button
            onClick={getAuthUrl}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                Conectar Google Calendar
              </>
            )}
          </button>
        </div>
      )}

      {/* Conexão realizada */}
      {isConnected && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">
              ✅ Google Calendar conectado com sucesso!
            </p>
          </div>

          {/* Sincronizar/Desincronizar */}
          <div className="flex gap-2">
            {!isSynced ? (
              <button
                onClick={syncPostToCalendar}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sincronizar ao Calendário
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => window.open(calendarUrl, '_blank')}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir no Calendário
                </button>
                <button
                  onClick={disconnectFromCalendar}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Desconectando...' : 'Desincronizar'}
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
            <p>
              💡 Quando você sincroniza um post, ele é adicionado como evento no seu Google Calendar
            </p>
            <p>
              📝 As datas/horas são baseadas em seu timezone (America/Sao_Paulo)
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-400 text-center">
        Google Calendar Integration v1.0
      </div>
    </div>
  );
};

export default GoogleCalendarSync;
