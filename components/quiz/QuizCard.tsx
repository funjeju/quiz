'use client';

import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizCardProps {
  question: QuizQuestion;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function QuizCard({ question, onSelect, disabled }: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <Card className="border-2 shadow-sm min-h-[400px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-bold">
              {question.category.toUpperCase()}
            </Badge>
            <div className="text-sm font-medium text-muted-foreground">
              난이도: {'⭐'.repeat(question.difficulty)}
            </div>
          </div>
          <CardTitle className="text-xl md:text-2xl leading-relaxed font-bold text-slate-800">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          {question.options?.map((option, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="w-full h-16 justify-start text-lg px-6 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-slate-700"
              onClick={() => onSelect(option)}
              disabled={disabled}
            >
              {option}
            </Button>
          ))}
          {question.type === 'ox' && (
            <div className="grid grid-cols-2 gap-4 h-32">
              <Button
                variant="outline"
                className="h-full text-4xl font-black text-rose-500 border-2 hover:bg-rose-50 hover:border-rose-500"
                onClick={() => onSelect('O')}
                disabled={disabled}
              >
                O
              </Button>
              <Button
                variant="outline"
                className="h-full text-4xl font-black text-blue-500 border-2 hover:bg-blue-50 hover:border-blue-500"
                onClick={() => onSelect('X')}
                disabled={disabled}
              >
                X
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-4 border-t bg-slate-50/50">
          <p className="text-xs text-muted-foreground w-full text-center">
            정확하고 빠르게 응답할수록 더 많은 점수를 얻습니다!
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
