const picker = document.querySelector("#preset");
const schema = document.querySelector("#schema");
const data = document.querySelector("#data");
const result = document.querySelector("#result");
const validate = document.querySelector("#validate");
const pretty = value => JSON.stringify(value, null, 2);

async function start() {
  const response = await fetch("../examples.json");
  if (!response.ok) throw new Error("Examples could not be loaded.");
  const examples = await response.json();
  for (const name of Object.keys(examples)) picker.add(new Option(name, name));
  const requested = new URLSearchParams(location.search).get("example");
  picker.value = Object.hasOwn(examples, requested) ? requested : "localReferences";
  function load(failing = false, replaceSchema = true) {
    const example = examples[picker.value];
    if (replaceSchema) schema.value = pretty(example.schema);
    data.value = pretty(example[failing ? "fail" : "pass"]);
    result.textContent = "Ready to validate.";
  }
  picker.addEventListener("change", () => load());
  document.querySelector("#pass").addEventListener("click", () => load(false, false));
  document.querySelector("#fail").addEventListener("click", () => load(true, false));
  document.querySelector("#reset").addEventListener("click", () => load());
  validate.addEventListener("click", async () => {
    validate.disabled = true;
    result.textContent = "Validating…";
    const input = {schema: schema.value, data: data.value};
    try {
      if (location.origin !== "http://127.0.0.1:8000") throw new Error("Static site");
      const response = await fetch("../validate", {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(input)
      });
      if (!response.ok) throw new Error("Validator unavailable");
      const outcome = await response.json();
      if (outcome.error) result.textContent = outcome.error;
      else if (outcome.valid) result.textContent = "Valid. The data meets the schema.";
      else result.textContent = outcome.errors.map(error =>
        `${error.instanceLocation || "(document root)"} · ${error.keyword || error.code}: ${error.message}`
      ).join("\n");
    } catch {
      const snapshot = Object.values(examples).flatMap(example => ["pass", "fail"].map(key => ({
        schema: pretty(example.schema), data: pretty(example[key]), outcome: example.results[key]
      }))).find(example => example.schema === input.schema && example.data === input.data);
      result.textContent = snapshot
        ? "Recorded result · " + (snapshot.outcome.valid ? "Valid." : snapshot.outcome.errors.map(error =>
            `${error.instanceLocation || "(document root)"} · ${error.keyword || error.code}: ${error.message}`).join("\n"))
        : "Live validation requires the local server. See Quickstart, or reset to a recorded example.";
    } finally {
      validate.disabled = false;
    }
  });
  load();
  for (const control of document.querySelectorAll("main button, #preset")) control.disabled = false;
}

start().catch(error => { result.textContent = error.message; });
