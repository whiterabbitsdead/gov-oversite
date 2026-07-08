/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Copy, Check, FileJson } from 'lucide-react';
import { CONGRESSIONAL_DATA } from '../data';

export function JsonViewer() {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(CONGRESSIONAL_DATA, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center">
            <FileJson size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">congressional_data.json</h3>
            <p className="text-[11px] text-slate-400">Aggregated JSON Output State • Normalized Schema</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied Feed!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy JSON Feed</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-slate-950 max-h-[400px] overflow-y-auto font-mono text-[11px] text-emerald-300/95 leading-relaxed">
        <pre className="whitespace-pre overflow-x-auto">
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
