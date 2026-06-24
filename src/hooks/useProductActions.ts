'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'olew_liked_products';

function getLiked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveLiked(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

// ── useLike ───────────────────────────────────────────────────────────────────

export function useLike(productId: string) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(getLiked().has(productId));
  }, [productId]);

  const toggle = useCallback(() => {
    const set = getLiked();
    if (set.has(productId)) {
      set.delete(productId);
    } else {
      set.add(productId);
    }
    saveLiked(set);
    setLiked(set.has(productId));
    // TODO: call POST /api/v1/public/products/:id/like when API is ready
  }, [productId]);

  return { liked, toggle };
}

// ── useShare ──────────────────────────────────────────────────────────────────

export function useShare(title: string, url?: string) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [title, url]);

  return { share, copied };
}
