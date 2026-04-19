import type { ReactNode } from 'react';

/** Parse `[term]{tooltip: "..."}` into inline term controls (trusted subset from CMS/data). */
export function parseInstructionMarkup(
  text: string,
  onTermClick: (tooltipDefinition: string) => void,
  keyPrefix: string,
  termBtnClassName: string,
): ReactNode[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`${keyPrefix}-t-${key++}`}>{text.slice(last, m.index)}</span>,
      );
    }
    const term = m[1];
    const tip = m[2];
    parts.push(
      <button
        key={`${keyPrefix}-t-${key++}`}
        type="button"
        className={termBtnClassName}
        onClick={(e) => {
          e.stopPropagation();
          onTermClick(tip);
        }}
      >
        {term}
      </button>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(<span key={`${keyPrefix}-t-${key++}`}>{text.slice(last)}</span>);
  }
  return parts.length ? parts : [<span key={`${keyPrefix}-t-0`}>{text}</span>];
}

/** Parses `<b>…</b>` blocks and nested tooltip markup. */
export function parseInstructionWithBoldMarkup(
  text: string,
  onTermClick: (tooltipDefinition: string) => void,
  keyPrefix: string,
  termBtnClassName: string,
  strongClassName: string,
): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let boldIdx = 0;
  const boldRe = /<b>([\s\S]*?)<\/b>/g;
  let m: RegExpExecArray | null;

  while ((m = boldRe.exec(text)) !== null) {
    if (m.index > last) {
      out.push(
        ...parseInstructionMarkup(text.slice(last, m.index), onTermClick, `p${boldIdx}`, termBtnClassName),
      );
    }
    boldIdx += 1;
    out.push(
      <strong key={`${keyPrefix}-bold-${boldIdx}`} className={strongClassName}>
        {parseInstructionMarkup(m[1], onTermClick, `b${boldIdx}`, termBtnClassName)}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push(
      ...parseInstructionMarkup(text.slice(last), onTermClick, `p${boldIdx}`, termBtnClassName),
    );
  }
  return out.length
    ? out
    : parseInstructionMarkup(text, onTermClick, `${keyPrefix}-0`, termBtnClassName);
}
