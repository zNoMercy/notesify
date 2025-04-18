import { Transformer } from "markmap-lib";
import { loadCSS, loadJS } from "markmap-common";
import * as markmap from "markmap-view";
// import { Markmap } from "markmap-view";
// import { Toolbar } from "markmap-toolbar";

export const transformer = new Transformer();
const { styles, scripts } = transformer.getAssets();
loadCSS(styles || []);
loadJS(scripts || [], { getMarkmap: () => markmap });

// export const createMindmap = (content: string, container: SVGElement) => {
//   const { root } = transformer.transform(content);
//   const markmapInstance = Markmap.create(container, undefined, root);
//   return markmapInstance;
// };

// export const renderToolbar = (mm: Markmap, wrapper: HTMLElement) => {
//   while (wrapper?.firstChild) wrapper.firstChild.remove();
//   if (mm && wrapper) {
//     const toolbar = new Toolbar();
//     toolbar.attach(mm);
//     toolbar.setItems([...Toolbar.defaultItems]);
//     wrapper.append(toolbar.render());
//   }
// };

export const removeMarkdownTag = (content: string) => {
  if (content.startsWith("```markdown")) {
    return content.substring("```markdown".length).trim();
  }
  return content;
  // Check if the first line is ```markdown and last line is ```
  // const lines = content.split("\n");
  // const firstLine = lines[0];
  // const lastLine = lines[lines.length - 1];
  // if (
  //   (firstLine === "```markdown" || firstLine === "```markdown ") &&
  //   lastLine === "```" &&
  //   lines.length > 2
  // ) {
  //   const newContent = lines.slice(1, lines.length - 1).join("\n");
  //   return newContent;
  // }
  // return content;
};
