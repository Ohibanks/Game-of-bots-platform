'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Shield, Swords, AlertTriangle, Clock, Users, CheckCircle, Calendar, UserPlus } from 'lucide-react';

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

const GameOfBots = () => {
  const [currentPage, setCurrentPage] = useState('registration');
  const [showRules, setShowRules] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isCompetitionActive, setIsCompetitionActive] = useState(false);
  const [undeployTriggered, setUndeployTriggered] = useState(false);
  const [registeredTraders, setRegisteredTraders] = useState([]);
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
      
      const secondsLeft = Math.floor((endTime - lagosDate) / 1000);
      
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

  const getRankStyle = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/50';
    if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-l-4 border-gray-400 shadow-lg shadow-gray-400/50';
    if (index === 2) return 'bg-gradient-to-r from-orange-600/20 to-orange-900/20 border-l-4 border-orange-600 shadow-lg shadow-orange-600/50';
    return 'bg-gray-900/50 border-l-4 border-transparent';
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Shield className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Trophy className="w-6 h-6 text-orange-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500">{index + 1}</span>;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTrader = {
      id: Date.now(),
      ...formData,
      avatar: ['⚔️', '🐺', '🦁', '🐉', '🦅', '🐍', '🐆', '🦅', '🐻', '🦅'][Math.floor(Math.random() * 10)],
      registeredAt: new Date().toISOString()
    };
    
    setRegisteredTraders([...registeredTraders, newTrader]);
    setFormData({
      name: '',
      email: '',
      brokerServer: '',
      loginId: '',
      investorPassword: ''
    });
    setShowRegistrationForm(false);
    alert('✅ Registration successful! You will receive a confirmation email shortly.');
  };

  if (currentPage === 'registration') {
    return (
      <div className="min-h-screen bg-black text-gray-100 font-sans">
        <div className="relative overflow-hidden border-b-2 border-yellow-600/30">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              {heroImage ? (
                <div className="flex justify-center mb-8">
                  <img 
                    src={heroImage} 
                    alt="Game of Bots"
