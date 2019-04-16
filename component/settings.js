document.addEventListener("DOMContentLoaded", () => {
  browser.storage.local.get().then(
    result => {
      document.querySelector('#fontSize').value =
        typeof result.fontSize === "undefined" ? "16" : result.fontSize;
    },
    error => console.log(`Error: ${error}`)
  );
});

document.querySelector("#save").addEventListener("click", e => {
  e.preventDefault();
  browser.storage.local.set({
    fontSize: document.querySelector('#fontSize').value
  });
});