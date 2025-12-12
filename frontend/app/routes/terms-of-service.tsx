import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const TermsOfServicePage = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    import("~/config/terms-of-service/20250823/ja.md?raw")
      .then((module) => {
        setContent(module.default);
      })
      .catch((error) => {
        console.error("利用規約の読み込みに失敗しました:", error);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-4">
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => <h1 className="text-2xl font-semibold" {...props} />,
            h2: ({ ...props }) => <h2 className="text-xl font-semibold" {...props} />,
            a: ({ ...props }) => <a className="text-link" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
