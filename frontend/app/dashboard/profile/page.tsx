'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Mail, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    videosWatched: 0,
    favorites: 0,
    watchHistory: 0,
  });

  useEffect(() => {
    // Load mock stats for demo
    setStats({
      videosWatched: Math.floor(Math.random() * 50) + 5,
      favorites: Math.floor(Math.random() * 10),
      watchHistory: Math.floor(Math.random() * 30),
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Cargando perfil...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Debes iniciar sesión para ver tu perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="glass-surface rounded-3xl p-8 mb-8 border border-white/5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name || 'User'} 
                className="w-32 h-32 rounded-2xl object-cover border-2 border-primary/50 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-primary/50 shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {user.name || 'Usuario sin nombre'}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-text-secondary">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                {user.created_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Desde {new Date(user.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                  user.role === 'admin' 
                    ? 'bg-secondary/20 text-secondary' 
                    : 'bg-primary/20 text-primary'
                }`}>
                  <Shield className="w-4 h-4" />
                  {user.role === 'admin' ? 'Administrador' : 'Espectador'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-surface rounded-2xl p-6 border border-white/5 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {stats.videosWatched}
            </div>
            <div className="text-text-secondary">Videos vistos</div>
          </div>
          <div className="glass-surface rounded-2xl p-6 border border-white/5 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {stats.favorites}
            </div>
            <div className="text-text-secondary">Favoritos</div>
          </div>
          <div className="glass-surface rounded-2xl p-6 border border-white/5 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {stats.watchHistory}
            </div>
            <div className="text-text-secondary">En tu historial</div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="glass-surface rounded-3xl p-8 border border-white/5">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Configuración de cuenta</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface/50 rounded-xl border border-white/5">
              <div>
                <div className="font-medium text-text-primary">Correo electrónico</div>
                <div className="text-sm text-text-secondary">{user.email}</div>
              </div>
              <button className="btn-secondary text-sm">Cambiar</button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface/50 rounded-xl border border-white/5">
              <div>
                <div className="font-medium text-text-primary">Contraseña</div>
                <div className="text-sm text-text-secondary">••••••••••••</div>
              </div>
              <button className="btn-secondary text-sm">Cambiar</button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface/50 rounded-xl border border-white/5">
              <div>
                <div className="font-medium text-text-primary">Notificaciones</div>
                <div className="text-sm text-text-secondary">Email sobre nuevos videos</div>
              </div>
              <button className="btn-secondary text-sm">Configurar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}