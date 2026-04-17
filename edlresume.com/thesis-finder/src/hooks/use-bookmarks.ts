import { useState, useCallback, useSyncExternalStore } from "react";
import {
  getBookmarks,
  addBookmark as addBm,
  removeBookmark as removeBm,
  isBookmarked as isBm,
  exportToCSV,
} from "@/lib/bookmarks";
import { OpenAlexWork } from "@/lib/openalex";

let listeners: (() => void)[] = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function emitChange() {
  listeners.forEach((l) => l());
}

let snapshotCache = getBookmarks();
function getSnapshot() {
  return snapshotCache;
}

function refreshSnapshot() {
  snapshotCache = getBookmarks();
  emitChange();
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getSnapshot);

  const addBookmark = useCallback((work: OpenAlexWork) => {
    addBm(work);
    refreshSnapshot();
  }, []);

  const removeBookmark = useCallback((id: string) => {
    removeBm(id);
    refreshSnapshot();
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((w) => w.id === id),
    [bookmarks],
  );

  const exportBookmarks = useCallback(() => {
    exportToCSV(bookmarks);
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, exportBookmarks };
}
