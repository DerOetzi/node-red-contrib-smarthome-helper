/**
 * Help text generator for Node-RED nodes
 * Generates markdown-style help text from locale data
 */

export interface HelpTextInput {
  name: string;
  description: string;
}

export interface HelpTextOutput {
  name: string;
  description: string;
}

export interface HelpTextDetails {
  text: string;
}

export interface HelpTextSection {
  title?: string;
  content: string;
}

export interface HelpTextData {
  name: string;
  description: string;
  inputs?: Record<string, HelpTextInput>;
  outputs?: Record<string, HelpTextOutput>;
  details?: HelpTextDetails[];
  sections?: HelpTextSection[];
}

/**
 * Generates Node-RED help HTML from structured help data
 */
export function generateHelpHtml(
  nodeType: string,
  helpData: HelpTextData
): string {
  const sections: string[] = [];

  // Main description
  sections.push(`<p>${escapeHtml(helpData.description)}</p>`);

  // Inputs section
  if (helpData.inputs && Object.keys(helpData.inputs).length > 0) {
    sections.push("<h3>Inputs</h3>");
    sections.push("<dl class=\"message-properties\">");
    for (const [key, input] of Object.entries(helpData.inputs)) {
      sections.push(`<dt>${escapeHtml(input.name)}`);
      sections.push(`<span class="property-type">msg.${escapeHtml(key)}</span>`);
      sections.push("</dt>");
      sections.push(`<dd>${escapeHtml(input.description)}</dd>`);
    }
    sections.push("</dl>");
  }

  // Outputs section
  if (helpData.outputs && Object.keys(helpData.outputs).length > 0) {
    sections.push("<h3>Outputs</h3>");
    const outputKeys = Object.keys(helpData.outputs);
    
    if (outputKeys.length === 1) {
      sections.push("<dl class=\"message-properties\">");
      const [key, output] = Object.entries(helpData.outputs)[0];
      sections.push(`<dt>${escapeHtml(output.name)}`);
      sections.push(`<span class="property-type">msg.${escapeHtml(key)}</span>`);
      sections.push("</dt>");
      sections.push(`<dd>${escapeHtml(output.description)}</dd>`);
      sections.push("</dl>");
    } else {
      // Multiple outputs
      outputKeys.forEach((key, index) => {
        const output = helpData.outputs![key];
        sections.push(`<ol class="node-ports">`);
        sections.push(`<li>${escapeHtml(output.name)}`);
        sections.push("<dl class=\"message-properties\">");
        sections.push(`<dt>payload <span class="property-type">${escapeHtml(output.description)}</span></dt>`);
        sections.push("</dl>");
        sections.push("</li>");
        sections.push("</ol>");
      });
    }
  }

  // Details section
  if (helpData.details && helpData.details.length > 0) {
    sections.push("<h3>Details</h3>");
    helpData.details.forEach((detail) => {
      sections.push(`<p>${escapeHtml(detail.text)}</p>`);
    });
  }

  // Custom sections
  if (helpData.sections && helpData.sections.length > 0) {
    helpData.sections.forEach((section) => {
      if (section.title) {
        sections.push(`<h3>${escapeHtml(section.title)}</h3>`);
      }
      sections.push(`<p>${escapeHtml(section.content)}</p>`);
    });
  }

  const helpContent = sections.join("\n");
  return `<script type="text/markdown" data-help-name="${nodeType}">\n${helpContent}\n</script>`;
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
