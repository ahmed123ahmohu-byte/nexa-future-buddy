import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CodePreviewProps {
  code: string;
  language: string;
}

const CodePreview = ({ code, language }: CodePreviewProps) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    if (['html', 'css', 'javascript', 'js', 'jsx', 'react'].includes(language.toLowerCase())) {
      // Build a simple HTML preview
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
      className="glass-card overflow-hidden h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-glass-border/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-neon-purple/50" />
          <div className="w-3 h-3 rounded-full bg-accent/50" />
        </div>
        <span className="text-xs text-muted-foreground font-inter ml-2">
          Live Preview — {language}
        </span>
      </div>
      <iframe
        srcDoc={srcDoc}
        className="w-full h-[calc(100%-36px)] border-0"
        sandbox="allow-scripts"
        title="Code Preview"
      />
    </motion.div>
  );
};

export default CodePreview;
