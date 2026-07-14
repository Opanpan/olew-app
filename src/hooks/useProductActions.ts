'use client';

import { useState, useEffect, useCallback } from 'react';
import { likeProduct, unlikeProduct, shareProduct, type SharePlatform } from '@/lib/publicApi';

const STORAGE_KEY = 'olew_liked_products';
const VISITOR_ID_KEY = 'olew_visitor_id';

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

// The API identifies anonymous visitors by a client-generated UUID (there's no
// login on the storefront, and browsers don't expose any real hardware/device
// ID) — persisted in localStorage per the backend's own contract, so the same
// browser is recognized as the same "visitor" across visits.
function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

// ── useLike ───────────────────────────────────────────────────────────────────

export function useLike(productId: string, initialLikeCount?: number) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0);

  useEffect(() => {
    setLiked(getLiked().has(productId));
  }, [productId]);

  useEffect(() => {
    if (initialLikeCount !== undefined) setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const toggle = useCallback(async () => {
    const set = getLiked();
    const wasLiked = set.has(productId);

    // Optimistic local update — instant feedback, and the source of truth for
    // whether *this browser* has liked the product (no "check status" endpoint exists).
    if (wasLiked) set.delete(productId); else set.add(productId);
    saveLiked(set);
    setLiked(!wasLiked);
    setLikeCount((c) => Math.max(0, wasLiked ? c - 1 : c + 1));

    const visitorId = getOrCreateVisitorId();
    const result = wasLiked
      ? await unlikeProduct(productId, visitorId)
      : await likeProduct(productId, visitorId);

    // Reconcile with the server's authoritative count/state (idempotent either way).
    if (result) {
      setLiked(result.liked);
      setLikeCount(result.like_count);
    }
  }, [productId]);

  return { liked, likeCount, toggle };
}

// ── useShare ──────────────────────────────────────────────────────────────────

export function useShare(productId: string, title: string, url?: string) {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState<number | undefined>(undefined);

  const share = useCallback(async () => {
    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
    let platform: SharePlatform = 'other';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // user cancelled or not supported — fall through to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          platform = 'copy';
        } catch {
          return;
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        platform = 'copy';
      } catch {
        return;
      }
    }

    const visitorId = getOrCreateVisitorId();
    const result = await shareProduct(productId, visitorId, platform);
    if (result) setShareCount(result.share_count);
  }, [productId, title, url]);

  return { share, copied, shareCount };
}
