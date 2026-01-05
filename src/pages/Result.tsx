import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCcw, Home as HomeIcon, Share2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

const Result = () => {
  const navigate = useNavigate();
  const { lastResult, user } = useStore();

  useEffect(() => {
    if (!lastResult) {
      navigate('/');
      return;
    }

    // Save result if user is logged in
    const saveResult = async () => {
      if (user) {
        try {
          await supabase.from('test_results').insert({
            user_id: user.id,
            reaction_time: lastResult.reactionTime,
            accuracy: lastResult.accuracy,
            difficulty: lastResult.difficulty,
            target_hits: lastResult.targetHits,
            total_targets: lastResult.totalTargets,
          });

          // Update leaderboard if better
          // This logic can be handled by a DB trigger or manually here.
          // For simplicity, let's just insert the result. 
          // We can have an upsert for leaderboard table.
          
          const { data: existingBoard } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('user_id', user.id)
            .eq('difficulty', lastResult.difficulty)
            .single();

          if (existingBoard) {
            // Update if better
            if (lastResult.reactionTime < existingBoard.best_reaction_time) {
              await supabase
                .from('leaderboard')
                .update({
                  best_reaction_time: lastResult.reactionTime,
                  average_accuracy: lastResult.accuracy, // This logic is simplified
                  total_tests: existingBoard.total_tests + 1,
                  last_test_at: new Date().toISOString(),
                })
                .eq('id', existingBoard.id);
            } else {
               await supabase
                .from('leaderboard')
                .update({
                  total_tests: existingBoard.total_tests + 1,
                  last_test_at: new Date().toISOString(),
                })
                .eq('id', existingBoard.id);
            }
          } else {
            // Insert new
            await supabase.from('leaderboard').insert({
              user_id: user.id,
              difficulty: lastResult.difficulty,
              best_reaction_time: lastResult.reactionTime,
              average_accuracy: lastResult.accuracy,
              total_tests: 1,
            });
          }

        } catch (error) {
          console.error('Error saving result:', error);
        }
      }
    };

    saveResult();
  }, [lastResult, user, navigate]);

  if (!lastResult) return null;

  const getGrade = (ms: number) => {
    if (ms < 150) return 'S+';
    if (ms < 180) return 'S';
    if (ms < 200) return 'A';
    if (ms < 250) return 'B';
    if (ms < 300) return 'C';
    return 'D';
  };

  const grade = getGrade(lastResult.reactionTime);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <h2 className="text-zinc-400 text-xl uppercase tracking-widest mb-2">平均反应时间</h2>
        <div className="text-8xl font-black text-white mb-4">
          {lastResult.reactionTime}
          <span className="text-4xl text-zinc-500 ml-2">ms</span>
        </div>
        <div className={`text-6xl font-black ${
          grade.startsWith('S') ? 'text-yellow-500' : 
          grade === 'A' ? 'text-green-500' : 'text-zinc-500'
        }`}>
          {grade}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        <div className="card text-center">
          <div className="text-zinc-400 text-sm mb-1">准确率</div>
          <div className="text-2xl font-bold">{lastResult.accuracy}%</div>
        </div>
        <div className="card text-center">
          <div className="text-zinc-400 text-sm mb-1">难度</div>
          <div className="text-2xl font-bold capitalize">{lastResult.difficulty === 'normal' ? '普通' : lastResult.difficulty === 'hard' ? '困难' : '简单'}</div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/game')}
          className="flex items-center space-x-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
        >
          <RefreshCcw className="w-5 h-5" />
          <span>再试一次</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
        >
          <HomeIcon className="w-5 h-5" />
          <span>返回首页</span>
        </button>
      </div>

      {!user && (
        <p className="text-zinc-500 text-sm mt-4">
          <span className="text-red-500 cursor-pointer hover:underline" onClick={() => navigate('/login')}>登录</span> 保存你的成绩并查看排名
        </p>
      )}
    </div>
  );
};

export default Result;
