'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Shield, Swords, AlertTriangle, Clock, Users, CheckCircle, Calendar, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    { 
      rank: 1, 
      name: 'Obiora "The Bull" Nnamdi', 
      avatar: '👑', 
      growth: '+47.8%', 
      prize: '$5,000',
      month: 'December 2025',
      startEquity: 10000,
      finalEquity: 14780
    },
    { 
      rank: 2, 
      name: 'Amina "Swift Hands" Bello', 
      avatar: '🥈', 
      growth: '+39.2%', 
      prize: '$3,000',
      month: 'December 2025',
      startEquity: 12000,
      finalEquity: 16704
    },
    { 
      rank: 3, 
      name: 'Chinedu "The Strategist" Okafor', 
      avatar: '🥉', 
      growth: '+34.5%', 
      prize: '$2,000',
      month: 'December 2025',
      startEquity: 8500,
      finalEquity: 11432
    }
  ];
  useEffect(() => {
  fetchTraders();
}, []);

  const [liveTraders, setLiveTraders] = useState([
    { id: 1, name: 'Ade Thunder', email: 'ade@example.com', startEquity: 10000, currentEquity: 12850, avatar: '⚔️', isConnected: true },
    { id: 2, name: 'Chidi Wolf', email: 'chidi@example.com', startEquity: 8500, currentEquity: 10455, avatar: '🐺', isConnected: true },
    { id: 3, name: 'Ngozi Lion', email: 'ngozi@example.com', startEquity: 15000, currentEquity: 17400, avatar: '🦁', isConnected: true },
    { id: 4, name: 'Emeka Dragon', email: 'emeka@example.com', startEquity: 12000, currentEquity: 13320, avatar: '🐉', isConnected: true },
    { id: 5, name: 'Funmi Hawk', email: 'funmi@example.com', startEquity: 9000, currentEquity: 9990, avatar: '🦅', isConnected: true },
  ]);

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
        console.log('🔴 UNDEPLOY TRIGGERED: MetaApi accounts undeployed at 21:05 WAT');
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
    const { data, error } = await supabase
      .from('traders')
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const { data, error } = await supabase
      .from('traders')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          broker_server: formData.brokerServer,
          login_id: formData.loginId,
          investor_password: formData.investorPassword
        }
      ])
      .select();

    if (error) throw error;

    alert('✅ Registration successful! You will receive a confirmation email shortly.');
    
    setFormData({
      name: '',
      email: '',
      brokerServer: '',
      loginId: '',
      investorPassword: ''
    });
    setShowRegistrationForm(false);
    
    // Refresh the registered traders list
    fetchTraders();
  } catch (error) {
    console.error('Error registering trader:', error);
    alert('❌ Registration failed. Please try again.');
  }
};

  if (currentPage === 'registration') {
    return (
      <div className="min-h-screen bg-black text-gray-100 font-sans">
        <div className="relative overflow-hidden border-b-2 border-yellow-600/30">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              {heroImage && (
                <div className="flex justify-center mb-8">
                  <img 
                    src={heroImage} 
                    alt="Game of Bots" 
                    className="w-full max-w-4xl h-auto rounded-lg shadow-2xl shadow-yellow-600/30 border-2 border-yellow-600/20"
                  />
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
                <button
                  onClick={() => setShowRules(true)}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border-2 border-yellow-600 text-yellow-500 font-bold rounded-lg transition-all transform hover:scale-105"
                >
                  ⚔️ Rules of Engagement
                </button>
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-yellow-600/50 flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Register for Competition
                </button>
                <button
                  onClick={() => setCurrentPage('competition')}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-600/50 flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  View Live Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h2 className="text-4xl font-bold text-yellow-500">Hall of Fame</h2>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-400 text-lg">December 2025 Champions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {lastMonthWinners.map((winner, index) => {
              const bgColors = ['from-yellow-600/30 via-yellow-900/20', 'from-gray-400/30 via-gray-600/20', 'from-orange-600/30 via-orange-900/20'];
              const borderColors = ['border-yellow-500', 'border-gray-400', 'border-orange-600'];
              const glowColors = ['shadow-yellow-500/50', 'shadow-gray-400/50', 'shadow-orange-600/50'];
              const textColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];
              
              return (
                <div key={winner.rank} className={`relative bg-gradient-to-b ${bgColors[index]} to-black border-4 ${borderColors[index]} rounded-xl p-8 text-center transform hover:scale-105 transition-all shadow-2xl ${glowColors[index]}`}>
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 ${borderColors[index]} bg-black flex items-center justify-center ${glowColors[index]} shadow-xl`}>
                    <span className="text-3xl">{winner.avatar}</span>
                  </div>
                  
                  <div className="mt-8">
                    <div className={`text-sm font-bold ${textColors[index]} mb-2`}>
                      {winner.rank === 1 ? '🏆 CHAMPION' : winner.rank === 2 ? '🥈 2ND PLACE' : '🥉 3RD PLACE'}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{winner.name}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-xs text-gray-500 mb-1">Growth</div>
                        <div className={`text-3xl font-bold ${textColors[index]}`}>{winner.growth}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
                          <div className="text-xs text-gray-500 mb-1">Started</div>
                          <div className="text-sm font-semibold text-gray-300">${winner.startEquity.toLocaleString()}</div>
                        </div>
                        <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
                          <div className="text-xs text-gray-500 mb-1">Ended</div>
                          <div className="text-sm font-semibold text-green-400">${winner.finalEquity.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${bgColors[index]} border-2 ${borderColors[index]} rounded-full font-bold text-lg ${textColors[index]}`}>
                      <Trophy className="w-5 h-5" />
                      Prize: {winner.prize}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-yellow-600/30 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-yellow-500 mb-2">24</div>
                <div className="text-sm text-gray-400">Total Competitors</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-500 mb-2">$10K</div>
                <div className="text-sm text-gray-400">Total Prize Pool</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500 mb-2">21hrs</div>
                <div className="text-sm text-gray-400">Battle Duration</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-500 mb-2">47.8%</div>
                <div className="text-sm text-gray-400">Highest Growth</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-yellow-500">Registered Warriors</h2>
            </div>
            <div className="text-lg font-bold text-gray-400">
              {registeredTraders.length} Traders Registered
            </div>
          </div>

          {registeredTraders.length === 0 ? (
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-12 text-center">
              <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No warriors have joined yet. Be the first to register!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredTraders.map((trader) => (
                <div key={trader.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-yellow-600/50 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{trader.avatar}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-100">{trader.name}</div>
                      <div className="text-sm text-gray-500">{trader.email}</div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-xs text-gray-600 border-t border-gray-800 pt-3">
                    Broker: {trader.brokerServer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-900/20 to-black border-2 border-yellow-600/30 rounded-lg p-6">
              <Clock className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-yellow-500 mb-2">Competition Hours</h3>
              <p className="text-gray-400">12:00 AM - 9:00 PM WAT</p>
              <p className="text-sm text-gray-500 mt-2">21 hours of intense trading</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/20 to-black border-2 border-green-600/30 rounded-lg p-6">
              <Trophy className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-green-500 mb-2">Top 3 Win Prizes</h3>
              <p className="text-gray-400">Based on % Growth</p>
              <p className="text-sm text-gray-500 mt-2">Gold, Silver, Bronze awards</p>
            </div>
            <div className="bg-gradient-to-br from-red-900/20 to-black border-2 border-red-600/30 rounded-lg p-6">
              <Shield className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-500 mb-2">Investor Password Only</h3>
              <p className="text-gray-400">Read-only access required</p>
              <p className="text-sm text-gray-500 mt-2">Master passwords disqualified</p>
            </div>
          </div>
        </div>

        {showRegistrationForm && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowRegistrationForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-yellow-500 mb-6">🛡️ Register for Battle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:border-yellow-600 focus:outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:border-yellow-600 focus:outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Broker Server</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., MetaQuotes-Demo"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:border-yellow-600 focus:outline-none"
                    value={formData.brokerServer}
                    onChange={(e) => setFormData({...formData, brokerServer: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Login ID</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:border-yellow-600 focus:outline-none"
                    value={formData.loginId}
                    onChange={(e) => setFormData({...formData, loginId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Investor Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-red-700 rounded text-gray-100 focus:border-red-600 focus:outline-none"
                    value={formData.investorPassword}
                    onChange={(e) => setFormData({...formData, investorPassword: e.target.value})}
                  />
                  <div className="mt-2 flex items-start gap-2 text-xs text-red-500">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Enter <strong>Investor Password ONLY</strong>. Master passwords will be disqualified.</span>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-yellow-600/50"
                >
                  ⚔️ Complete Registration
                </button>
              </div>
            </div>
          </div>
        )}

        {showRules && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowRules(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              <h3 className="text-3xl font-bold text-yellow-500 mb-6 flex items-center gap-3">
                <Swords className="w-8 h-8" />
                Rules of Engagement
              </h3>
              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-800/50 p-4 rounded border-l-4 border-yellow-600">
                  <strong className="text-yellow-500">1. Time:</strong> Competition runs strictly from <strong>12:00 AM to 9:00 PM</strong> (Lagos Time, WAT GMT+1).
                </div>
                <div className="bg-gray-800/50 p-4 rounded border-l-4 border-yellow-600">
                  <strong className="text-yellow-500">2. Metric:</strong> Winners are decided by <strong>Highest Percentage Growth (%)</strong>.
                </div>
                <div className="bg-gray-800/50 p-4 rounded border-l-4 border-red-600">
                  <strong className="text-red-500">3. Safety:</strong> ONLY <strong>Investor Passwords (Read-Only)</strong> are allowed. Master passwords are disqualified.
                </div>
                <div className="bg-gray-800/50 p-4 rounded border-l-4 border-yellow-600">
                  <strong className="text-yellow-500">4. Prizes:</strong> Awards given to <strong>1st, 2nd, and 3rd place</strong>.
                </div>
                <div className="bg-gray-800/50 p-4 rounded border-l-4 border-yellow-600">
                  <strong className="text-yellow-500">5. Fairness:</strong> Accounts must remain <strong>connected for the full duration</strong> to qualify.
                </div>
                <div className="bg-purple-900/30 p-4 rounded border-l-4 border-purple-600 mt-6">
                  <strong className="text-purple-400">⚡ Cost-Saving Kill Switch:</strong> At <strong>9:05 PM WAT</strong>, all MetaApi accounts are automatically undeployed to stop billing.
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="border-t border-gray-800 mt-12 py-8 text-center text-gray-500 text-sm">
          <p>🏆 Game of Bots © 2026 | Powered by MetaApi.cloud</p>
          <p className="mt-2">Lagos, Nigeria • WAT (GMT+1)</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      <div className="relative overflow-hidden border-b-2 border-yellow-600/30">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 via-black to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              GAME OF BOTS
            </h1>
            <p className="text-lg text-gray-400 mb-2">Live Competition Dashboard</p>
            
            {!isCompetitionActive && (
              <div className="mb-6 max-w-2xl mx-auto">
                <div className="bg-blue-600/20 border-2 border-blue-500 rounded-lg p-4">
                  <p className="text-blue-400 font-semibold mb-2">⏰ Competition Not Active</p>
                  <p className="text-sm text-gray-300">The live leaderboard will update during competition hours (12:00 AM - 9:00 PM WAT). Below is a preview of registered participants.</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-center items-center gap-4 mb-6">
              <Clock className="w-8 h-8 text-yellow-500"
                />
              <div className="text-3xl font-bold text-yellow-500">
                {timeRemaining}
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <div className={`px-6 py-2 rounded-full border-2 ${isCompetitionActive ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}`}>
                <span className="font-semibold">{isCompetitionActive ? '🟢 BATTLE IN PROGRESS' : '🔴 BATTLE NOT ACTIVE'}</span>
              </div>
              {undeployTriggered && (
                <div className="px-6 py-2 rounded-full border-2 border-purple-500 bg-purple-500/20">
                  <span className="font-semibold">⚡ UNDEPLOY TRIGGERED</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentPage('registration')}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-all text-sm"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-yellow-500">
              {isCompetitionActive ? 'Live Leaderboard' : 'Registered Participants'}
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            Lagos Time: {getLagosTime().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WAT
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b-2 border-yellow-600/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">Warrior</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">Starting Gold</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">Current Gold</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">Growth %</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-yellow-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedTraders.map((trader, index) => (
                  <tr key={trader.id} className={`${getRankStyle(index)} transition-all hover:bg-gray-800/50`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{trader.avatar}</span>
                        <span className="font-semibold text-gray-100">{trader.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400">
                      ${trader.startEquity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-100">
                      ${trader.currentEquity.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-bold text-lg ${parseFloat(trader.growth) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {parseFloat(trader.growth) > 0 ? '+' : ''}{trader.growth}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${trader.isConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${trader.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {trader.isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedTraders.slice(0, 3).map((trader, index) => {
            const titles = ['👑 CHAMPION', '🥈 SILVER WARRIOR', '🥉 BRONZE FIGHTER'];
            const bgColors = ['from-yellow-900/30', 'from-gray-600/30', 'from-orange-900/30'];
            const borderColors = ['border-yellow-600', 'border-gray-400', 'border-orange-600'];
            const textColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];
            return (
              <div key={trader.id} className={`bg-gradient-to-b ${bgColors[index]} to-black border-2 ${borderColors[index]} rounded-lg p-6 text-center transform hover:scale-105 transition-all`}>
                <div className="text-4xl mb-3">{trader.avatar}</div>
                <div className={`${textColors[index]} font-bold text-sm mb-2`}>{titles[index]}</div>
                <div className="text-xl font-bold text-gray-100 mb-2">{trader.name}</div>
                <div className={`text-3xl font-bold ${textColors[index]}`}>+{trader.growth}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-gray-800 mt-12 py-8 text-center text-gray-500 text-sm">
        <p>🏆 Game of Bots © 2026 | Powered by MetaApi.cloud</p>
        <p className="mt-2">Lagos, Nigeria • WAT (GMT+1)</p>
      </footer>
    </div>
  );
}
    
