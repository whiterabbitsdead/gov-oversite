/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Play, Smartphone } from 'lucide-react';
import { PYTHON_SCRIPT_CODE } from '../data';

export function ScriptViewer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Title Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center">
            <FileCode size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">political_aggregator.py</h3>
            <p className="text-[11px] text-slate-400">Federal Data Pipeline • Python 3 (Termux optimized)</p>
          </div>
        </div>

        <button onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
        {/* Instruction Guide / Sidebar */}
        <div className="lg:col-span-4 p-6 bg-slate-950/30 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Smartphone size={14} />
              Termux Environment Setup
            </h4>

            <ol className="space-y-4 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center font-mono font-bold text-indigo-400 shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white">Install packages in Termux</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Open Termux and run dependencies installer:</p>
                  <pre className="bg-slate-950/80 p-1.5 rounded border border-slate-850 font-mono text-[10px] text-indigo-300 mt-1 overflow-x-auto">
                    pkg update && pkg install python
                  </pre>
                </div>
              </li>

              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center font-mono font-bold text-indigo-400 shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white">Save script to directory</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Paste or pull the code into a file:</p>
                  <pre className="bg-slate-950/80 p-1.5 rounded border border-slate-850 font-mono text-[10px] text-indigo-300 mt-1 overflow-x-auto">
                    nano political_aggregator.py
                  </pre>
                </div>
              </li>

              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center font-mono font-bold text-indigo-400 shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white">Run the aggregator</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use keys or execute with safe fallback:</p>
                  <pre className="bg-slate-950/80 p-1.5 rounded border border-slate-850 font-mono text-[10px] text-indigo-300 mt-1 overflow-x-auto">
                    python political_aggregator.py --dry-run
                  </pre>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-850/60 text-xs">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Terminal size={14} className="text-emerald-400" />
              API Key Flags
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When you obtain official API keys from <span className="text-slate-300">OpenFEC</span> or <span className="text-slate-300">Congress.gov</span>, supply them as argument parameters:
            </p>
            <pre className="bg-slate-950/80 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-amber-300/90 mt-2 overflow-x-auto leading-relaxed">
              python political_aggregator.py \<br />
              &nbsp;&nbsp;--fec-key YOUR_FEC_API_KEY \<br />
              &nbsp;&nbsp;--congress-key YOUR_CONGRESS_API_KEY
            </pre>
          </div>
        </div>

        {/* Code Content Editor box */}
        <div className="lg:col-span-8 bg-slate-950/10 p-4 max-h-[480px] overflow-y-auto font-mono text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-500 mb-3 border-b border-slate-850 pb-2">
            <Play size={12} />
            <span>PYTHON PIPELINE SOURCE (100% Zero-Dependency Urllib Implementation)</span>
          </div>
          <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-indigo-200">
            {PYTHON_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
}
