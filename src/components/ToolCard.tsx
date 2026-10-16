import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Star } from 'lucide-react';
import { ToolItem } from '../types';
import { ToolIcon } from './ToolIcon';

interface ToolCardProps {
  tool: ToolItem;
  featured?: boolean;
  onCopyLink: (url: string, name: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  featured = false,
  onCopyLink,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(tool.url);
    setCopied(true);
    onCopyLink(tool.url, tool.name);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract hostname for clean URL display
  let displayDomain = tool.url;
  try {
    const urlObj = new URL(tool.url);
    displayDomain = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
  } catch {
    displayDomain = tool.url.replace(/^https?:\/\//, '');
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl bg-white border transition-all duration-200 hover:shadow-md ${
        featured
          ? 'border-blue-200/90 shadow-xs ring-1 ring-blue-100 p-5'
          : 'border-slate-200/90 p-4'
      }`}
    >
      <div>
        {/* Top bar inside card: Icon + Unboxed Metadata + Copy Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <ToolIcon
              imageUrl={tool.imageUrl}
              iconKey={tool.iconKey}
              toolName={tool.name}
              category={tool.category}
              size={featured ? 'md' : 'sm'}
            />
            <div>
              {/* Zero-Pill unboxed metadata */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>{tool.category}</span>
                {tool.isPinned && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-amber-600 flex items-center gap-0.5">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      Destaque
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1">
                {tool.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title={`Copiar link de ${tool.name}`}
            aria-label={`Copiar link de ${tool.name}`}
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Tool Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Bottom Area: Destination domain + Primary Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <span
          className="text-xs text-slate-600 font-mono truncate max-w-[170px]"
          title={tool.url}
        >
          {displayDomain}
        </span>

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 hover:text-blue-950 active:bg-blue-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0"
          aria-label={`Acessar ${tool.name} em nova aba`}
        >
          <span>Acessar</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};
