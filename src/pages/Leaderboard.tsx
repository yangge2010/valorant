import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, User } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  best_reaction_time: number;
  average_accuracy: number;
  users: {
    username: string;
  };
}

const Leaderboard = () => {
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          id,
          best_reaction_time,
          average_accuracy,
          users (
            username
          )
        `)
        .eq('difficulty', difficulty)
        .order('best_reaction_time', { ascending: true })
        .limit(50);

      if (!error && data) {
        setEntries(data as any);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [difficulty]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="text-yellow-500 w-8 h-8" />
          全球排行榜
        </h1>
        
        <div className="flex bg-zinc-900 rounded-lg p-1 mt-4 md:mt-0">
          {(['easy', 'normal', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                difficulty === diff 
                  ? 'bg-zinc-700 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {diff === 'easy' ? '简单' : diff === 'normal' ? '普通' : '困难'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-6 py-4 text-zinc-400 font-medium w-24">排名</th>
                <th className="px-6 py-4 text-zinc-400 font-medium">玩家</th>
                <th className="px-6 py-4 text-zinc-400 font-medium text-right">反应时间</th>
                <th className="px-6 py-4 text-zinc-400 font-medium text-right">准确率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    加载中...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    暂无数据，快来挑战吧！
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {index === 0 ? (
                        <Medal className="w-6 h-6 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-zinc-400" />
                      ) : index === 2 ? (
                        <Medal className="w-6 h-6 text-amber-600" />
                      ) : (
                        <span className="text-zinc-500 font-mono ml-1">#{index + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="font-medium">{entry.users?.username || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-red-400 font-bold">
                      {entry.best_reaction_time}ms
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-400">
                      {entry.average_accuracy}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
