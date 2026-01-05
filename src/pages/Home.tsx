import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Zap, Trophy, MousePointer2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const difficulties = [
  {
    id: 'easy',
    name: '简单',
    desc: '目标较大，出现速度较慢',
    icon: Target,
    color: 'text-green-500',
    borderColor: 'border-green-500/20 hover:border-green-500',
    bgHover: 'hover:bg-green-500/10',
  },
  {
    id: 'normal',
    name: '普通',
    desc: '标准瓦罗兰特目标大小',
    icon: MousePointer2,
    color: 'text-yellow-500',
    borderColor: 'border-yellow-500/20 hover:border-yellow-500',
    bgHover: 'hover:bg-yellow-500/10',
  },
  {
    id: 'hard',
    name: '困难',
    desc: '极小目标，极快速度',
    icon: Zap,
    color: 'text-red-500',
    borderColor: 'border-red-500/20 hover:border-red-500',
    bgHover: 'hover:bg-red-500/10',
  },
] as const;

const Home = () => {
  const navigate = useNavigate();
  const { setDifficulty, difficulty: currentDifficulty } = useStore();

  const handleStart = () => {
    navigate('/game');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
          VALORANT REFLEX
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          像职业选手一样训练。测试并提升你的反应速度和瞄准精度。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4"
      >
        {difficulties.map((diff) => {
          const Icon = diff.icon;
          const isSelected = currentDifficulty === diff.id;
          
          return (
            <motion.button
              key={diff.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDifficulty(diff.id)}
              className={`
                relative p-8 rounded-2xl border-2 transition-all duration-300 text-left group
                ${isSelected ? `bg-zinc-900 ${diff.borderColor.split(' ')[2]}` : `bg-black ${diff.borderColor} ${diff.bgHover}`}
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId="selected-ring"
                  className="absolute inset-0 border-2 rounded-2xl border-current opacity-100"
                  style={{ color: 'inherit' }}
                />
              )}
              
              <Icon className={`w-10 h-10 mb-4 ${diff.color}`} />
              <h3 className="text-2xl font-bold mb-2">{diff.name}</h3>
              <p className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {diff.desc}
              </p>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleStart}
          className="px-12 py-6 text-2xl font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.7)] transition-all duration-300 transform hover:-translate-y-1"
        >
          开始训练
        </button>
      </motion.div>

      <div className="flex items-center space-x-8 text-zinc-500 text-sm">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>精准度训练</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>反应速度</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4" />
          <span>全球排名</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
