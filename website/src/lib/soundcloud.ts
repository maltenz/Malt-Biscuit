import { type RefObject, useEffect, useState } from 'react';

// SoundCloud embed helpers: the player iframe URL, and a hook that plays and
// pauses it through SoundCloud's Widget API
// (https://developers.soundcloud.com/docs/api/html5-widget).

interface Widget {
  bind(event: string, listener: () => void): void;
  unbind(event: string): void;
  play(): void;
  pause(): void;
  seekTo(milliseconds: number): void;
}
declare global {
  interface Window {
    SC?: {
      Widget: ((iframe: HTMLIFrameElement) => Widget) & { Events: { READY: string; PLAY: string } };
    };
  }
}

const API_SCRIPT = 'https://w.soundcloud.com/player/api.js';
let apiPromise: Promise<void> | undefined;

/** Load SoundCloud's Widget API script once. */
function loadApi() {
  apiPromise ??= new Promise<void>((resolve, reject) => {
    if (window.SC) return resolve();
    const script = document.createElement('script');
    script.src = API_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('SoundCloud API failed to load'));
    document.head.append(script);
  });
  return apiPromise;
}

/** Slim ("mini", 20px) player for a track, in the site's pink. */
export const soundCloudPlayerUrl = (trackApiUrl: string) =>
  `https://w.soundcloud.com/player/?${new URLSearchParams({
    url: trackApiUrl,
    color: '#ff35b3',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  })}`;

/**
 * Keep the embedded player in step with `playing`. Does nothing until the
 * iframe is mounted. If the browser blocks playback, the player's own play
 * button still works. `startAt` (ms) is where the first play starts; later
 * plays resume where it was paused.
 */
export function useSoundCloudPlayback(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  playing: boolean,
  mounted: boolean,
  startAt = 0,
) {
  const [widget, setWidget] = useState<Widget | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!mounted || !iframe || widget) return;
    let cancelled = false;
    loadApi()
      .then(() => {
        if (cancelled || !window.SC) return;
        const { Events } = window.SC.Widget;
        const w = window.SC.Widget(iframe);
        w.bind(Events.READY, () => {
          if (cancelled) return;
          // Seeking before the track has started loading is unreliable, so
          // jump to the start point once it first plays (whichever button).
          if (startAt > 0) {
            w.bind(Events.PLAY, () => {
              w.unbind(Events.PLAY);
              w.seekTo(startAt);
            });
          }
          setWidget(w);
        });
      })
      .catch(() => {
        // API blocked or offline: the player's own play button still works.
      });
    return () => {
      cancelled = true;
    };
  }, [iframeRef, mounted, widget, startAt]);

  useEffect(() => {
    if (!widget) return;
    if (playing) widget.play();
    else widget.pause();
  }, [widget, playing]);
}
