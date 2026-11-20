for (const code of document.querySelectorAll(".docs-content pre > code")) {
  const snippet = code.textContent;
  const pre = code.parentElement;
  const toolbar = document.createElement("div");
  toolbar.className = "docs-code-toolbar";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Copy code";

  const status = document.createElement("span");
  status.setAttribute("role", "status");
  toolbar.append(button, status);
  pre.before(toolbar);

  button.addEventListener("click", async () => {
    status.textContent = "";
    try {
      await navigator.clipboard.writeText(snippet);
      status.textContent = "Copied";
    } catch {
      status.textContent = "Copy unavailable. Select the code to copy it.";
    }
  });

  try {
    JSON.parse(snippet);
  } catch {
    continue;
  }

  const fragment = document.createDocumentFragment();
  let end = 0;
  for (const token of snippet.matchAll(/"(?:[^"\\]|\\.)*"|:/g)) {
    if (token[0] === ":" || !/^\s*:/.test(snippet.slice(token.index + token[0].length))) {
      continue;
    }
    fragment.append(snippet.slice(end, token.index));
    const key = document.createElement("span");
    key.className = "docs-code-key";
    key.textContent = token[0];
    fragment.append(key);
    end = token.index + token[0].length;
  }
  fragment.append(snippet.slice(end));
  code.replaceChildren(fragment);
}
