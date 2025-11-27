import React from 'react';
import Markdown from 'markdown-to-jsx';
import { ExternalLink, Code } from 'lucide-react';

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  return (
    <div className="prose prose-invert max-w-none text-white">
      <Markdown
        options={{
          forceBlock: true,
          overrides: {
            h1: {
              component: ({ children }: any) => (
                <h1 className="mt-4 mb-3 border-b-2 border-[#83BD01] pb-1 text-2xl font-bold text-[#83BD01]">
                  {children}
                </h1>
              ),
            },
            h2: {
              component: ({ children }: any) => (
                <h2 className="mt-3 mb-2 text-xl font-semibold text-[#83BD01]">{children}</h2>
              ),
            },
            h3: {
              component: ({ children }: any) => (
                <h3 className="mt-2 mb-2 text-lg font-semibold text-[#83BD01]">{children}</h3>
              ),
            },
            h4: {
              component: ({ children }: any) => (
                <h4 className="mt-2 mb-2 text-base font-semibold text-[#83BD01]">{children}</h4>
              ),
            },
            p: {
              component: ({ children }: any) => (
                <p className="mb-3 leading-relaxed break-words whitespace-pre-wrap text-white">
                  {children}
                </p>
              ),
            },
            ul: {
              component: ({ children }: any) => (
                <ul className="mb-3 list-disc pl-6 text-white">{children}</ul>
              ),
            },
            ol: {
              component: ({ children }: any) => (
                <ol className="mb-3 list-decimal pl-6 text-white">{children}</ol>
              ),
            },
            li: {
              component: ({ children }: any) => <li className="mb-1">{children}</li>,
            },
            a: {
              component: ({ href, children }: any) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#4db8ff] underline hover:rounded-md hover:bg-[#0a0a0a40] hover:px-1 hover:text-[#66d9ff]"
                >
                  {children}
                  <ExternalLink size={14} className="inline-block" />
                </a>
              ),
            },
            blockquote: {
              component: ({ children }: any) => (
                <blockquote className="my-3 border-l-4 border-[#83BD01] pl-4 text-gray-200 italic">
                  {children}
                </blockquote>
              ),
            },
            code: {
              component: ({ className, children }: any) => {
                const isBlock = className?.includes('lang-') || /\n/.test(children);
                if (isBlock) {
                  return (
                    <pre className="relative my-3 w-full overflow-x-auto rounded-lg border-l-4 border-[#83BD01] bg-[#1a1a1a] p-4 text-[#83BD01] shadow-md">
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-400">
                        <Code size={14} /> code
                      </div>
                      <code className="font-mono text-sm leading-relaxed">{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="rounded bg-[#2e2e2e] px-1.5 py-0.5 font-mono text-[#83BD01]">
                    {children}
                  </code>
                );
              },
            },
            table: {
              component: ({ children }: any) => (
                <div className="my-3 w-full overflow-x-auto rounded-md border border-white/20">
                  <table className="w-full border-collapse text-sm text-white">{children}</table>
                </div>
              ),
            },
            thead: {
              component: ({ children }: any) => (
                <thead className="bg-[#83BD01] text-black">{children}</thead>
              ),
            },
            tbody: {
              component: ({ children }: any) => <tbody>{children}</tbody>,
            },
            tr: {
              component: ({ children }: any) => (
                <tr className="border-b border-white/20 even:bg-white/5 hover:bg-white/10">
                  {children}
                </tr>
              ),
            },
            th: {
              component: ({ children }: any) => (
                <th className="px-3 py-2 text-left font-semibold">{children}</th>
              ),
            },
            td: {
              component: ({ children }: any) => <td className="px-3 py-2 align-top">{children}</td>,
            },
            img: {
              component: ({ src, alt }: any) => (
                <img src={src} alt={alt} className="my-3 w-full max-w-[90%] rounded-lg shadow-lg" />
              ),
            },
            strong: {
              component: ({ children }: any) => (
                <strong className="font-semibold text-[#83BD01]">{children}</strong>
              ),
            },
          },
        }}
      >
        {markdown || ''}
      </Markdown>
    </div>
  );
};

export default MarkdownRenderer;
