import { renderMermaidSVG } from 'beautiful-mermaid'
const svg = renderMermaidSVG(`graph LR
  Input([Input]) --> LLM[LLM]
  style Input fill:#f9e3e2,stroke:#EA4335
`);
console.log(svg.includes("#EA4335"));
