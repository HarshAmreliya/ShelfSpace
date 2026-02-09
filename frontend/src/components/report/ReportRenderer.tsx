"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
type ReportRendererProps = {
  content: string;
};

export default function ReportRenderer({ content }: ReportRendererProps) {
  return (
    <div className="report-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="report-pre">{children}</pre>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
