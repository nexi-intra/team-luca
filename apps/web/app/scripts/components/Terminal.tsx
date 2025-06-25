import { useEffect, useRef } from "react";
import { ProcessOutput } from "../types";
import Convert from "ansi-to-html";

interface TerminalProps {
  output: ProcessOutput[];
}

const convert = new Convert({
  fg: "#000",
  bg: "#FFF",
  newline: true,
  escapeXML: true,
});

export function Terminal({ output }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div
      ref={terminalRef}
      className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto"
    >
      {output.map((line, index) => (
        <div
          key={index}
          className={line.type === "stderr" ? "text-red-400" : ""}
          dangerouslySetInnerHTML={{
            __html: convert.toHtml(line.data),
          }}
        />
      ))}
    </div>
  );
}
