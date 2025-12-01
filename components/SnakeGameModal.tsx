
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GRID_SIZE = 20;
const SPEED = 100;

type Point = { x: number; y: number };

const SnakeGameModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addAICredits } = useStore();
  
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 }); // Moving Up
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [earnedCredits, setEarnedCredits] = useState(0);

  // Rewards: 1 credit per 50 points
  const REWARD_THRESHOLD = 50;

  useEffect(() => {
    if (!isPlaying) return;

    const moveSnake = () => {
        setSnake(prevSnake => {
            const head = { ...prevSnake[0] };
            head.x += direction.x;
            head.y += direction.y;

            // Collision with walls
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                handleGameOver();
                return prevSnake;
            }

            // Collision with self
            if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                handleGameOver();
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // Eat Food
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                spawnFood(newSnake);
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    };

    const gameInterval = setInterval(moveSnake, SPEED);
    return () => clearInterval(gameInterval);
  }, [isPlaying, direction, food]);

  // Handle Rewards
  useEffect(() => {
    if (score > 0 && score % REWARD_THRESHOLD === 0) {
        const reward = score / REWARD_THRESHOLD;
        if (reward > earnedCredits) {
             addAICredits(1);
             setEarnedCredits(reward);
        }
    }
  }, [score]);

  // Handle Input
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          switch(e.key) {
              case 'ArrowUp': if(direction.y === 0) setDirection({x:0, y:-1}); break;
              case 'ArrowDown': if(direction.y === 0) setDirection({x:0, y:1}); break;
              case 'ArrowLeft': if(direction.x === 0) setDirection({x:-1, y:0}); break;
              case 'ArrowRight': if(direction.x === 0) setDirection({x:1, y:0}); break;
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Draw Game
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cellSize = canvas.width / GRID_SIZE;

      // Clear
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid (Cyberpunk style)
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for(let i=0; i<=GRID_SIZE; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cellSize, 0);
          ctx.lineTo(i * cellSize, canvas.height);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * cellSize);
          ctx.lineTo(canvas.width, i * cellSize);
          ctx.stroke();
      }

      // Draw Food (Glowing Data Packet)
      ctx.fillStyle = '#ff0055';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0055';
      ctx.beginPath();
      ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Snake (Neon Stream)
      snake.forEach((segment, index) => {
          ctx.fillStyle = index === 0 ? '#fff' : '#00f3ff';
          ctx.shadowBlur = index === 0 ? 20 : 10;
          ctx.shadowColor = '#00f3ff';
          ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
      });
      ctx.shadowBlur = 0;

  }, [snake, food]);

  const spawnFood = (currentSnake: Point[]) => {
      let newFood;
      while(true) {
          newFood = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE)
          };
          if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
      }
      setFood(newFood);
  };

  const handleGameOver = () => {
      setGameOver(true);
      setIsPlaying(false);
      if (score > highScore) setHighScore(score);
  };

  const resetGame = () => {
      setSnake([{ x: 10, y: 10 }]);
      setDirection({ x: 0, y: -1 });
      setScore(0);
      setEarnedCredits(0);
      setGameOver(false);
      setIsPlaying(true);
      spawnFood([{ x: 10, y: 10 }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[#09090b] border border-neon-blue/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden flex flex-col items-center p-6 w-full max-w-lg"
      >
        {/* Header */}
        <div className="w-full flex justify-between items-start mb-4">
             <div>
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <span className="text-neon-blue">DATA</span> STREAM
                 </h2>
                 <p className="text-xs text-gray-500 font-mono">COLLECT PACKETS // EARN CREDITS</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                 <X size={24} className="text-gray-400" />
             </button>
        </div>

        {/* Stats */}
        <div className="w-full flex justify-between items-center mb-4 bg-white/5 rounded-xl p-3 border border-white/5">
             <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest">Score</span>
                 <span className="text-xl font-mono font-bold text-white">{score}</span>
             </div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest">Credits Earned</span>
                 <div className="flex items-center gap-1 text-neon-purple font-bold">
                     <Sparkles size={14} />
                     <span>{Math.floor(score / REWARD_THRESHOLD)}</span>
                 </div>
             </div>
        </div>

        {/* Game Canvas */}
        <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black">
             <canvas 
                ref={canvasRef} 
                width={400} 
                height={400} 
                className="block w-full h-auto max-w-[400px] aspect-square"
            />
             
             {/* Overlays */}
             {!isPlaying && !gameOver && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                     <button 
                        onClick={() => setIsPlaying(true)}
                        className="flex items-center gap-2 px-8 py-3 bg-neon-blue text-black font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                         <Play fill="currentColor" /> START
                     </button>
                     <p className="mt-4 text-xs text-gray-400 font-mono">Use Arrow Keys to Move</p>
                 </div>
             )}

             {gameOver && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                     <h3 className="text-3xl font-bold text-red-500 mb-2">SYSTEM CRASH</h3>
                     <p className="text-gray-400 mb-6 font-mono">Final Score: {score}</p>
                     <button 
                        onClick={resetGame}
                        className="flex items-center gap-2 px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                         <RotateCcw size={18} /> REBOOT
                     </button>
                 </div>
             )}
        </div>

        {/* Mobile Controls (Only visible on small screens) */}
        <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
             <div />
             <button onClick={() => direction.y === 0 && setDirection({x:0, y:-1})} className="p-4 bg-white/5 rounded-lg active:bg-neon-blue/20 flex justify-center"><Play size={20} className="-rotate-90" /></button>
             <div />
             <button onClick={() => direction.x === 0 && setDirection({x:-1, y:0})} className="p-4 bg-white/5 rounded-lg active:bg-neon-blue/20 flex justify-center"><Play size={20} className="rotate-180" /></button>
             <button onClick={() => direction.y === 0 && setDirection({x:0, y:1})} className="p-4 bg-white/5 rounded-lg active:bg-neon-blue/20 flex justify-center"><Play size={20} className="rotate-90" /></button>
             <button onClick={() => direction.x === 0 && setDirection({x:1, y:0})} className="p-4 bg-white/5 rounded-lg active:bg-neon-blue/20 flex justify-center"><Play size={20} /></button>
        </div>

      </motion.div>
    </div>
  );
};

export default SnakeGameModal;