let alternativeLoadScript = false;

export function overrideLoadScript(state) {
  alternativeLoadScript = state;
}

export function resetLoadScript() {
  alternativeLoadScript = false;
}

export function loadScript(src) {
  if (alternativeLoadScript) { return alternativeLoadScript(src); }
  let scriptTag = document.createElement('script');
  let firstScriptTag = document.getElementsByTagName('script')[0];
  scriptTag.src = src;
  firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
}
