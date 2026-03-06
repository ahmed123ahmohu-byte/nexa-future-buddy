import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';

interface CodePreviewProps {
  code: string;
  language: string;
  onClose?: () => void;
}

const CodePreview = ({ code, language, onClose }: CodePreviewProps) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (['html', 'css', 'javascript', 'js', 'jsx', 'react'].includes(language.toLowerCase())) {
      const isFullHtml = code.trim().toLowerCase().startsWith('<!doctype') || code.trim().toLowerCase().startsWith('<html');
      
      if (isFullHtml) {
        setSrcDoc(code);
      } else if (['css'].includes(language.toLowerCase())) {
        setSrcDoc(`<!DOCTYPE html><html><head><style>${code}</style></head><body><div style="padding:20px;color:#e2e8f0;font-family:sans-serif"><p>CSS Preview</p><div class="preview-target">Styled Element</div></body></html>`);
      } else if (['javascript', 'js'].includes(language.toLowerCase())) {
        setSrcDoc(`<!DOCTYPE html><html><head><style>body{background:#0f0f1a;color:#e2e8f0;font-family:sans-serif;padding:20px}pre{white-space:pre-wrap}</style></head><body><pre id="output"></pre><script>
const origLog = console.log;
console.log = (...args) => { document.getElementById('output').textContent += args.join(' ') + '\\n'; };
try { ${code} } catch(e) { document.getElementById('output').textContent = 'Error: ' + e.message; }
</script></body></html>`);
      } else {
        setSrcDoc(`<!DOCTYPE html><html><head><style>body{background:#0f0f1a;color:#e2e8f0;font-family:monospace;padding:20px;margin:0}</style></head><body>${code}</body></html>`);
      }
    } else {
      setSrcDoc(`<!DOCTYPE html><html><head><style>body{background:#0f0f1a;color:#e2e8f0;font-family:monospace;padding:20px;margin:0;white-space:pre-wrap;font-size:13px}</style></head><body>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`);
    }
  }, [code, language]);

  return (
    <motion.div
      className="glass-card overflow-hidden h-full flex flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-glass-border/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-neon-purple/50" />
            <div className="w-3 h-3 rounded-full bg-accent/50" />
          </div>
          <span className="text-xs text-muted-foreground font-inter ml-2">
            Live Preview — {language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors" title="نسخ الكود">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors md:hidden" title="إغلاق">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <iframe
        srcDoc={srcDoc}
        className="w-full flex-1 border-0"
        sandbox="allow-scripts"
        title="Code Preview"
      />
    </motion.div>
  );
};

export default CodePreview;
