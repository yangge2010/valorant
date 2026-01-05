import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { User, Clock, Target, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const { user } = useStore();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20); // Last 20 games

      if (data) {
        setStats(data);
      }
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  if (loading) return <div className="text-center py-20">加载中...</div>;

  const chartData = {
    labels: stats.map((_, i) => `Game ${i + 1}`),
    datasets: [
      {
        label: '反应时间 (ms)',
        data: stats.map(s => s.reaction_time),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#fff' }
      },
      title: {
        display: true,
        text: '最近20场表现趋势',
        color: '#fff'
      },
    },
    scales: {
      y: {
        grid: { color: '#333' },
        ticks: { color: '#888' }
      },
      x: {
        grid: { color: '#333' },
        ticks: { color: '#888' }
      }
    }
  };

  const avgTime = stats.length > 0 
    ? Math.round(stats.reduce((a, b) => a + b.reaction_time, 0) / stats.length) 
    : 0;
  
  const bestTime = stats.length > 0 
    ? Math.min(...stats.map(s => s.reaction_time)) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-red-600">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user?.user_metadata?.username || user?.email?.split('@')[0]}</h1>
          <p className="text-zinc-500">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <Activity className="w-5 h-5" />
            <span>平均反应时间</span>
          </div>
          <div className="text-3xl font-bold text-white">{avgTime}ms</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <Clock className="w-5 h-5" />
            <span>最佳记录</span>
          </div>
          <div className="text-3xl font-bold text-green-500">{bestTime}ms</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <Target className="w-5 h-5" />
            <span>总测试次数</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.length}</div>
        </div>
      </div>

      <div className="card">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default Profile;
