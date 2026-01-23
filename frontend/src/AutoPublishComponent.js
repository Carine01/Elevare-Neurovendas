/**
 * AutoPublishComponent.js
 * Componente para publicação automática em múltiplas plataformas
 */

import React, { useState, useEffect } from 'react';

const AutoPublishComponent = ({ postId, onPublishSuccess }) => {
  const [platforms, setPlatforms] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);
  const [error, setError] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledPlatforms, setScheduledPlatforms] = useState([]);

  // Carregar plataformas disponíveis
  useEffect(() => {
    fetchAvailablePlatforms();
  }, []);

  const fetchAvailablePlatforms = async () => {
    try {
      const response = await fetch('/api/blog/publicar-status');
      const data = await response.json();

      const available = Object.entries(data.platforms)
        .filter(([_, config]) => config.enabled)
        .map(([key, config]) => ({
          id: key,
          ...config
        }));

      setAvailablePlatforms(available);
    } catch (err) {
      console.error('Erro ao carregar plataformas:', err);
      setError('Erro ao carregar plataformas disponíveis');
    }
  };

  const handlePlatformToggle = (platformId) => {
    setPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublishNow = async () => {
    if (platforms.length === 0) {
      setError('Selecione pelo menos uma plataforma');
      return;
    }

    setIsPublishing(true);
    setError('');

    try {
      const response = await fetch(`/api/blog/posts/${postId}/publicar-automatico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms })
      });

      const data = await response.json();

      if (data.success) {
        setPublishResults(data.results);
        
        // Callback
        if (onPublishSuccess) {
          onPublishSuccess(data.results);
        }

        // Notificar sucesso
        const successCount = data.results.success.length;
        const failCount = data.results.failed.length;
        alert(`✅ Publicado em ${successCount} plataforma(s)${failCount > 0 ? `, ${failCount} falharam` : ''}!`);
      } else {
        setError(data.detail || 'Erro ao publicar');
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedulePublication = async () => {
    if (!scheduledDate || !scheduledTime) {
      setError('Selecione data e hora');
      return;
    }

    if (scheduledPlatforms.length === 0) {
      setError('Selecione pelo menos uma plataforma');
      return;
    }

    const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00Z`;

    try {
      const response = await fetch(`/api/blog/posts/${postId}/agendar-publicacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_publicacao: scheduledDateTime,
          platforms: scheduledPlatforms
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Publicação agendada para ${scheduledDateTime}`);
        setShowScheduler(false);
        setScheduledDate('');
        setScheduledTime('');
        setScheduledPlatforms([]);
      } else {
        setError(data.detail || 'Erro ao agendar');
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    }
  };

  // Renderizar resultado de publicação
  const PublishResults = () => {
    if (!publishResults) return null;

    return (
      <div className="publish-results">
        <h4>📊 Resultados da Publicação</h4>

        {/* Sucessos */}
        {publishResults.success.length > 0 && (
          <div className="success-list">
            <h5>✅ Sucesso ({publishResults.success.length})</h5>
            {publishResults.success.map((result, idx) => (
              <div key={idx} className="result-item success">
                <span className="platform-badge">{result.platform}</span>
                {result.url && (
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-link">
                    Ver artigo →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Falhas */}
        {publishResults.failed.length > 0 && (
          <div className="failed-list">
            <h5>❌ Falhas ({publishResults.failed.length})</h5>
            {publishResults.failed.map((result, idx) => (
              <div key={idx} className="result-item failed">
                <span className="platform-badge">{result.platform}</span>
                <span className="error-message">{result.error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="auto-publish-container" style={{ padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '0.5rem' }}>
          📤 Publicação Automática
        </h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Publique seu artigo em múltiplas plataformas com um clique
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Plataformas disponíveis */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#4B5563' }}>
          Selecione plataformas:
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.5rem'
        }}>
          {availablePlatforms.map(platform => (
            <label
              key={platform.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: platforms.includes(platform.id) ? '#DBEAFE' : '#FFFFFF',
                borderRadius: '8px',
                border: `2px solid ${platforms.includes(platform.id) ? '#3B82F6' : '#E5E7EB'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <input
                type="checkbox"
                checked={platforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
                style={{ cursor: 'pointer' }}
              />
              <span>{platform.icon}</span>
              <span>{platform.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Botões de ação */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={handlePublishNow}
          disabled={isPublishing || platforms.length === 0}
          style={{
            padding: '0.75rem',
            backgroundColor: isPublishing ? '#9CA3AF' : '#10B981',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: isPublishing ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => !isPublishing && (e.target.style.backgroundColor = '#059669')}
          onMouseLeave={(e) => !isPublishing && (e.target.style.backgroundColor = '#10B981')}
        >
          {isPublishing ? '⏳ Publicando...' : '🚀 Publicar Agora'}
        </button>

        <button
          onClick={() => setShowScheduler(!showScheduler)}
          style={{
            padding: '0.75rem',
            backgroundColor: '#8B5CF6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#7C3AED')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#8B5CF6')}
        >
          📅 Agendar
        </button>
      </div>

      {/* Scheduler */}
      {showScheduler && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
          border: '1px solid #D1D5DB'
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            📅 Agendar Publicação
          </h4>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Data:
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Hora:
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Plataformas:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '0.5rem'
            }}>
              {availablePlatforms.map(platform => (
                <label
                  key={platform.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={scheduledPlatforms.includes(platform.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setScheduledPlatforms([...scheduledPlatforms, platform.id]);
                      } else {
                        setScheduledPlatforms(scheduledPlatforms.filter(p => p !== platform.id));
                      }
                    }}
                  />
                  {platform.icon} {platform.name}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={handleSchedulePublication}
              style={{
                padding: '0.5rem',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ✅ Agendar
            </button>
            <button
              onClick={() => setShowScheduler(false)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#6B7280',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Resultados */}
      <PublishResults />

      {/* Info */}
      <div style={{
        padding: '0.75rem',
        backgroundColor: '#DBEAFE',
        borderRadius: '6px',
        color: '#0369A1',
        fontSize: '0.75rem',
        marginTop: '1rem'
      }}>
        💡 Dica: Você pode publicar imediatamente ou agendar para uma hora específica. A sincronização automática com Google Calendar também está disponível!
      </div>
    </div>
  );
};

export default AutoPublishComponent;
