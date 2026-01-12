'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Shield, Swords, AlertTriangle, Clock, Users, CheckCircle, Calendar, UserPlus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LAGOS_TZ_OFFSET = 1;
const COMPETITION_START_HOUR = 0;
const COMPETITION_END_HOUR = 21;
const UNDEPLOY_HOUR = 21;
const UNDEPLOY_MINUTE = 5;

const getLagosTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * LAGOS_TZ_OFFSET));
};

export default function GameOfBots() {
  const [currentPage, setCurrentPage] = useState('registration');
  const [showRules, setShowRules] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isCompetitionActive, setIsCompetitionActive] = useState(false);
  const [undeployTriggered, setUndeployTriggered] = useState(false);
  const [registeredTraders, setRegisteredTraders] = useState<any[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    brokerServer: '',
    loginId: '',
    investorPassword: ''
  });

  const heroImage = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop';

  const lastMonthWinners = [
    { rank: 1, name: 'Obiora "The Bull" Nnamdi', avatar: '👑', growth: '+47.8%', prize: '$5,000', month: 'December 2025', startEquity: 10000, finalEquity: 14780 },
    { rank: 2, name: 'Amina "Swift Hands" Bello', avatar: '🥈', growth: '+39.2%', prize: '$3,000', month: 'December 2025', startEquity: 12000, finalEquity: 16704 },
    { rank: 3, name: 'Chinedu "The Strategist" Okafor', avatar: '🥉', growth: '+34.5%', prize: '$2,000', month: 'December 2025', startEquity: 8500, finalEquity: 11432 }
  ];

  const [liveTraders, setLiveTraders] = useState([
    { id: 1, name: 'Ade Thunder', email: 'ade@example.com', startEquity: 10000, currentEquity: 12850, avatar: '⚔️', isConnected: true },
    { id: 2, name: 'Chidi Wolf', email: 'chidi@example.com', startEquity: 8500, currentEquity: 10455, avatar: '🐺', isConnected: true },
    { id: 3, name: 'Ngozi Lion', email: 'ngozi@example.com', startEquity: 15000, currentEquity: 17400, avatar: '🦁', isConnected: true },
    { id: 4, name: 'Emeka Dragon', email: 'emeka@example.com', startEquity: 12000, currentEquity: 13320, avatar: '🐉', isConnected: true },
    { id: 5, name: 'Funmi Hawk', email: 'funmi@example.com', startEquity: 9000, currentEquity: 9990, avatar: '🦅', isConnected: true },
  ]);

  useEffect(() => {
    fetchTraders();
  }, []);

  useEffect(() => {
    if (!isCompetitionActive) return;
    const interval = setInterval(() => {
      setLiveTraders(prev => prev.map(trader => ({
        ...trader,
        currentEquity: trader.currentEquity + (Math.random() - 0.48) * 100
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, [isCompetitionActive]);

  const sortedTraders = [...liveTraders]
    .map(trader => ({
      ...trader,
      growth: ((trader.currentEquity - trader.startEquity) / trader.startEquity * 100).toFixed(2)
    }))
    .sort((a, b) => parseFloat(b.growth) - parseFloat(a.growth));

  useEffect(() => {
    const updateTimer = () => {
      const lagosDate = getLagosTime();
      const currentHour = lagosDate.getHours();
      const currentMinute = lagosDate.getMinutes();
      const isActive = currentHour >= COMPETITION_START_HOUR && currentHour < COMPETITION_END_HOUR;
      
      setIsCompetitionActive(isActive);
      
      if (currentHour === UNDEPLOY_HOUR && currentMinute >= UNDEPLOY_MINUTE && !undeployTriggered) {
        setUndeployTriggered(true);
      }
      
      if (currentHour >= COMPETITION_END_HOUR) {
        setTimeRemaining('The Battle is Over. Hail the Champions.');
        return;
      }
      
      const endTime = new Date(lagosDate);
      endTime.setHours(COMPETITION_END_HOUR, 0, 0, 0);
      const secondsLeft = Math.floor((endTime.getTime() - lagosDate.getTime()) / 1000);
      
      if (secondsLeft <= 0) {
        setTimeRemaining('The Battle is Over. Hail the Champions.');
      } else {
        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [undeployTriggered, currentPage]);

  const fetchTraders = async () => {
    try {
      const { data, error } = await supabase
        .from('traders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegisteredTraders(data || []);
    } catch (error) {
      console.error('Error fetching traders:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('traders')
        .insert([{
          name: formData.name,
          email: formData.email,
          broker_server: formData.brokerServer,
          login_id: formData.loginId,
          investor_password: formData.investorPassword
        }]);

      if (error) throw error;

      alert('✅ Registration successful!');
      setFormData({ name: '', email: '', brokerServer: '', loginId: '', investorPassword: '' });
      setShowRegistrationForm(false);
      fetchTraders();
    } catch (error) {
      console.error('Error registering trader:', error);
      alert('❌ Registration failed.');
    }
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/50';
    if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-l-4 border-gray-400 shadow-lg shadow-gray-400/50';
    if (index === 2) return 'bg-gradient-to-r from-orange-600/20 to-orange-900/20 border-l-4 border-orange-600 shadow-lg shadow-orange-600/50';
    return 'bg-gray-900/50 border-l-4 border-transparent';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Shield className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Trophy className="w-6 h-6 text-orange-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500">{index + 1}</span>;
  };

  if (currentPage === 'registration') {
    return (
      <div className="min-h-screen bg-black text-gray-100 font-sans">
        <div className="relative overflow-hidden border-b-2 border-yellow-600/30">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            {heroImage && (
              <div className="flex justify-center mb-8">
                <img src={heroImage} alt="Game of Bots" className="w-full max-w-4xl h-auto rounded-lg shadow-2xl border-2 border-yellow-600/20" />
              </div>
            )}
            
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600/20 border-2 border-blue-500 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div className="text-left">
                  <div className="text-sm text-blue-400 font-semibold">REGISTRATION OPEN</div>
                  <div className="text-xs text-gray-400">Competition starts at 12:00 AM WAT</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-8">
              Current Lagos Time: {getLagosTime().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WAT
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={() => setShowRules(true)} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border-2 border-yellow-600 text-yellow-500 font-bold rounded-lg transition-all">⚔️ Rules</button>
              <button onClick={() => setShowRegistrationForm(true)} className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg flex items-center gap-2"><UserPlus className="w-5 h-5" /> Register</button>
              <button onClick={() => setCurrentPage('competition')} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center gap-2"><Trophy className="w-5 h-5" /> Live Leaderboard</button>
            </div>
          </div>
        </div>

        {/* Hall of Fame */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8 text-center">
             <h2 className="text-4xl font-bold text-yellow-500">Hall of Fame</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lastMonthWinners.map((winner, index) => (
              <div key={winner.rank} className="bg-gray-900 border border-yellow-600/30 rounded-xl p-8 text-center">
                <span className="text-4xl">{winner.avatar}</span>
                <h3 className="text-2xl font-bold mt-4">{winner.name}</h3>
                <div className="text-yellow-500 text-3xl font-bold mt-2">{winner.growth}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Modal */}
        {showRegistrationForm && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-gray-900 border-2 border-yellow-600 rounded-lg max-w-md w-full p-8 relative">
              <button type="button" onClick={() => setShowRegistrationForm(false)} className="absolute top-4 right-4 text-gray-400 text-2xl">×</button>
              <h3 className="text-2xl font-bold text-yellow-500 mb-6">Register</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Name" required className="w-full p-2 bg-gray-800 rounded" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email" required className="w-full p-2 bg-gray-800 rounded" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="Broker Server" required className="w-full p-2 bg-gray-800 rounded" value={formData.brokerServer} onChange={(e) => setFormData({...formData, brokerServer: e.target.value})} />
                <input type="text" placeholder="Login ID" required className="w-full p-2 bg-gray-800 rounded" value={formData.loginId} onChange={(e) => setFormData({...formData, loginId: e.target.value})} />
                <input type="password" placeholder="Investor Password" required className="w-full p-2 bg-gray-800 rounded border border-red-900" value={formData.investorPassword} onChange={(e) => setFormData({...formData, investorPassword: e.target.value})} />
                <button type="submit" className="w-full py-3 bg-yellow-600 text-black font-bold rounded">Complete Registration</button>
              </div>
            </form>
          </div>
        )}

        {/* Rules Modal */}
        {showRules && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg max-w-2xl w-full p-8 relative">
              <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 text-2xl">×</button>
              <h3 className="text-3xl font-bold text-yellow-500 mb-6 flex items-center gap-3"><Swords /> Rules</h3>
              <div className="space-y-4 text-gray-300">
                <p>1. 12:00 AM - 9:00 PM WAT.</p>
                <p>2. Winners based on % Growth.</p>
                <p className="text-red-400">3. Investor Password ONLY.</p>
              </div>
            </div>
          </div>
        )}

        <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
          <p>🏆 Game of Bots © 2026 | Powered by MetaApi.cloud</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      <div className="relative border-b-2 border-yellow-600/30 py-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">GAME OF BOTS</h1>
        <div className="flex justify-center items-center gap-4 mt-6 text-3xl font-bold text-yellow-500">
          <Clock className="w-8 h-8" /> {timeRemaining}
        </div>
        <button onClick={() => setCurrentPage('registration')} className="mt-6 px-6 py-2 bg-gray-800 rounded text-sm">← Back</button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-yellow-500">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Warrior</th>
                <th className="px-6 py-4 text-right">Growth %</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedTraders.map((trader, index) => (
                <tr key={trader.id} className={getRankStyle(index)}>
                  <td className="px-6 py-4">{getRankIcon(index)}</td>
                  <td className="px-6 py-4 flex items-center gap-2"><span>{trader.avatar}</span>{trader.name}</td>
                  <td className={`px-6 py-4 text-right font-bold ${parseFloat(trader.growth) > 0 ? 'text-green-500' : 'text-red-500'}`}>{trader.growth}%</td>
                  <td className="px-6 py-4 text-center">{trader.isConnected ? '🟢' : '🔴'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>🏆 Game of Bots © 2026</p>
      </footer>
    </div>
  );
}
