import type { YTNamespace } from "./youtube-types";

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("client only"));
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    const prior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prior?.();
      if (window.YT) resolve(window.YT);
    };
    document.head.appendChild(tag);
  });
  return apiPromise;
}
