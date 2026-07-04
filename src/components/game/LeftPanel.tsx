import { useEffect, useRef, useState } from 'react';
import { GameState } from '../../types';
import { PieceIcon } from './PieceIcon';
import { ArrowDown } from 'lucide-react';

interface LeftPanelProps {
  gameState: GameState;
}

function parseLog(log: string) {
  const isSuper = log.startsWith('<SUPER>') && log.endsWith('</SUPER>');
  let html = log.replace('<SUPER>', '').replace('</SUPER>', '');
  
  html = html.replace(/<T>(.*?)<\/T>/g, '<span class="text-stone-500 font-bold">$1</span>');
  html = html.replace(/<P>(.*?)<\/P>/g, '<span class="text-blood-400 font-bold">$1</span>');
  html = html.replace(/<A>(.*?)<\/A>/g, '<span class="text-gold-400 font-bold">$1</span>');
  html = html.replace(/<V>(.*?)<\/V>/g, '<span class="text-emerald-400 font-bold">$1</span>');
  html = html.replace(/<S>(.*?)<\/S>/g, '<span class="text-stone-200 bg-stone-800 px-1 rounded-sm">$1</span>');
  
  return { html, isSuper };
}

export function LeftPanel({ gameState }: LeftPanelProps) {
  const { history, graveyard } = gameState;
  const chroniclerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHRONICLER' | 'AI_TACTICIAN'>('CHRONICLER');

  const debugData = typeof window !== 'undefined' ? window.__last_ai_debug__ : undefined;

  const showAiTactician = gameState.isSimulating || gameState.setup?.mode === 'WAR_TABLE';

  useEffect(() => {
    if (!showAiTactician && activeTab === 'AI_TACTICIAN') {
      setActiveTab('CHRONICLER');
    }
  }, [showAiTactician, activeTab]);

  const handleScroll = () => {
    if (chroniclerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chroniclerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 20;
      setIsScrolledUp(!isNearBottom);
    }
  };

  const scrollToBottom = () => {
    if (chroniclerRef.current) {
      chroniclerRef.current.scrollTop = chroniclerRef.current.scrollHeight;
      setIsScrolledUp(false);
    }
  };

  useEffect(() => {
    if (!isScrolledUp && chroniclerRef.current) {
      chroniclerRef.current.scrollTop = chroniclerRef.current.scrollHeight;
    }
  }, [history, isScrolledUp]);

  return (
    <div className="w-full flex flex-col gap-6 h-full font-cinzel">
      
      {/* Chronicler or AI Tactician Tabs */}
      <div className="flex flex-col border border-stone-800 rounded-sm bg-stone-900/50 flex-grow min-h-[300px] overflow-hidden relative">
        {showAiTactician ? (
          <div className="flex border-b border-stone-800 bg-stone-900 flex-shrink-0 select-none">
            <button 
              onClick={() => setActiveTab('CHRONICLER')}
              className={`flex-1 py-3 text-center uppercase tracking-widest text-[10px] font-bold transition-colors border-r border-stone-800 ${activeTab === 'CHRONICLER' ? 'bg-stone-950 text-gold-500' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}
            >
              Chronicler
            </button>
            <button 
              onClick={() => setActiveTab('AI_TACTICIAN')}
              className={`flex-1 py-3 text-center uppercase tracking-widest text-[10px] font-bold transition-colors ${activeTab === 'AI_TACTICIAN' ? 'bg-stone-950 text-gold-500' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}
            >
              AI Tactician (Dev)
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-stone-800 bg-stone-900 uppercase tracking-widest text-sm text-stone-300 flex-shrink-0 select-none">
            Chronicler
          </div>
        )}

        {activeTab === 'CHRONICLER' ? (
          <>
            <div 
              ref={chroniclerRef}
              onScroll={handleScroll}
              className="p-4 flex-grow overflow-y-auto custom-scrollbar font-mono text-xs text-stone-400 space-y-2 min-h-0 relative"
            >
              {history.length === 0 ? (
                <div className="text-stone-600 italic">No records yet.</div>
              ) : (
                history.map((log, idx) => {
                  const { html, isSuper } = parseLog(log);
                  return (
                    <div key={idx} className={`pb-2 last:border-0 ${isSuper ? 'bg-gold-900/20 border-l-2 border-gold-500 p-2 my-2 shadow-[inset_0_0_15px_rgba(234,179,8,0.1)]' : 'border-b border-stone-800/50'}`}>
                      <span dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                  );
                })
              )}
            </div>
            {isScrolledUp && (
              <button 
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 bg-stone-800 border border-stone-700 text-stone-300 p-2 rounded-full shadow-lg hover:bg-stone-700 hover:text-white transition-all z-10 flex items-center justify-center"
                title="Scroll to latest"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex-grow overflow-y-auto custom-scrollbar min-h-0 p-4 space-y-4">
            {!debugData ? (
              <div className="text-stone-600 italic text-xs">
                No AI telemetry recorded yet. An AI player must take a turn to populate these developer logs.
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono text-stone-400">
                {/* Search telemetry */}
                <div className="grid grid-cols-2 gap-2 bg-stone-950/60 p-2 border border-stone-800 rounded">
                  <div>Depth: <span className="text-gold-500 font-bold">{debugData.depth}</span></div>
                  <div>Time: <span className="text-emerald-500 font-bold">{Math.round(debugData.thinkingTimeMs * 10) / 10} ms</span></div>
                  <div className="col-span-2">Nodes: <span className="text-sky-500 font-bold">{debugData.nodesEvaluated.toLocaleString()}</span></div>
                  <div className="col-span-2">Static Score: <span className={`font-bold ${debugData.score >= 0 ? 'text-emerald-500' : 'text-blood-400'}`}>{debugData.score > 0 ? `+${debugData.score}` : debugData.score}</span></div>
                </div>

                {/* Game Phase */}
                {debugData.evaluationBreakdown.phase && (
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-sans font-bold">Current Strategic Phase</div>
                    <div className="bg-stone-950/40 p-2 rounded border border-stone-800/60 flex items-center justify-between">
                      <span className="text-stone-400">Tactical State:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                        debugData.evaluationBreakdown.phase === 'OPENING' 
                          ? 'bg-sky-950/40 border border-sky-800/50 text-sky-400'
                          : debugData.evaluationBreakdown.phase === 'MIDDLEGAME'
                            ? 'bg-amber-950/40 border border-amber-800/50 text-amber-400'
                            : 'bg-red-950/40 border border-red-800/50 text-red-400'
                      }`}>
                        {debugData.evaluationBreakdown.phase}
                      </span>
                    </div>
                  </div>
                )}

                {/* Eval Breakdown */}
                <div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-sans font-bold">Evaluation Breakdown</div>
                  <div className="space-y-1 bg-stone-950/40 p-2 rounded border border-stone-800/60">
                    <div className="flex justify-between">
                      <span>Material:</span>
                      <span className={debugData.evaluationBreakdown.material >= 0 ? 'text-emerald-500' : 'text-blood-400'}>
                        {debugData.evaluationBreakdown.material > 0 ? `+${debugData.evaluationBreakdown.material}` : debugData.evaluationBreakdown.material}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Positional:</span>
                      <span className={debugData.evaluationBreakdown.positional >= 0 ? 'text-emerald-500' : 'text-blood-400'}>
                        {debugData.evaluationBreakdown.positional > 0 ? `+${debugData.evaluationBreakdown.positional}` : debugData.evaluationBreakdown.positional}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>King Safety:</span>
                      <span className={debugData.evaluationBreakdown.kingSafety >= 0 ? 'text-emerald-500' : 'text-blood-400'}>
                        {debugData.evaluationBreakdown.kingSafety > 0 ? `+${debugData.evaluationBreakdown.kingSafety}` : debugData.evaluationBreakdown.kingSafety}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resources:</span>
                      <span className={debugData.evaluationBreakdown.resources >= 0 ? 'text-emerald-500' : 'text-blood-400'}>
                        {debugData.evaluationBreakdown.resources > 0 ? `+${debugData.evaluationBreakdown.resources}` : debugData.evaluationBreakdown.resources}
                      </span>
                    </div>
                    <div className="h-px bg-stone-800/60 my-1" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className={debugData.evaluationBreakdown.total >= 0 ? 'text-emerald-500' : 'text-blood-400'}>
                        {debugData.evaluationBreakdown.total > 0 ? `+${debugData.evaluationBreakdown.total}` : debugData.evaluationBreakdown.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PV Best Sequence */}
                <div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-sans font-bold">Best Predicted Sequence (PV)</div>
                  <div className="bg-stone-950/40 p-2 rounded border border-stone-800/60 space-y-1 text-[10px]">
                    {debugData.pv.length === 0 ? (
                      <span className="text-stone-600 italic">No line predicted (Leaf node).</span>
                    ) : (
                      debugData.pv.map((pvm, index) => (
                        <div key={index} className="flex gap-1.5 items-center">
                          <span className="text-stone-600 font-bold">{index + 1}.</span>
                          <span className="text-stone-300">{pvm}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Top 5 Candidates */}
                <div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-sans font-bold">Top 5 Scored Moves</div>
                  <div className="space-y-1.5">
                    {debugData.topMoves.map((tm, index) => {
                      const actionSymbols = { MOVE: '→', ATTACK: '⚔', ABILITY: '✦', SUPER: '★' };
                      const fromCoords = `(${tm.move.from.r},${tm.move.from.c})`;
                      const toCoords = `(${tm.move.to.r},${tm.move.to.c})`;
                      const isChosen = debugData.chosenMove && 
                                       debugData.chosenMove.from.r === tm.move.from.r && 
                                       debugData.chosenMove.from.c === tm.move.from.c && 
                                       debugData.chosenMove.to.r === tm.move.to.r && 
                                       debugData.chosenMove.to.c === tm.move.to.c &&
                                       debugData.chosenMove.actionType === tm.move.actionType;

                      return (
                        <div key={index} className={`p-2 rounded border transition-colors ${isChosen ? 'bg-gold-950/10 border-gold-600/50' : 'bg-stone-950/30 border-stone-800/60'}`}>
                          <div className="flex justify-between items-center font-bold text-[10px]">
                            <span className={isChosen ? 'text-gold-400' : 'text-stone-300'}>
                              {index + 1}. {tm.move.actionType} {fromCoords} {actionSymbols[tm.move.actionType]} {toCoords}
                            </span>
                            <span className={tm.score >= 0 ? 'text-emerald-500' : 'text-blood-400'}>
                              {tm.score > 0 ? `+${tm.score}` : tm.score}
                            </span>
                          </div>
                          <div className="text-[9px] text-stone-500 font-sans mt-0.5 leading-normal">
                            {tm.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* White Graveyard */}
      <div className="flex flex-col border border-stone-800 rounded-sm bg-stone-900/50">
        <div className="px-4 py-3 border-b border-stone-800 bg-stone-900 uppercase tracking-widest text-sm text-stone-300">
          White Graveyard ({graveyard.WHITE.length})
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {graveyard.WHITE.map((type, idx) => (
            <div key={idx} className="w-8 h-8 opacity-50 grayscale">
              <PieceIcon type={type} color="WHITE" />
            </div>
          ))}
          {graveyard.WHITE.length === 0 && (
            <div className="text-stone-600 text-xs font-mono">None</div>
          )}
        </div>
      </div>

      {/* Black Graveyard */}
      <div className="flex flex-col border border-stone-800 rounded-sm bg-stone-900/50">
        <div className="px-4 py-3 border-b border-stone-800 bg-stone-900 uppercase tracking-widest text-sm text-stone-300">
          Black Graveyard ({graveyard.BLACK.length})
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {graveyard.BLACK.map((type, idx) => (
            <div key={idx} className="w-8 h-8 opacity-50 grayscale">
              <PieceIcon type={type} color="BLACK" />
            </div>
          ))}
          {graveyard.BLACK.length === 0 && (
            <div className="text-stone-600 text-xs font-mono">None</div>
          )}
        </div>
      </div>

    </div>
  );
}
