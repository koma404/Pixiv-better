// ==UserScript==
// @name           Pixiv Sort
// @name:ru        Pixiv Sort
// @name:ja        Pixiv Sort
// @name:zh-CN     Pixiv Sort
// @namespace      https://github.com/koma404/Pixiv-better
// @version        1.3.6
// @description    Makes pixiv's own "Sort by popularity" work without Premium, and adds it to artist pages and bookmarks. Works are ranked right in your browser by real bookmark counts, as pixiv does, or by views.
// @description:ru Включает штатную «Сортировку по популярности» на pixiv без Premium и добавляет её на страницы авторов и в закладки. Работы ранжируются прямо в браузере по реальному числу закладок, как у самого pixiv, или по просмотрам.
// @description:ja pixiv 標準の「人気順」を Premium なしで使えるようにし、ユーザーページとブックマークにも追加します。pixiv と同じく実際のブックマーク数で、または閲覧数でブラウザ内で並べ替えます。
// @description:zh-CN 无需 Premium 即可使用 pixiv 自带的“按热门度排序”，并将其加入用户主页和收藏。在浏览器内按真实收藏数（与 pixiv 相同）或浏览数排序。
// @author         vasyok100
// @license        MIT
// @icon           data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAD90lEQVR4Aeyab3LaMBDFn0hLp6coOUnJSZJ8JD1E0kM0fExuEvck5RaZ0klUP9kKGAS2dm0JSDQj5L/Svt+uV1gwwjsvHwDeeQAgbwTMnydgzeiFvAAwuoSr+QjkA0DPW3MHVm5nYpAPQMPzjIQ8BPIAoMfpea+Z2zzm9xO2eQA0vO/V5omCPADoca/bt9Zc5ZgR0gOY/731mjfaCYKRsXFVz7vpAYS870VliIK0AHZ73yOY4PVs6ndStGkB0MNtqgxuU+aCdAAq75fPeRsBJI2CdAC6eB91Mbist3pvNjtMA2D+j891F+97+6b4tbzyO0O2aQBY+xAtIlEUDA8g3vueVZIoGB6AxPseQYIoGBZA9YIT8+x76b6dDj0lDgvAnsU/+166b/vow/cVaIcBwOe+yuLM/oFhow6VUVDOIuyziqiom9sulgGgMRTILzfz5QPul09l/VNW66q1TzDQe99bz/5cPfNjsH0Cx3Y2yAGFAXQVyBcbC87X9LTmWUdk4VhTcGxnQwlcCGgFgCTvl00Pus6RQyCUZT8gRk49wArA7MvPMmwf6+On3BSYja+9wBUAHuEJY++4eZLV4BE34wuslSYAnnCRcIIQKJ4Opsa1ug2AJ08NAqM6IJ5SwwB45lQgWFyDWqgpUHcD4MW8kfSABY6xWFzjx3hvYt8PgKIrCOzkuCAYc9EmnvLaAfCqY4NA8bPPBU1vq90AsBcHwXD+POxIiBBPWd0B8GpSNQcMIVI8JcUB4B2HCkEgnnLiAfAuB+GF36gO4XFYQCieUmQAeOfsazlwdgilDeUjSYfQJkGVA+BgeSGoxVOCDgB7IASAr59IXhSe97bqAQywTOWNa2l7+YeZHgA+5fG+o6MfuwcAr9+dLTk+Xq0afg8AciivxxxBDV8PwBouiNYWJW4sDiIC8gEAyt8MnidQFF0E5JsBdkqOPaEDkOFfXVsClf8pUgLYMif9AWUi1AHQJkCu1LJqltyUiVAHAJAmwKJ6gxuXC5ZlrdYYCsiK1AY3mhyALAEWTjh/nFj/Hs9tHuNrrSQaZLYoAcQlnwW4PE2RFOuGDnzw3M343F0bAyLOlsbA8ggY2W+NnnbtVMLPu6zQvnXBpWyC6Lokr0iEcgBtCZDJ7WZsooS/Eag3uBDrQGD/srwiEcoB7EqAFG5ezrHjpyhICvtiomTf4fsn4cPtR2UAwkmnSnA0tlokaR895grmB/ZdJcpi41bx2oAMQHMNoAhm9g0Le9slCCbTCsRi1a9sbUAIoF4DqBLcBWjUypI0WxyT+YE2cMYQrg0IAYx+Q5vg+sLkZ4yRWYuG7p3LAJB+9zHSXCm0SQYgjaQkoxw9AC2l/wAAAP//5+LpWQAAAAZJREFUAwAH622Qrl7qOAAAAABJRU5ErkJggg==
// @match          https://www.pixiv.net/*
// @run-at         document-start
// @noframes
// @grant          none
// @homepageURL    https://github.com/koma404/Pixiv-better
// @downloadURL    https://raw.githubusercontent.com/koma404/Pixiv-better/main/pb.user.js
// @updateURL      https://raw.githubusercontent.com/koma404/Pixiv-better/main/pb.user.js
// ==/UserScript==

// Copyright (c) 2026 vasyok100. Released under the MIT License.
// Based on vasyok100's Pixiv Sort (https://greasyfork.org/scripts/600266), with fixes:
// https://github.com/koma404/Pixiv-better

// How it works
// 1. A click on pixiv's own "Sort by popularity" chip or dropdown item is caught
//    before pixiv shows the Premium dialog. The page's own copy of the account flag
//    is switched to premium (pixiv's search page otherwise drops the popular order
//    from the URL for free accounts) and the page is moved to order=popular_d
//    through pixiv's router. The real flag comes back when the popular order is
//    left. After a reload pixiv's client drops the order again; it is put back.
//    Nothing is sent to pixiv's servers to change the account.
// 2. pixiv then requests /ajax/search/...&order=popular_d itself. For free accounts
//    the server ignores that order, so the script answers the request with its own
//    ranking and pixiv renders it in its native grid and pager.
// 3. Candidates come from several sources, because none of them is complete:
//    - users入り tags (community tags added at bookmark milestones, often with the
//      series name: "魔女の旅々100000users入り"), highest tier first, searched by
//      partial tag match and checked against the exact tags locally, plus a
//      lookahead past each tier boundary because these tags lag behind;
//    - pixiv's recommendation graph: works that the top works' recommendations
//      share most often are popular too, including works without milestone tags;
//    - the free "popular" previews of the tag and of related tags, collected over
//      time because pixiv rotates them.
//    Everything is ordered by real counts (pixiv's mobile work details, a third of
//    the size of /ajax/illust/{id}): bookmarks, as pixiv's own popular order does,
//    or views, switched next to pixiv's sort control. Counts are fetched while works are
//    still being listed, the likeliest top works first, and kept for a day in
//    IndexedDB. A milestone caps how far a work can plausibly go, so works that
//    can't reach the requested pages are not counted until a deeper page needs them
//    (the stopping rule of top-k "threshold algorithms").
// 4. Artist pages and bookmarks get a "Sort by popularity" toggle (?sort=popular).
//    pixiv pages these lists itself; the whole list is read, counted, and each page
//    pixiv asks for is answered from the ranking.
// All requests go to www.pixiv.net.

(function () {
    'use strict';

    // The page part hooks window.fetch and reads pixiv's React state, so it has to run
    // in the page itself, whatever context the userscript manager uses.
    function injectPageWorld() {
        const inject = () => {
            const root = document.head || document.documentElement;
            if (root) {
                const script = document.createElement('script');
                script.textContent = `(${pageWorld.toString()})();`;
                root.appendChild(script);
                script.remove();
            }
            // Without inline scripts (e.g. a future CSP, or no root element to
            // attach to) run it here as a best effort.
            if (!document.documentElement || document.documentElement.getAttribute('data-pixiv-sort') !== 'page') pageWorld();
        };
        if (document.documentElement) inject();
        else document.addEventListener('readystatechange', inject, { once: true });
    }

    // A userscript manager that already runs the script in the page (Tampermonkey and
    // Violentmonkey do with @grant none) needs no second copy injected.
    if (typeof unsafeWindow === 'undefined' || unsafeWindow === window) pageWorld();
    else injectPageWorld();

    // -------------------------------------------------------------------------
    // Page side (runs in the page; self-contained, no access to the code above)
    // -------------------------------------------------------------------------

    function pageWorld() {
        'use strict';

        if (window.__pixivSortInstalled) return;
        window.__pixivSortInstalled = true;
        // At document-start <html> may not exist yet (no documentElement, and
        // document.documentElement === null). The flag is only a marker for
        // injectPageWorld, so record it whenever the element appears.
        const mark = () => {
            if (document.documentElement) document.documentElement.setAttribute('data-pixiv-sort', 'page');
        };
        if (document.documentElement) mark();
        else document.addEventListener('readystatechange', mark, { once: true });

        const nativeFetch = window.fetch;
        // The URL the page was opened with: pixiv's client drops order=popular_* from
        // the address moments later (see restoreInitialOrder), but the navigation
        // entry keeps it even when the script starts late.
        const initialHref = (function () {
            try {
                const entry = performance.getEntriesByType('navigation')[0];
                if (entry && entry.name && new URL(entry.name).origin === location.origin) return entry.name;
            } catch (e) {
                // No Navigation Timing: the current address is the best guess.
            }
            return location.href;
        })();

        // ---------------------------------------------------------------------
        // Config
        // ---------------------------------------------------------------------

        const PAGE_SIZE = 60;
        const MAX_RANKED_PAGES = 50;
        const POPULAR_ORDERS = new Set(['popular_d', 'popular_male_d', 'popular_female_d']);
        const RESULT_FIELDS = { artworks: 'illustManga', illustrations: 'illust', manga: 'manga' };
        // users入り milestones, highest first. Rare neighbouring milestones share one
        // query ("word (30000users入り OR 20000users入り)") to save search requests.
        // The top works carry the milestones above 100000 only (e.g. 81174072, the most
        // bookmarked R-18 work, has just "オリジナル300000users入り"), which a search for
        // 100000users入り doesn't match.
        const TIER_GROUPS = [[500000, 400000, 300000, 200000, 150000], [100000], [50000], [30000, 20000], [10000, 7500], [5000, 3000], [1000], [500, 300], [100, 50]];
        // pixiv answers too many searches from one account with empty results for a
        // few minutes, so search requests are spaced out and cached.
        const SEARCH_INTERVAL_MS = 500;
        // Recommendation and bulk work requests are not searches.
        const RECOMMEND_INTERVAL_MS = 250;
        // Search pages are kept in memory and in IndexedDB for this long, so a reload, a
        // new sort order or a second tab on the same search makes no search requests.
        const LISTING_CACHE_TTL_MS = 30 * 60 * 1000;
        // A search page is about 60 KB of work data in memory.
        const LISTING_CACHE_MAX = 150;
        // Filters that pixiv's free "popular" preview block does not respect.
        const SEED_BLOCKING_FILTERS = ['scd', 'ecd', 'wlt', 'wgt', 'hlt', 'hgt', 'ratio', 'tool', 'blt', 'bgt'];
        // Filters that recommendations cannot check.
        const UNCHECKABLE_FILTERS = ['wlt', 'wgt', 'hlt', 'hgt', 'ratio', 'tool', 'blt', 'bgt'];
        // Works ranked per chunk: a chunk ends at a tier boundary or after this many.
        const CHUNK_SIZE = 1000;
        // users入り tags are added by hand and often lag behind the real count, so after
        // a tier boundary this many works of the next tier are ranked as well.
        const LOOKAHEAD_SIZE = 300;
        // Related tags whose "popular" preview is checked for top works that carry no
        // users入り tag at all.
        const RELATED_SEED_TAGS = 6;
        // Recommendation graph: how many top works are expanded and how many of the
        // works they recommend get an exact count.
        const GRAPH_SEEDS = 12;
        const GRAPH_BUDGET = 300;
        // Recommendation lists are ~200 KB and take seconds each, so several load at once.
        const GRAPH_PARALLEL = 4;
        // users入り tags lag behind the real count, but a work listed under a milestone
        // is not expected to have more than this many times it.
        const STALE_FACTOR = 10;
        // What each sort order ranks by. pixiv's own popular order is by bookmarks: its
        // top works come strictly by bookmark count, not by likes or views (the top 5
        // of "R-18" are exactly the 5 most bookmarked of its 417 works above 100K: 353K,
        // 333K, 291K, 282K and 279K, while their likes and views go up and down).
        // Milestones count bookmarks too. For views the ratio to bookmarks is measured
        // on the works counted so far: a work without a count is placed at its milestone
        // times the median, and skipped only if its milestone times STALE_FACTOR times a
        // high quantile can't reach the page. Views per bookmark vary a lot (about 5 for
        // a popular illustration, 15 for long manga, 100+ for old or official posts).
        const METRICS = {
            bookmarks: { field: 'bookmarkCount', perBookmark: 1, bound: 1, minBound: 1 },
            views: { field: 'viewCount', perBookmark: 8, bound: 40, minBound: 10 },
        };
        const RATIO_SAMPLE_MIN = 20;
        const RATIO_BOUND_QUANTILE = 0.95;
        // Milestones lag behind the real count, so a deeper tier is listed too while at
        // least this share of the works past a tier boundary lands on the requested pages.
        const DEEPER_TIER_SHARE = 0.05;
        // Artist works, tags of them and bookmarks: pixiv serves up to 100 per request.
        const LIST_BATCH = 100;
        const LIST_PARALLEL = 3;
        // The list pages' popular order. pixiv's own "order" parameter there only
        // accepts desc/asc (anything else crashes the page), so it is a parameter of its
        // own, which pixiv's links drop and the router hook carries over.
        const LIST_SORT_PARAM = 'sort';
        const LIST_SORT_VALUE = 'popular';
        const MAX_RETRIES = 2;
        const MAX_THROTTLED_RETRIES = 6;
        // A request still unanswered after this long is cut off and retried: a hung
        // connection must not hold one of the workers forever.
        const FETCH_TIMEOUT_MS = 20000;
        const BACKOFF_START_MS = 5000;
        const BACKOFF_CAP_MS = 60000;
        // After a throttle the pace drops at once and comes back step by step. Long
        // pauses come from the cooldown (Retry-After or BACKOFF_*), so the pacing itself
        // stays within INTERVAL_CAP_MS and recovers after every few successes; slower
        // recovery left the ranking crawling for minutes after a short throttle.
        const INTERVAL_CAP_MS = 2000;
        const INTERVAL_MIN_BACKOFF_MS = 200;
        const INTERVAL_SPEEDUP_FACTOR = 0.7;
        const SUCCESSES_BEFORE_SPEEDUP = 4;
        const PREFETCH_DELAY_MS = 1500;
        // A page waits for exact counts while requests keep completing. When pixiv
        // throttles and nothing completes for PAGE_STALL_MS, or after PAGE_MAX_WAIT_MS,
        // it is served with the remaining works placed by estimate. Past
        // PAGE_MAX_WAIT_MS it still waits up to PAGE_GRACE_MS more if the queued counts
        // can finish in that time at the current rate.
        const PAGE_STALL_MS = 5000;
        const PAGE_MAX_WAIT_MS = 20000;
        const PAGE_GRACE_MS = 10000;
        const STATS_DB = 'pixiv-sort';
        const STATS_DB_VERSION = 2;
        const STATS_STORE = 'stats';
        const LISTING_STORE = 'listing';
        // How long an upgrade blocked by another tab is waited for.
        const DB_BLOCKED_WAIT_MS = 3000;
        // Counts are kept by how fast they still change (a volatility-based TTL): a day
        // for works under a month old, three days under a year, a week for older works,
        // whose counts barely move.
        const DAY_MS = 24 * 60 * 60 * 1000;
        const STATS_TTL_MS = DAY_MS;
        const STATS_TTL_MAX_MS = 7 * DAY_MS;
        const STATS_FLUSH_MS = 1000;
        // Counts fetched in one tab reach the other open pixiv tabs at once.
        const STATS_CHANNEL = 'pixiv-sort';
        // A ranking does not wait longer than this for the cache to load.
        const STATS_LOAD_WAIT_MS = 2000;
        // pixiv rotates the free "popular" preview, so it is collected per tag.
        const POPULAR_POOL_KEY = 'pixiv-sort:popular';
        const POPULAR_POOL_TTL_MS = 30 * 24 * 60 * 60 * 1000;
        const POPULAR_POOL_PER_TAG = 60;
        const POPULAR_POOL_TAGS = 300;
        const SETTINGS_KEY = 'pixiv-sort:settings';
        // Where the sort switch was on screen, kept through the reload a new sort order needs.
        const SWITCH_RELOAD_KEY = 'pixiv-sort:switch';
        // pixiv's client drops order=popular_* from the URL after a full page load
        // (reload, new tab, link); it is put back within this time.
        const RESTORE_WINDOW_MS = 10000;
        // The popular order to enter after the reload a new sort order takes.
        const ENTER_ORDER_KEY = 'pixiv-sort:enter';

        const DEFAULT_SETTINGS = {
            sort: 'bookmarks',
            concurrency: 8,
            minIntervalMs: 30,
            badges: true,
        };

        function clampInt(value, min, max, fallback) {
            const n = Math.round(Number(value));
            return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
        }

        function readJson(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (e) {
                return fallback;
            }
        }

        // Returns false when storage is blocked or full; settings and caches then
        // just don't persist.
        function writeJson(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        }

        // Earlier versions kept their data in localStorage, which pixiv shares with its
        // own data: 1.0 under "psbp:" keys, 1.1 the bookmark cache (up to a megabyte).
        // Nothing there is worth carrying over; the caches refill.
        function dropOldStorage() {
            try {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('psbp:') || key === 'pixiv-sort:stats')) localStorage.removeItem(key);
                }
            } catch (e) {
                // Storage blocked: nothing to clean.
            }
        }

        function normalizeSettings(raw) {
            const s = Object.assign({}, DEFAULT_SETTINGS, raw && typeof raw === 'object' ? raw : {});
            return {
                sort: Object.prototype.hasOwnProperty.call(METRICS, s.sort) ? s.sort : DEFAULT_SETTINGS.sort,
                concurrency: clampInt(s.concurrency, 1, 12, DEFAULT_SETTINGS.concurrency),
                minIntervalMs: clampInt(s.minIntervalMs, 10, 5000, DEFAULT_SETTINGS.minIntervalMs),
                badges: Boolean(s.badges),
            };
        }

        let settings = normalizeSettings(readJson(SETTINGS_KEY, null));

        function updateSettings(patch) {
            settings = normalizeSettings(Object.assign({}, settings, patch));
            writeJson(SETTINGS_KEY, settings);
        }

        // ---------------------------------------------------------------------
        // i18n
        // ---------------------------------------------------------------------

        const MESSAGES = {
            en: {
                sorting: 'Sorting by popularity…',
                eta: '≈ {seconds} s',
                showNow: 'Show now',
                sortPopular: 'Sort by popularity',
                settings: 'Settings',
                close: 'Close',
                sortBy: 'Sort by',
                bookmarks: 'Bookmarks',
                views: 'Views',
                badges: 'Counts on thumbnails',
                advanced: 'More',
                concurrency: 'Parallel requests',
                clearCache: 'Clear cache',
                cacheCleared: 'Done',
            },
            ru: {
                sorting: 'Сортирую по популярности…',
                eta: '≈ {seconds} с',
                showNow: 'Показать сейчас',
                sortPopular: 'По популярности',
                settings: 'Настройки',
                close: 'Закрыть',
                sortBy: 'Сортировка',
                bookmarks: 'Закладки',
                views: 'Просмотры',
                badges: 'Счётчики на превью',
                advanced: 'Дополнительно',
                concurrency: 'Параллельных запросов',
                clearCache: 'Очистить кэш',
                cacheCleared: 'Готово',
            },
            ja: {
                sorting: '人気順に並べ替え中…',
                eta: '約 {seconds} 秒',
                showNow: '今すぐ表示',
                sortPopular: '人気順',
                settings: '設定',
                close: '閉じる',
                sortBy: '並び替え',
                bookmarks: 'ブックマーク',
                views: '閲覧数',
                badges: 'サムネイルに数を表示',
                advanced: '詳細',
                concurrency: '同時リクエスト数',
                clearCache: 'キャッシュを削除',
                cacheCleared: '完了',
            },
            zh: {
                sorting: '正在按热门度排序…',
                eta: '约 {seconds} 秒',
                showNow: '立即显示',
                sortPopular: '按热门度排序',
                settings: '设置',
                close: '关闭',
                sortBy: '排序方式',
                bookmarks: '收藏数',
                views: '浏览数',
                badges: '在缩略图上显示数量',
                advanced: '更多',
                concurrency: '并发请求数',
                clearCache: '清除缓存',
                cacheCleared: '完成',
            },
        };

        const LANG = (function () {
            const candidates = [...(navigator.languages || []), navigator.language, document.documentElement && document.documentElement.lang];
            for (const candidate of candidates) {
                const prefix = String(candidate || '').toLowerCase().slice(0, 2);
                if (MESSAGES[prefix]) return prefix;
            }
            return 'en';
        })();

        function t(key, vars) {
            const template = MESSAGES[LANG][key] || MESSAGES.en[key] || key;
            if (!vars) return template;
            return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
        }

        const numberFormat = new Intl.NumberFormat(LANG);
        const compactFormat = new Intl.NumberFormat(LANG, { notation: 'compact', maximumFractionDigits: 1 });

        // ---------------------------------------------------------------------
        // Requests
        // ---------------------------------------------------------------------

        class HttpError extends Error {
            constructor(status, message, retryAfterMs) {
                super(message || `HTTP ${status}`);
                this.name = 'HttpError';
                this.status = status;
                this.retryAfterMs = retryAfterMs;
            }
        }

        function abortError() {
            return new DOMException('Aborted', 'AbortError');
        }

        function isAbortError(error) {
            return Boolean(error) && error.name === 'AbortError';
        }

        function sleep(ms, signal) {
            return new Promise((resolve, reject) => {
                if (signal && signal.aborted) {
                    reject(abortError());
                    return;
                }
                const onAbort = () => {
                    clearTimeout(timer);
                    reject(abortError());
                };
                const timer = setTimeout(() => {
                    if (signal) signal.removeEventListener('abort', onAbort);
                    resolve();
                }, ms);
                if (signal) signal.addEventListener('abort', onAbort, { once: true });
            });
        }

        function delay(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        function parseRetryAfter(value) {
            if (!value) return null;
            const seconds = Number(value);
            if (Number.isFinite(seconds)) return seconds * 1000;
            const date = Date.parse(value);
            return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
        }

        // `priority` is a Fetch Priority hint: counts for the page pixiv waits for go
        // first, background work gives way to pixiv's own images. A request cut off by
        // FETCH_TIMEOUT_MS fails like a dropped connection, so withRetry retries it.
        async function fetchJson(url, { signal, credentials = 'same-origin', priority } = {}) {
            const controller = new AbortController();
            let timedOut = false;
            const timer = setTimeout(() => {
                timedOut = true;
                controller.abort();
            }, FETCH_TIMEOUT_MS);
            const onAbort = () => controller.abort();
            if (signal) {
                if (signal.aborted) controller.abort();
                else signal.addEventListener('abort', onAbort, { once: true });
            }
            try {
                const init = { signal: controller.signal, credentials, headers: { Accept: 'application/json' } };
                if (priority) init.priority = priority;
                const response = await nativeFetch.call(window, url, init);
                let json = null;
                try {
                    json = await response.json();
                } catch (e) {
                    if (isAbortError(e)) throw e;
                }
                if (!response.ok || !json || json.error) {
                    throw new HttpError(
                        response.ok ? 0 : response.status,
                        (json && json.message) || `HTTP ${response.status}`,
                        parseRetryAfter(response.headers.get('Retry-After')),
                    );
                }
                return json.body;
            } catch (error) {
                if (timedOut) throw new TypeError('Request timed out');
                throw error;
            } finally {
                clearTimeout(timer);
                if (signal) signal.removeEventListener('abort', onAbort);
            }
        }

        // Spaces out request starts, backs off on 403/429 and speeds up again once
        // requests have been succeeding for a while. Shared by all workers of a ranking.
        // onSlowDown/onSpeedUp let the ranking adjust its concurrency the same way
        // (additive increase, multiplicative decrease, as in TCP).
        class RateLimiter {
            constructor(minIntervalMs) {
                this.minIntervalMs = minIntervalMs;
                this.intervalMs = minIntervalMs;
                this.nextStart = 0;
                this.cooldownUntil = 0;
                this.successStreak = 0;
                this.onSlowDown = null;
                this.onSpeedUp = null;
            }

            async waitForSlot(signal) {
                for (;;) {
                    const now = Date.now();
                    const start = Math.max(now, this.nextStart, this.cooldownUntil);
                    this.nextStart = start + this.intervalMs;
                    if (start <= now) return;
                    await sleep(start - now, signal);
                    // A throttle response may have started a cooldown while we slept.
                    if (Date.now() >= this.cooldownUntil) return;
                }
            }

            onSuccess() {
                this.successStreak++;
                if (this.successStreak >= SUCCESSES_BEFORE_SPEEDUP) {
                    this.successStreak = 0;
                    this.intervalMs = Math.max(this.minIntervalMs, Math.round(this.intervalMs * INTERVAL_SPEEDUP_FACTOR));
                    if (this.onSpeedUp) this.onSpeedUp();
                }
            }

            onThrottled(delayMs) {
                this.successStreak = 0;
                const now = Date.now();
                // Parallel workers usually hit the limit together: count that as one event.
                if (now >= this.cooldownUntil) {
                    this.intervalMs = Math.min(Math.max(this.intervalMs * 2, INTERVAL_MIN_BACKOFF_MS), INTERVAL_CAP_MS);
                    if (this.onSlowDown) this.onSlowDown();
                }
                this.cooldownUntil = Math.max(this.cooldownUntil, now + delayMs);
            }
        }

        async function withRetry(task, limiter, signal) {
            let backoffMs = BACKOFF_START_MS;
            let failures = 0;
            let throttles = 0;
            for (;;) {
                await limiter.waitForSlot(signal);
                try {
                    const result = await task();
                    limiter.onSuccess();
                    return result;
                } catch (error) {
                    if (isAbortError(error) || signal.aborted) throw abortError();
                    const status = error instanceof HttpError ? error.status : 0;
                    const throttled = status === 403 || status === 429;
                    const retriable = throttled || status >= 500 || error instanceof TypeError;
                    // Throttling is no fault of the request (the first one in line after
                    // each cooldown meets it again), so it waits and is retried more often
                    // than real failures.
                    if (!retriable || (throttled ? ++throttles > MAX_THROTTLED_RETRIES : ++failures > MAX_RETRIES)) throw error;
                    const delayMs = error.retryAfterMs != null
                        ? Math.max(1000, error.retryAfterMs)
                        : Math.min(backoffMs, BACKOFF_CAP_MS) + Math.random() * 1000;
                    backoffMs *= 2;
                    if (throttled) {
                        limiter.onThrottled(delayMs);
                    } else {
                        await sleep(delayMs, signal);
                    }
                }
            }
        }

        // ---------------------------------------------------------------------
        // Search requests: parsing pixiv's own request and deriving our own
        // ---------------------------------------------------------------------

        function toUrl(input) {
            try {
                const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input && input.url;
                return raw ? new URL(raw, location.href) : null;
            } catch (e) {
                return null;
            }
        }

        function parseSearchRequest(url) {
            if (!url || url.origin !== location.origin) return null;
            const match = /^\/ajax\/search\/(artworks|illustrations|manga)\/([^/]+)$/.exec(url.pathname);
            if (!match) return null;
            let word;
            try {
                word = decodeURIComponent(match[2]);
            } catch (e) {
                return null;
            }
            if (!word) return null;
            const params = new URLSearchParams(url.search);
            const filters = new URLSearchParams(params);
            for (const name of ['order', 'p', 'lang', 'word']) filters.delete(name);
            filters.sort();
            return {
                kind: match[1],
                field: RESULT_FIELDS[match[1]],
                word,
                order: params.get('order') || 'date_d',
                page: Math.max(1, parseInt(params.get('p'), 10) || 1),
                lang: params.get('lang'),
                filters,
                key: `${match[1]}|${word}|${filters}`,
            };
        }

        function buildSearchUrl(req, word, page, sMode) {
            const params = new URLSearchParams(req.filters);
            params.set('word', word);
            params.set('order', 'date_d');
            params.set('p', String(page));
            if (sMode) params.set('s_mode', sMode);
            if (req.lang) params.set('lang', req.lang);
            return `/ajax/search/${req.kind}/${encodeURIComponent(word)}?${params}`;
        }

        // "word 10000users入り" or "word (30000users入り OR 20000users入り)". A single
        // term must not be wrapped in parentheses (pixiv then searches for the literal
        // "(word)"), but an OR query must be.
        function tierWord(word, group) {
            const base = /\sOR\s/i.test(word) ? `(${word})` : word;
            const tags = group.map((tier) => `${tier}users入り`);
            return `${base} ${tags.length > 1 ? `(${tags.join(' OR ')})` : tags[0]}`;
        }

        // Plain AND queries ("a b -c") can be checked against a work's tag list; queries
        // with OR or parentheses are left to pixiv's own matching.
        function parseQueryTerms(word) {
            if (/[()]|\sOR\s/i.test(word)) return null;
            const terms = word.split(/\s+/).filter(Boolean);
            const include = terms.filter((term) => !term.startsWith('-'));
            const exclude = terms.filter((term) => term.startsWith('-') && term.length > 1).map((term) => term.slice(1));
            return include.length ? { include, exclude } : null;
        }

        function normalizeTag(text) {
            return String(text).normalize('NFKC').toLowerCase();
        }

        function matchesQuery(item, terms, exact) {
            const tags = (Array.isArray(item.tags) ? item.tags : []).map(normalizeTag);
            const title = normalizeTag(item.title || '');
            const has = (term) => {
                const needle = normalizeTag(term);
                return exact ? tags.includes(needle) : tags.some((tag) => tag.includes(needle)) || title.includes(needle);
            };
            return terms.include.every(has) && !terms.exclude.some(has);
        }

        // The highest users入り milestone in a work's own tags, e.g. 10000 for
        // "魔女の旅々10000users入り": a free lower bound before its exact count is known.
        function tagFloor(item) {
            let floor = 0;
            for (const tag of Array.isArray(item.tags) ? item.tags : []) {
                const match = /(\d+)users入り/.exec(String(tag));
                if (match) floor = Math.max(floor, Number(match[1]));
            }
            return floor;
        }

        // How tier queries are searched. Many milestone tags carry the series name
        // ("魔女の旅々100000users入り"), which an exact tag search never matches; so for
        // exact searches the tiers are searched by partial tag match and every work is
        // checked against the exact tags here.
        function tierPlan(req) {
            const mode = req.filters.get('s_mode') || 's_tag';
            // s_tc searches titles/captions only, so tier tags would never match.
            if (mode === 's_tc' || /\d+users入り/i.test(req.word)) return null;
            if (mode !== 's_tag_full') return { sMode: null, terms: null };
            const terms = parseQueryTerms(req.word);
            return terms ? { sMode: 's_tag_only', terms } : { sMode: null, terms: null };
        }

        function seedsApplicable(req) {
            return SEED_BLOCKING_FILTERS.every((name) => !req.filters.get(name));
        }

        function checkableFilters(req) {
            return UNCHECKABLE_FILTERS.every((name) => !req.filters.get(name));
        }

        function matchesModeFilters(item, req) {
            const mode = req.filters.get('mode');
            if (mode === 'safe' && item.xRestrict > 0) return false;
            if (mode === 'r18' && !(item.xRestrict > 0)) return false;
            if (req.filters.get('ai_type') === '1' && item.aiType === 2) return false;
            return true;
        }

        function matchesDateFilters(item, req) {
            const day = String(item.createDate || '').slice(0, 10);
            const from = req.filters.get('scd');
            const to = req.filters.get('ecd');
            if (!day) return !from && !to;
            return (!from || day >= from) && (!to || day <= to);
        }

        // Works from recommendations or harvested ids are not filtered by
        // pixiv's search, so the search conditions are checked here.
        function matchesSearch(item, req, terms) {
            const mode = req.filters.get('s_mode') || 's_tag';
            return Boolean(terms) && matchesQuery(item, terms, mode === 's_tag_full')
                && matchesModeFilters(item, req) && matchesDateFilters(item, req);
        }

        function isUsableItem(item) {
            return Boolean(item) && Boolean(item.id) && !item.isAdContainer && !item.isMasked;
        }

        function readSearchBlock(body, field) {
            const block = body && body[field];
            if (!block || !Array.isArray(block.data)) return null;
            // Only the long-term part of pixiv's "popular" preview: its "recent" part
            // holds new works with a few hundred bookmarks.
            const permanent = ((body.popular && body.popular.permanent) || []).filter(isUsableItem);
            return {
                items: block.data.filter(isUsableItem),
                total: Number(block.total) || 0,
                lastPage: Number(block.lastPage) || 0,
                seeds: permanent,
                permanentIds: permanent.map((item) => String(item.id)),
            };
        }

        async function getSearchPage(url, field, signal, priority) {
            const page = readSearchBlock(await fetchJson(url, { signal, priority }), field);
            if (!page) throw new HttpError(0, 'Unexpected search response');
            return page;
        }

        // Search pages by URL, in memory and in IndexedDB. Searches are what pixiv limits
        // most, so switching between "Newest" and "Popular", coming back to a search,
        // reloading it in another sort order or opening it in a second tab repeats none.
        const listingCache = {
            map: new Map(),

            get(url) {
                const entry = this.map.get(url);
                if (!entry || Date.now() - entry.at >= LISTING_CACHE_TTL_MS) return null;
                return entry.page;
            },

            remember(url, entry) {
                this.map.delete(url);
                this.map.set(url, entry);
                if (this.map.size > LISTING_CACHE_MAX) this.map.delete(this.map.keys().next().value);
            },

            // From memory, else from IndexedDB (another tab, an earlier load), else null.
            async load(url) {
                const page = this.get(url);
                if (page) return page;
                const db = await database.open();
                const entry = db && await database.request(db, LISTING_STORE, 'readonly', (store) => store.get(url));
                if (!entry || !entry.page || Date.now() - entry.at >= LISTING_CACHE_TTL_MS) return null;
                this.remember(url, { at: entry.at, page: entry.page });
                return entry.page;
            },

            set(url, page) {
                const at = Date.now();
                this.remember(url, { at, page });
                database.open().then((db) => db && database.request(db, LISTING_STORE, 'readwrite', (store) => store.put({ url, at, page })));
            },

            clear() {
                this.map.clear();
                database.open().then((db) => db && database.request(db, LISTING_STORE, 'readwrite', (store) => store.clear()));
            },
        };

        // pixiv's mobile site returns the same counts as /ajax/illust/{id} in a third of
        // the payload (12 KB instead of 39 KB, no list of the author's other works), and
        // without the session, R-18 works included. If it stops answering in that
        // shape, the desktop endpoint takes over for the rest of the visit.
        const touchStats = { working: true, misses: 0 };

        function isThrottle(error) {
            return error instanceof TypeError || (error instanceof HttpError && (error.status === 403 || error.status === 429 || error.status >= 500));
        }

        // Counts plus the upload time (createdAt, ms), which decides how long they are kept.
        async function getTouchStats(id, signal, priority) {
            const body = await fetchJson(`/touch/ajax/illust/details?illust_id=${encodeURIComponent(id)}`, { signal, credentials: 'omit', priority });
            const details = body && body.illust_details;
            if (!details || details.bookmark_user_total == null) return null;
            return {
                bookmarkCount: Number(details.bookmark_user_total) || 0,
                likeCount: Number(details.rating_count) || 0,
                viewCount: Number(details.rating_view) || 0,
                createdAt: (Number(details.upload_timestamp) || 0) * 1000,
            };
        }

        async function getIllustStats(item, signal, priority) {
            if (touchStats.working) {
                try {
                    const stats = await getTouchStats(item.id, signal, priority);
                    if (stats) {
                        touchStats.misses = 0;
                        return stats;
                    }
                } catch (error) {
                    // Throttling is retried as a whole; anything else (a deleted work, a
                    // changed endpoint) is asked of the desktop endpoint below.
                    if (isAbortError(error) || isThrottle(error)) throw error;
                }
            }
            // Public stats don't need the session; R-18 works are only visible when logged in.
            const credentials = item.xRestrict > 0 ? 'same-origin' : 'omit';
            const body = await fetchJson(`/ajax/illust/${encodeURIComponent(item.id)}`, { signal, credentials, priority });
            // The desktop endpoint knew a work the mobile one didn't: after a few of
            // those in a row, the mobile endpoint is considered changed.
            if (touchStats.working && ++touchStats.misses >= 5) touchStats.working = false;
            return {
                bookmarkCount: Number(body.bookmarkCount) || 0,
                likeCount: Number(body.likeCount) || 0,
                viewCount: Number(body.viewCount) || 0,
                createdAt: Date.parse(body.uploadDate || body.createDate || '') || 0,
            };
        }

        // Works in pixiv's search format for up to 100 ids per request.
        async function getWorksByIds(ids, signal, priority) {
            const query = ids.map((id) => `illust_ids%5B%5D=${encodeURIComponent(id)}`).join('&');
            const body = await fetchJson(`/ajax/illust/recommend/illusts?${query}`, { signal, priority });
            return (body && Array.isArray(body.illusts) ? body.illusts : []).filter(isUsableItem);
        }

        async function getRecommendations(id, signal, priority) {
            const body = await fetchJson(`/ajax/illust/${encodeURIComponent(id)}/recommend/init?limit=180`, { signal, priority });
            return (body && Array.isArray(body.illusts) ? body.illusts : []).filter(isUsableItem);
        }

        // ---------------------------------------------------------------------
        // Work lists: an artist's works and a user's bookmarks
        // ---------------------------------------------------------------------

        // /users/{id}/artworks|illustrations|manga[/tag] and /users/{id}/bookmarks/artworks
        // [/tag], with or without a language prefix (/en/users/...).
        function listPage(href) {
            let url;
            try {
                url = new URL(href, location.href);
            } catch (e) {
                return null;
            }
            const match = /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/users\/(\d+)\/(artworks|illustrations|manga|bookmarks\/artworks)(?:\/[^/]+)?\/?$/i.exec(url.pathname);
            if (!match) return null;
            return {
                uid: match[1],
                section: match[2].startsWith('bookmarks') ? 'bookmarks' : 'works',
                popular: url.searchParams.get(LIST_SORT_PARAM) === LIST_SORT_VALUE,
                url,
            };
        }

        // pixiv's requests for the works of a list page in popular order:
        // { kind: 'ids' } when an artist's works are asked for by id (pixiv takes the ids
        // from the profile summary, newest first), { kind: 'offset' } for one of their
        // tags or for bookmarks (pixiv pages those by offset).
        function parseListRequest(url, page) {
            if (!url || url.origin !== location.origin || !page || !page.popular) return null;
            const params = new URLSearchParams(url.search);
            let match = /^\/ajax\/user\/(\d+)\/profile\/illusts$/.exec(url.pathname);
            if (match) {
                const ids = params.getAll('ids[]');
                if (match[1] !== page.uid || page.section !== 'works' || !ids.length) return null;
                const category = params.get('work_category') || 'illustManga';
                for (const name of ['ids[]', 'is_first_page', 'work_category']) params.delete(name);
                params.sort();
                return { kind: 'ids', key: `ids|${match[1]}|${category}|${params}`, uid: match[1], category, params, ids, url };
            }
            match = /^\/ajax\/user\/(\d+)\/(?:(?:illustmanga|illusts|manga)\/tag|illusts\/bookmarks)$/.exec(url.pathname);
            if (!match || match[1] !== page.uid) return null;
            if ((page.section === 'bookmarks') !== url.pathname.endsWith('/bookmarks')) return null;
            const offset = Math.max(0, parseInt(params.get('offset'), 10) || 0);
            const limit = Math.max(0, parseInt(params.get('limit'), 10) || 0);
            params.delete('offset');
            params.delete('limit');
            params.sort();
            return { kind: 'offset', key: `offset|${url.pathname}|${params}`, uid: match[1], path: url.pathname, params, offset, limit };
        }

        // An artist's work ids of one category, from pixiv's profile summary.
        async function getProfileIds(list, signal, priority) {
            const body = await fetchJson(`/ajax/user/${list.uid}/profile/all?${list.params}`, { signal, priority });
            const ids = (field) => Object.keys((body && body[field]) || {});
            if (list.category === 'illust') return ids('illusts');
            if (list.category === 'manga') return ids('manga');
            return ids('illusts').concat(ids('manga'));
        }

        // Up to 100 of an artist's works by id, in pixiv's profile format.
        async function getProfileWorks(list, ids, signal, priority) {
            const query = ids.map((id) => `ids%5B%5D=${encodeURIComponent(id)}`).join('&');
            const body = await fetchJson(`/ajax/user/${list.uid}/profile/illusts?${query}&work_category=${list.category}&is_first_page=0&${list.params}`, { signal, priority });
            const works = (body && body.works) || {};
            return ids.map((id) => works[id]).filter(isUsableItem);
        }

        // One page of a tag list or of bookmarks. Bookmarks of deleted or hidden works
        // come back masked; they are kept (at the end), so pixiv's page count still fits.
        async function getListPage(list, offset, signal, priority) {
            const params = new URLSearchParams(list.params);
            params.set('offset', String(offset));
            params.set('limit', String(LIST_BATCH));
            const body = await fetchJson(`${list.path}?${params}`, { signal, priority });
            const works = body && Array.isArray(body.works) ? body.works : [];
            return { works: works.filter((work) => work && work.id), total: Number(body && body.total) || 0 };
        }

        function jsonResponse(json) {
            return new Response(JSON.stringify(json), {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        }

        // ---------------------------------------------------------------------
        // IndexedDB (shared by all tabs): counts and search pages
        // ---------------------------------------------------------------------

        // One database, opened once, when a popular page first needs it. Without
        // IndexedDB (some private modes) everything just stays in memory.
        const database = {
            opening: null,

            open() {
                if (!this.opening) {
                    this.opening = new Promise((resolve) => {
                        let request;
                        let settled = false;
                        // A database that opens after we gave up is closed again, so it
                        // doesn't block another tab's upgrade.
                        const finish = (db) => {
                            if (settled) {
                                if (db) db.close();
                                return;
                            }
                            settled = true;
                            resolve(db);
                        };
                        try {
                            request = indexedDB.open(STATS_DB, STATS_DB_VERSION);
                        } catch (e) {
                            finish(null);
                            return;
                        }
                        request.onupgradeneeded = () => {
                            const db = request.result;
                            if (!db.objectStoreNames.contains(STATS_STORE)) db.createObjectStore(STATS_STORE, { keyPath: 'id' }).createIndex('at', 'at');
                            if (!db.objectStoreNames.contains(LISTING_STORE)) db.createObjectStore(LISTING_STORE, { keyPath: 'url' }).createIndex('at', 'at');
                        };
                        request.onsuccess = () => {
                            const db = request.result;
                            if (settled) {
                                db.close();
                                return;
                            }
                            // A newer version of the script in another tab may upgrade it,
                            // or the browser may delete it; a later open() starts over.
                            db.onversionchange = () => {
                                db.close();
                                this.opening = null;
                            };
                            this.dropExpiredListings(db);
                            finish(db);
                        };
                        request.onerror = () => finish(null);
                        // An older tab holding the database usually closes it at once
                        // (onversionchange); one that doesn't must not hold this tab up.
                        request.onblocked = () => setTimeout(() => finish(null), DB_BLOCKED_WAIT_MS);
                    });
                }
                return this.opening;
            },

            // One request in its own transaction; resolves with its result (or null).
            request(db, storeName, mode, make) {
                return new Promise((resolve) => {
                    try {
                        const request = make(db.transaction(storeName, mode).objectStore(storeName));
                        request.onsuccess = () => resolve(request.result);
                        request.onerror = () => resolve(null);
                    } catch (e) {
                        // The database went away (cleared by the browser).
                        resolve(null);
                    }
                });
            },

            dropExpiredListings(db) {
                try {
                    const index = db.transaction(LISTING_STORE, 'readwrite').objectStore(LISTING_STORE).index('at');
                    index.openCursor(IDBKeyRange.upperBound(Date.now() - LISTING_CACHE_TTL_MS)).onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (!cursor) return;
                        cursor.delete();
                        cursor.continue();
                    };
                } catch (e) {
                    // Nothing to clean.
                }
            },
        };

        // How long a work's counts are kept, by its age (see STATS_TTL_MS).
        function statsTtl(createdAt, now) {
            const age = createdAt > 0 ? now - createdAt : 0;
            return age > 365 * DAY_MS ? STATS_TTL_MAX_MS : age > 30 * DAY_MS ? 3 * DAY_MS : STATS_TTL_MS;
        }

        // Views, likes and bookmarks of each work. IndexedDB takes them one record at a
        // time in the background, where localStorage would rewrite one big value on the
        // main thread. They are read into memory once, when a popular page first needs
        // them, and counts fetched in other tabs arrive over a BroadcastChannel.
        const statsCache = {
            map: new Map(),
            db: null,
            loading: null,
            loaded: false,
            pending: new Map(),
            flushTimer: null,
            channel: null,

            load() {
                if (!this.loading) {
                    this.listen();
                    this.loading = database.open()
                        .then((db) => {
                            this.db = db;
                            return db && this.readAll(db);
                        })
                        .catch(() => {})
                        .then(() => {
                            this.loaded = true;
                            this.flush();
                        });
                }
                return this.loading;
            },

            listen() {
                if (this.channel || typeof BroadcastChannel !== 'function') return;
                try {
                    this.channel = new BroadcastChannel(STATS_CHANNEL);
                    this.channel.onmessage = (event) => {
                        for (const record of Array.isArray(event.data) ? event.data : []) this.keep(record);
                    };
                } catch (e) {
                    this.channel = null;
                }
            },

            // A record from IndexedDB or another tab, unless it is expired or older than ours.
            keep(record) {
                if (!record || record.id == null) return;
                const now = Date.now();
                if (now - record.at >= statsTtl(record.c, now)) return false;
                const known = this.map.get(record.id);
                if (!known || known[3] < record.at) this.map.set(record.id, [record.b, record.l, record.v, record.at, record.c || 0]);
                return true;
            },

            // Fresh counts go to memory; expired ones are deleted in the same pass.
            readAll(db) {
                return new Promise((resolve) => {
                    const tx = db.transaction(STATS_STORE, 'readwrite');
                    const store = tx.objectStore(STATS_STORE);
                    store.getAll().onsuccess = (event) => {
                        for (const record of event.target.result) {
                            if (this.keep(record) === false) store.delete(record.id);
                        }
                    };
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                    tx.onabort = () => resolve();
                });
            },

            get(id) {
                const entry = this.map.get(id);
                if (!entry) return null;
                const now = Date.now();
                if (now - entry[3] >= statsTtl(entry[4], now)) {
                    this.map.delete(id);
                    return null;
                }
                return { bookmarkCount: entry[0], likeCount: entry[1], viewCount: entry[2], createdAt: entry[4] };
            },

            set(id, stats) {
                const at = Date.now();
                const createdAt = stats.createdAt || 0;
                this.map.set(id, [stats.bookmarkCount, stats.likeCount, stats.viewCount, at, createdAt]);
                this.pending.set(id, { id, b: stats.bookmarkCount, l: stats.likeCount, v: stats.viewCount, at, c: createdAt });
                if (!this.flushTimer) {
                    this.flushTimer = setTimeout(() => {
                        this.flushTimer = null;
                        this.flush();
                    }, STATS_FLUSH_MS);
                }
            },

            // Counts that arrived since the last flush: to the other tabs, and to
            // IndexedDB in one transaction.
            flush() {
                // Kept until the cache has loaded, then sent and stored once.
                if (!this.pending.size || (!this.db && !this.loaded)) return;
                const records = [...this.pending.values()];
                if (this.channel) {
                    try {
                        this.channel.postMessage(records);
                    } catch (e) {
                        // The other tabs fetch them themselves.
                    }
                }
                if (!this.db) {
                    this.pending.clear();
                    return;
                }
                try {
                    const store = this.db.transaction(STATS_STORE, 'readwrite').objectStore(STATS_STORE);
                    for (const record of records) store.put(record);
                } catch (e) {
                    // The database went away (cleared by the browser): counts stay in memory.
                }
                this.pending.clear();
            },

            clear() {
                this.map.clear();
                this.pending.clear();
                if (!this.db) return;
                try {
                    this.db.transaction(STATS_STORE, 'readwrite').objectStore(STATS_STORE).clear();
                } catch (e) {
                    // Nothing to clear.
                }
            },
        };

        // Ids from pixiv's rotating "popular" preview, collected per tag over time.
        const popularPool = {
            data: null,

            load() {
                if (this.data) return this.data;
                const raw = readJson(POPULAR_POOL_KEY, {});
                const now = Date.now();
                this.data = {};
                for (const [tag, entry] of Object.entries(raw && typeof raw === 'object' ? raw : {})) {
                    if (entry && Array.isArray(entry.ids) && now - entry.at < POPULAR_POOL_TTL_MS) this.data[tag] = entry;
                }
                return this.data;
            },

            get(tag) {
                const entry = this.load()[normalizeTag(tag)];
                return entry ? entry.ids.slice() : [];
            },

            add(tag, ids) {
                if (!ids.length) return;
                // Re-read first, so ids another tab stored meanwhile are kept.
                this.data = null;
                const data = this.load();
                const key = normalizeTag(tag);
                const merged = [...new Set([...ids.map(String), ...(data[key] ? data[key].ids : [])])].slice(0, POPULAR_POOL_PER_TAG);
                delete data[key];
                data[key] = { at: Date.now(), ids: merged };
                const keys = Object.keys(data);
                for (const old of keys.slice(0, Math.max(0, keys.length - POPULAR_POOL_TAGS))) delete data[old];
                writeJson(POPULAR_POOL_KEY, data);
            },

            clear() {
                this.data = {};
                try {
                    localStorage.removeItem(POPULAR_POOL_KEY);
                } catch (e) {
                    // Nothing to clear.
                }
            },
        };

        // ---------------------------------------------------------------------
        // Ranking engines
        // ---------------------------------------------------------------------

        // Order in which exact counts are fetched, so the top of the page is right
        // first: works from "popular" previews, then recommendation-graph candidates,
        // then works by milestone. Lookahead works may carry a stale tag, so they
        // rank as if their milestone were three times higher. Within one milestone R-18
        // works go first: their tags lag further behind (in one 467-work tier all 24
        // works far above it were R-18, against 65% of the tier).
        function statsRank(item) {
            const floor = item.lookahead ? item.floor * 3 : item.floor;
            return (item.priority || 1) * 1e7 + floor + (item.xRestrict > 0 ? 1 : 0);
        }

        const INTERNAL_FIELDS = ['stats', 'statsFailed', 'floor', 'priority', 'lookahead', 'queued', 'batch', 'skipped', 'protected', 'pos', 'unviewable'];

        // ---------------------------------------------------------------------
        // The viewer's display settings
        // ---------------------------------------------------------------------

        // pixiv's own rules (its page code: isXRestrictViewable, isSensitiveViewable). A
        // work is shown when it is all-ages, the viewer allows R-18G, or its level is the
        // one the viewer allows; and when the viewer shows sensitive works or the work's
        // sanity level is White (2). pixiv's client hides other works when it renders a
        // list, also ones its server sent (an artist's AI works), and works from sources
        // the server doesn't filter (works loaded by id) would slip in otherwise.
        const SANITY_WHITE = 2;

        function canView(item, rules) {
            if (!rules) return true;
            if (rules.hideAi && item.aiType === 2) return false;
            const level = Number(item.xRestrict) || 0;
            if (!(level === 0 || rules.xRestrict === 2 || (rules.xRestrict !== 0 && level === rules.xRestrict))) return false;
            if (!rules.sensitive && item.sl != null && Number(item.sl) !== SANITY_WHITE) return false;
            if (rules.mutedUsers.size && rules.mutedUsers.has(String(item.userId))) return false;
            if (rules.mutedTags.size && Array.isArray(item.tags) && item.tags.some((tag) => rules.mutedTags.has(String(tag)))) return false;
            return true;
        }

        // The settings come from pixiv's own copy in the page (Redux userData.self:
        // hideAiWorks, xRestrict, isSensitiveViewable) and the mute list from pixiv's
        // mute settings ({type: 'tag' | 'user', value}), read once per page. Logged out
        // (no settings in the page) nothing is filtered: pixiv's server does that.
        const viewer = {
            mutes: null,

            async rules() {
                const store = premiumView.findStore();
                const self = store && selfOf(store);
                if (!self) return null;
                if (!this.mutes) {
                    this.mutes = fetchJson('/ajax/mute/items?context=setting')
                        .then((body) => (body && Array.isArray(body.mute_items) ? body.mute_items : []))
                        .catch(() => []);
                }
                const mutes = (await this.mutes).filter((item) => item && item.enabled !== false && item.value != null);
                return {
                    hideAi: self.hideAiWorks === true,
                    xRestrict: Number(self.xRestrict) || 0,
                    sensitive: self.isSensitiveViewable !== false,
                    mutedTags: new Set(mutes.filter((item) => item.type === 'tag').map((item) => String(item.value))),
                    mutedUsers: new Set(mutes.filter((item) => item.type === 'user').map((item) => String(item.value))),
                };
            },
        };

        // Runs fn over items with at most `limit` calls in flight. After a failure no
        // new calls start; the ones in flight finish.
        async function mapLimit(items, limit, fn) {
            let next = 0;
            let failed = false;
            const worker = async () => {
                while (!failed && next < items.length) {
                    try {
                        await fn(items[next++]);
                    } catch (error) {
                        failed = true;
                        throw error;
                    }
                }
            };
            await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
        }

        function stripInternal(item) {
            const copy = Object.assign({}, item);
            for (const name of INTERNAL_FIELDS) delete copy[name];
            return copy;
        }

        // Inserts a number into a list kept in descending order.
        function insertDesc(list, value) {
            let lo = 0;
            let hi = list.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (list[mid] >= value) lo = mid + 1;
                else hi = mid;
            }
            list.splice(lo, 0, value);
        }

        // What both rankings share: one prioritized queue of exact counts, threshold
        // pruning, and the soft deadline that decides when a waited page is served.
        class Ranking {
            constructor(key, options) {
                this.key = key;
                this.sort = options.sort;
                this.metric = METRICS[options.sort] || METRICS[DEFAULT_SETTINGS.sort];
                this.concurrency = options.concurrency;
                this.statsLimiter = new RateLimiter(options.minIntervalMs);
                // Requests in flight: halved when pixiv throttles, one more after each
                // run of successes, up to the setting.
                this.limit = options.concurrency;
                this.statsLimiter.onSlowDown = () => {
                    this.limit = Math.max(1, Math.floor(this.limit / 2));
                };
                this.statsLimiter.onSpeedUp = () => {
                    if (this.limit >= this.concurrency) return;
                    this.limit++;
                    this.pumpStats();
                };
                this.controller = new AbortController();
                this.ranked = [];
                // The chunk being built (search): its counts already set the threshold.
                this.building = [];
                this.served = 0;
                this.state = { phase: 'listing', done: 0, total: 0, failed: 0, searches: 0, recs: 0, stats: 0, error: null };
                this.listeners = new Set();
                this.lastActivity = Date.now();
                this.statsQueue = [];
                this.statsActive = 0;
                this.pendingStats = [];
                this.firstCountAt = 0;
                this.fetched = 0;
                // Threshold pruning: works needed so far, works whose count was skipped,
                // and the sorted-by count of every counted work, highest first.
                this.target = 0;
                this.skipped = [];
                this.counts = [];
                // That count per bookmark of the counted works, highest first.
                this.ratios = [];
                this.prefetchTimer = null;
                // The page pixiv is waiting for (shown by the progress line).
                this.waiting = 0;
                this.pageStarted = 0;
                this.waitStarted = 0;
                this.hurried = false;
                // Ties keep pixiv's own order (work lists).
                this.byScore = (a, b) => this.score(b) - this.score(a) || (a.pos || 0) - (b.pos || 0);
            }

            get signal() {
                return this.controller.signal;
            }

            // Fetch Priority: high while pixiv waits for a page, low for work ahead of it.
            get priority() {
                return this.waiting > 0 ? 'high' : 'low';
            }

            abort() {
                clearTimeout(this.prefetchTimer);
                this.controller.abort();
                for (const item of this.statsQueue.splice(0)) item.batch.reject(abortError());
            }

            emit() {
                for (const listener of this.listeners) listener(this);
            }

            touch() {
                this.lastActivity = Date.now();
            }

            // "Show now": serve the page as soon as it is filled, with the works whose
            // counts are still missing placed by estimate.
            hurry() {
                this.hurried = true;
                this.emit();
            }

            // Expected time until the waited page is served, or null while still listing.
            pageEta(now) {
                if (!this.waitStarted) return null;
                const waited = now - this.waitStarted;
                const hardLeft = PAGE_MAX_WAIT_MS + PAGE_GRACE_MS - waited;
                const counts = this.countsEta(now);
                return Math.max(0, counts <= hardLeft ? counts : PAGE_MAX_WAIT_MS - waited);
            }

            // `wait.done` is set once the page is served, also when the counts won the
            // race, so the loop doesn't keep polling after it.
            async untilStalled(wait) {
                const started = Date.now();
                this.waitStarted = started;
                this.emit();
                for (;;) {
                    if (this.hurried || wait.done) return;
                    await delay(250);
                    if (wait.done) return;
                    const now = Date.now();
                    const left = PAGE_MAX_WAIT_MS + PAGE_GRACE_MS - (now - started);
                    if (now - this.lastActivity >= PAGE_STALL_MS || left <= 0 || this.signal.aborted) return;
                    if (left < PAGE_GRACE_MS && this.countsEta(now) > left) return;
                }
            }

            countsEta(now) {
                const queued = this.statsQueue.length + this.statsActive;
                const rate = this.fetched / Math.max(1, now - this.firstCountAt);
                return queued === 0 ? 0 : rate > 0 ? queued / rate : Infinity;
            }

            // ---- The sorted-by count (see METRICS) ---------------------------------

            ratioAt(quantile, fallback) {
                const list = this.ratios;
                return list.length < RATIO_SAMPLE_MIN ? fallback : list[Math.floor((1 - quantile) * (list.length - 1))];
            }

            // The count a users入り milestone stands for.
            floorScore(floor) {
                return floor > 0 ? floor * this.ratioAt(0.5, this.metric.perBookmark) : 0;
            }

            // The exact count once fetched; until then (or if the fetch fails) an estimate
            // from the milestone. Masked works (deleted or hidden bookmarks) go last, and
            // after them the works the viewer's settings hide (lists only, see canView).
            score(item) {
                if (item.unviewable) return -2;
                if (item.stats) return item.stats[this.metric.field];
                return item.isMasked ? -1 : this.floorScore(item.floor);
            }

            // Every count is noted once, for the threshold and for the ratio to bookmarks
            // (when the work has enough bookmarks for a meaningful ratio).
            noteStats(stats) {
                const value = stats[this.metric.field] || 0;
                insertDesc(this.counts, value);
                if (stats.bookmarkCount >= 50 && value > 0) insertDesc(this.ratios, value / stats.bookmarkCount);
            }

            // A work of this ranking, with its cached count if there is one.
            prepare(item, floor = 0, flags = null) {
                const id = String(item.id);
                const taken = Object.assign({}, item, flags, {
                    id,
                    stats: item.isMasked ? null : statsCache.get(id),
                    statsFailed: false,
                    floor: Math.max(floor || 0, tagFloor(item)),
                });
                // Works the viewer's settings hide go last and must not raise the threshold.
                if (taken.stats && !taken.unviewable) this.noteStats(taken.stats);
                return taken;
            }

            // ---- Threshold pruning ------------------------------------------------
            // As in top-k "threshold algorithms": a work listed under a milestone has at
            // most about STALE_FACTOR times that many bookmarks and, in views or likes, a
            // high quantile of their ratio to bookmarks times those. Once `target` works
            // (the pages asked for so far) are known to have more, its count can't change
            // those pages and is skipped; a deeper page brings it back. Works without a
            // milestone, from the popular previews or protected by the graph are always
            // counted.

            // The count of the target-th best work counted so far (0 before).
            threshold() {
                return this.target > 0 && this.counts.length >= this.target ? this.counts[this.target - 1] : 0;
            }

            bound(item) {
                const ratio = Math.max(this.metric.minBound, this.ratioAt(RATIO_BOUND_QUANTILE, this.metric.bound));
                return item.floor * STALE_FACTOR * ratio;
            }

            canSkip(item) {
                if ((item.priority || 1) > 1 || item.protected || !(item.floor > 0)) return false;
                const threshold = this.threshold();
                return threshold > 0 && this.bound(item) <= threshold;
            }

            skip(item) {
                item.skipped = true;
                this.skipped.push(item);
                this.state.done++;
                if (--item.batch.left === 0) item.batch.resolve();
            }

            // Drops queued works that the risen threshold makes unnecessary, so the
            // time estimate only counts requests that will really be made.
            sweepQueue() {
                this.statsQueue = this.statsQueue.filter((item) => {
                    if (!this.canSkip(item)) return true;
                    this.skip(item);
                    return false;
                });
            }

            requeueSkipped() {
                const back = [];
                this.skipped = this.skipped.filter((item) => {
                    if (this.canSkip(item)) return true;
                    back.push(item);
                    return false;
                });
                for (const item of back) {
                    item.skipped = false;
                    item.queued = false;
                }
                if (back.length) this.queueStats(back);
            }

            protect(item) {
                item.protected = true;
                if (!item.skipped) return;
                this.skipped = this.skipped.filter((other) => other !== item);
                item.skipped = false;
                item.queued = false;
                this.queueStats([item]);
            }

            // ---- Counts -----------------------------------------------------------

            // Counts are requested as soon as works are listed, so they load while the
            // next pages are still being fetched.
            queueStats(items) {
                const done = this.loadStats(items);
                done.catch(() => {});
                this.pendingStats.push(done);
            }

            // All counts go through one prioritized queue served by `concurrency` workers;
            // the returned promise settles when the given works are done.
            loadStats(items) {
                const pending = items.filter((item) => !item.stats && !item.queued && !item.isMasked && !item.unviewable);
                if (!pending.length) return Promise.resolve();
                this.state.phase = 'ranking';
                this.state.total += pending.length;
                this.emit();
                return new Promise((resolve, reject) => {
                    const batch = { left: pending.length, resolve, reject };
                    for (const item of pending) {
                        item.queued = true;
                        item.batch = batch;
                        this.statsQueue.push(item);
                    }
                    this.statsQueue.sort((a, b) => statsRank(b) - statsRank(a));
                    this.pumpStats();
                });
            }

            pumpStats() {
                while (this.statsActive < this.limit && this.statsQueue.length && !this.signal.aborted) {
                    const item = this.statsQueue.shift();
                    if (this.canSkip(item)) {
                        this.skip(item);
                        continue;
                    }
                    // Counted meanwhile by another tab or an earlier ranking.
                    const cached = statsCache.get(item.id);
                    if (cached) {
                        this.settle(item, cached);
                        continue;
                    }
                    this.statsActive++;
                    this.fetchStats(item).finally(() => {
                        this.statsActive--;
                        this.pumpStats();
                    });
                }
            }

            settle(item, stats) {
                item.stats = stats;
                this.noteStats(stats);
                this.state.done++;
                this.emit();
                if (--item.batch.left === 0) item.batch.resolve();
            }

            async fetchStats(item) {
                try {
                    this.state.stats++;
                    if (!this.firstCountAt) this.firstCountAt = Date.now();
                    item.stats = await withRetry(() => getIllustStats(item, this.signal, this.priority), this.statsLimiter, this.signal);
                    statsCache.set(item.id, item.stats);
                    this.noteStats(item.stats);
                    this.fetched++;
                    if (this.fetched % 20 === 0) this.sweepQueue();
                } catch (error) {
                    if (isAbortError(error)) {
                        item.batch.reject(error);
                        return;
                    }
                    item.statsFailed = true;
                    this.state.failed++;
                }
                this.state.done++;
                this.touch();
                this.emit();
                if (--item.batch.left === 0) item.batch.resolve();
            }

            // Waits for every queued count. The bound of a skipped work grows with the
            // ratio to bookmarks measured meanwhile (views, likes), so skipped works are
            // checked again each round and counted if they could now reach the pages.
            // Several callers can wait at once (two pages of a list asked for together),
            // so the counts each one waits for stay listed until they have settled.
            async countsSettled() {
                for (;;) {
                    this.requeueSkipped();
                    const pending = this.pendingStats.slice();
                    if (!pending.length) return;
                    await Promise.all(pending);
                    const settled = new Set(pending);
                    this.pendingStats = this.pendingStats.filter((done) => !settled.has(done));
                }
            }

            // A new "Parallel requests" setting applies to the running ranking too;
            // more requests come one at a time, as after a throttle.
            setConcurrency(concurrency) {
                this.concurrency = concurrency;
                this.limit = Math.min(this.limit, concurrency);
                this.pumpStats();
            }

            // Pages already handed to pixiv stay fixed; everything after them is re-sorted,
            // so a mis-tagged work still lands in the right place.
            resortTail() {
                const tail = this.ranked.slice(this.served).sort(this.byScore);
                this.ranked = this.ranked.slice(0, this.served).concat(tail);
            }

            // Answers one of pixiv's requests; `fetchOriginal` performs pixiv's own.
            async respond(request, fetchOriginal) {
                this.waiting++;
                this.pageStarted = Date.now();
                this.emit();
                try {
                    return await this.answer(request, fetchOriginal);
                } catch (error) {
                    if (!isAbortError(error)) {
                        this.state.phase = 'error';
                        this.state.error = error;
                        this.emit();
                    }
                    throw error;
                } finally {
                    this.waiting--;
                    this.emit();
                }
            }
        }

        // pixiv's search in popular order: one ranking per search (word + filters).
        class PopularRanking extends Ranking {
            constructor(req, options) {
                super(req.key, options);
                this.req = req;
                this.terms = parseQueryTerms(req.word);
                this.chunkSize = CHUNK_SIZE;
                this.lookahead = LOOKAHEAD_SIZE;
                this.relatedLimit = RELATED_SEED_TAGS;
                this.graphSeeds = this.terms && checkableFilters(req) ? GRAPH_SEEDS : 0;
                this.graphBudget = GRAPH_BUDGET;
                this.searchLimiter = new RateLimiter(SEARCH_INTERVAL_MS);
                this.recommendLimiter = new RateLimiter(RECOMMEND_INTERVAL_MS);
                this.seen = new Set();
                this.tierPlan = tierPlan(req);
                this.tierQueue = this.tierPlan ? TIER_GROUPS.slice() : [];
                this.sources = [];
                this.fallbackAdded = false;
                this.seeds = [];
                this.relatedTags = [];
                this.extraSeedsDone = false;
                this.graphDone = false;
                this.shell = null;
                this.basePage = null;
                this.total = 0;
                this.lastPage = 0;
                this.queue = Promise.resolve();
                this.rankedWaiters = [];
                // Every work taken so far by id.
                this.byId = new Map();
                // Searches in flight, so a prefetched page is not requested twice.
                this.inflight = new Map();
                this.graphTask = null;
                // The works past the last tier boundary (see deeperTierMatters).
                this.lastLookahead = null;
            }

            listing(word, page, sMode) {
                const url = buildSearchUrl(this.req, word, page, sMode);
                const cached = listingCache.get(url);
                if (cached) return Promise.resolve(cached);
                let request = this.inflight.get(url);
                if (!request) {
                    request = listingCache.load(url)
                        .then((stored) => {
                            if (stored) return stored;
                            this.state.searches++;
                            return withRetry(() => getSearchPage(url, this.req.field, this.signal, this.priority), this.searchLimiter, this.signal)
                                .then((result) => {
                                    listingCache.set(url, result);
                                    return result;
                                });
                        })
                        .finally(() => {
                            this.inflight.delete(url);
                            this.touch();
                        });
                    this.inflight.set(url, request);
                }
                return request;
            }

            // The next search page is requested while the current one is processed
            // (the search limiter still spaces the requests out).
            prefetch(word, page, sMode) {
                this.listing(word, page, sMode).catch(() => {});
            }

            prefetchNextTier() {
                if (this.tierQueue.length) this.prefetch(tierWord(this.req.word, this.tierQueue[0]), 1, this.tierPlan.sMode);
            }

            // pixiv's own response for this search (date order) provides the total, the
            // free "popular" preview and, on page 1, the newest works. Later pages reuse
            // it, so they cost no extra search request.
            setShell(json, page) {
                const base = readSearchBlock(json.body, this.req.field);
                this.shell = JSON.stringify(json);
                this.total = base.total;
                const pages = Math.ceil(base.total / PAGE_SIZE);
                this.lastPage = Math.min(MAX_RANKED_PAGES, base.lastPage ? Math.min(base.lastPage, pages) : pages);
                if (seedsApplicable(this.req)) {
                    this.seeds = base.seeds.filter((item) => matchesModeFilters(item, this.req));
                    if (this.terms && this.terms.include.length === 1 && !this.terms.exclude.length) {
                        popularPool.add(this.terms.include[0], base.permanentIds);
                    }
                }
                if (Array.isArray(json.body.relatedTags)) this.relatedTags = json.body.relatedTags.filter((tag) => typeof tag === 'string');
                if (page === 1) this.basePage = base;
            }

            // `sMode` overrides the search mode of follow-up pages; works must match
            // `terms` exactly when set (see tierPlan).
            makeSource(word, firstPage, floor, sMode = null, terms = null) {
                const pages = Math.ceil(firstPage.total / PAGE_SIZE);
                return { word, floor, sMode, terms, buffer: firstPage.items.slice(), nextPage: 2, pages };
            }

            hasMore() {
                return this.seeds.length > 0 || this.sources.length > 0 || this.tierQueue.length > 0 || !this.fallbackAdded;
            }

            async loadWorks(ids) {
                const works = [];
                for (let i = 0; i < ids.length; i += 100) {
                    this.state.recs++;
                    works.push(...await withRetry(() => getWorksByIds(ids.slice(i, i + 100), this.signal, this.priority), this.recommendLimiter, this.signal));
                    this.touch();
                }
                return works;
            }

            // Top works that the users入り tiers may miss: pixiv's "popular" previews of
            // the searched tags and of related tags (collected over time, since pixiv
            // rotates them).
            async loadExtraSeeds() {
                if (this.extraSeedsDone) return;
                this.extraSeedsDone = true;
                const terms = this.terms;
                const mode = this.req.filters.get('s_mode') || 's_tag';
                if (!terms || mode === 's_tc' || !seedsApplicable(this.req)) return;
                const keep = (item) => matchesSearch(item, this.req, terms);
                const known = new Set(this.seeds.map((item) => String(item.id)));
                const add = (item) => {
                    if (known.has(String(item.id)) || !keep(item)) return;
                    known.add(String(item.id));
                    this.seeds.push(item);
                };
                for (const tag of this.relatedLimitTags()) {
                    let page;
                    try {
                        page = await this.listing(tag, 1);
                    } catch (error) {
                        if (isAbortError(error)) throw error;
                        continue;
                    }
                    popularPool.add(tag, page.permanentIds);
                    page.seeds.forEach(add);
                }

                const pooled = [...new Set(terms.include.flatMap((term) => popularPool.get(term)))].filter((id) => !known.has(id));
                if (pooled.length) {
                    try {
                        (await this.loadWorks(pooled)).forEach(add);
                    } catch (error) {
                        if (isAbortError(error)) throw error;
                    }
                }
            }

            relatedLimitTags() {
                const own = new Set((this.terms ? this.terms.include : []).map(normalizeTag));
                return this.relatedTags.filter((tag) => !own.has(normalizeTag(tag))).slice(0, this.relatedLimit);
            }

            // Tier groups are probed one at a time, highest first, only when the ranking
            // needs more works. The newest works come last: they catch works nobody has
            // tagged with users入り yet.
            async nextSource() {
                while (!this.sources.length) {
                    if (this.tierQueue.length) {
                        const group = this.tierQueue.shift();
                        const word = tierWord(this.req.word, group);
                        const { sMode, terms } = this.tierPlan;
                        let first;
                        try {
                            first = await this.listing(word, 1, sMode);
                        } catch (error) {
                            if (isAbortError(error)) throw error;
                            continue;
                        }
                        if (first.total > 0 && first.items.length) {
                            const source = this.makeSource(word, first, Math.min(...group), sMode, terms);
                            this.sources.push(source);
                            if (source.pages >= 2) this.prefetch(word, 2, sMode);
                            else this.prefetchNextTier();
                        }
                    } else if (!this.fallbackAdded) {
                        this.fallbackAdded = true;
                        let first = this.basePage;
                        if (!first) {
                            try {
                                first = await this.listing(this.req.word, 1);
                            } catch (error) {
                                if (isAbortError(error)) throw error;
                                return null;
                            }
                        }
                        const source = this.makeSource(this.req.word, first, 0);
                        this.sources.push(source);
                        if (source.pages >= 2) this.prefetch(this.req.word, 2, null);
                    } else {
                        return null;
                    }
                }
                return this.sources[0];
            }

            // Works the viewer's settings hide never enter a search ranking: pixiv's own
            // search leaves them out too, so its total and pages stay right.
            take(item, chunk, floor, terms = null, flags = null) {
                if (!isUsableItem(item) || this.seen.has(String(item.id))) return;
                if (terms && !matchesQuery(item, terms, true)) return;
                if (!canView(item, this.rules)) return;
                this.seen.add(String(item.id));
                const taken = this.prepare(item, floor, flags);
                this.byId.set(taken.id, taken);
                chunk.push(taken);
            }

            // Moves works from `source` into `chunk` until the chunk holds `limit` works or
            // the source runs out. Returns true when the source is exhausted.
            async drain(source, chunk, limit, flags = null) {
                for (;;) {
                    const start = chunk.length;
                    while (source.buffer.length && chunk.length < limit) this.take(source.buffer.shift(), chunk, source.floor, source.terms, flags);
                    this.queueStats(chunk.slice(start));
                    if (chunk.length >= limit) return !source.buffer.length && source.nextPage > source.pages;
                    if (source.nextPage > source.pages) return true;
                    let page;
                    try {
                        const request = this.listing(source.word, source.nextPage++, source.sMode);
                        // One page ahead: the next request starts while this one is still
                        // on its way (pixiv answers searches slower than they are spaced).
                        if (source.nextPage <= source.pages) this.prefetch(source.word, source.nextPage, source.sMode);
                        else this.prefetchNextTier();
                        page = await request;
                    } catch (error) {
                        // A deep page pixiv refuses to serve ends this source, not the ranking.
                        if (isAbortError(error)) throw error;
                        return true;
                    }
                    if (!page.items.length) return true;
                    // A copy: the page is shared with listingCache, and the buffer is
                    // emptied as works are taken.
                    source.buffer = page.items.slice();
                }
            }

            // A chunk ends at a tier boundary once it holds enough works, because works of
            // a higher tier mostly outrank those of lower tiers. Inside one huge tier it
            // ends at chunkSize instead. Returns whether it stopped at a tier boundary.
            // Seeds don't count towards `needed`: they say nothing about where the tiers
            // can stop.
            async buildChunk(needed, chunk) {
                this.building = chunk;
                await this.loadExtraSeeds();
                for (const item of this.seeds.splice(0)) this.take(item, chunk, 0, null, { priority: 3 });
                this.queueStats(chunk);
                const seeded = chunk.length;
                for (;;) {
                    const source = await this.nextSource();
                    if (!source) return false;
                    const exhausted = await this.drain(source, chunk, seeded + this.chunkSize);
                    this.startGraph(chunk);
                    if (exhausted) this.sources.shift();
                    if (chunk.length - seeded >= this.chunkSize) return false;
                    if (exhausted && chunk.length - seeded >= needed) return true;
                }
            }

            // Milestone tags are added by hand and often lag behind the real count (works
            // with 40K bookmarks still tagged 10000users入り are common), so the first works
            // past a tier boundary are ranked as well.
            async buildLookahead() {
                const chunk = [];
                this.building = chunk;
                while (chunk.length < this.lookahead) {
                    const source = await this.nextSource();
                    if (!source) break;
                    if (await this.drain(source, chunk, this.lookahead, { lookahead: true })) this.sources.shift();
                }
                return chunk;
            }

            // pixiv recommends works that the same people bookmarked. The works that the
            // recommendations of several top works share are popular themselves, also
            // when they carry no users入り tag. It starts from the best works known so
            // far (by exact count or milestone), so it can run while counts load.
            // Candidates are ordered by the milestone in their own tags, then by how
            // often they were recommended; only the first graphBudget get an exact count.
            // The graph starts as soon as the chunk holds enough works with a known
            // milestone or count (the top tiers come first), so it loads while the rest
            // is still being listed.
            startGraph(pool) {
                if (this.graphTask || !this.graphSeeds) return;
                const known = this.ranked.concat(pool).filter((item) => this.score(item) > 0);
                if (known.length < this.graphSeeds) return;
                this.graphTask = this.collectGraph(known);
                this.graphTask.catch(() => {});
            }

            async collectGraph(pool) {
                const seeds = pool.slice().sort(this.byScore).slice(0, this.graphSeeds);
                const candidates = new Map();
                await mapLimit(seeds, GRAPH_PARALLEL, async (seed) => {
                    let works;
                    try {
                        this.state.recs++;
                        works = await withRetry(() => getRecommendations(seed.id, this.signal, this.priority), this.recommendLimiter, this.signal);
                    } catch (error) {
                        if (isAbortError(error)) throw error;
                        return;
                    } finally {
                        this.touch();
                    }
                    for (const work of works) {
                        const id = String(work.id);
                        if (!matchesSearch(work, this.req, this.terms)) continue;
                        const entry = candidates.get(id) || { work, hits: 0 };
                        entry.hits++;
                        candidates.set(id, entry);
                    }
                });
                return candidates;
            }

            // Works that several top works' recommendations share are protected from
            // pruning (a locked tag can keep an old milestone). New ones get a count
            // when they are shared or carry a milestone; candidates recommended once,
            // without any milestone, are too weak a signal to spend a request on.
            async buildGraphChunk(count) {
                if (this.graphDone || !this.graphSeeds) return [];
                this.graphDone = true;
                if (!this.graphTask) this.graphTask = this.collectGraph(this.ranked);
                const candidates = await this.graphTask;
                const ranked = this.ranked.slice().sort(this.byScore);
                const threshold = ranked.length >= count ? this.score(ranked[count - 1]) : 0;
                const fresh = [];
                for (const entry of candidates.values()) {
                    const known = this.byId.get(String(entry.work.id));
                    if (known) {
                        if (entry.hits >= 2) this.protect(known);
                        continue;
                    }
                    const floor = tagFloor(entry.work);
                    if (entry.hits < 2 && floor === 0) continue;
                    fresh.push({ work: entry.work, hits: entry.hits, floor, strong: entry.hits >= 2 || this.floorScore(floor) >= threshold / 2 });
                }
                fresh.sort((a, b) => (b.strong - a.strong) || (b.floor - a.floor) || (b.hits - a.hits));
                const chunk = [];
                this.building = chunk;
                for (const entry of fresh.slice(0, this.graphBudget)) this.take(entry.work, chunk, 0, null, { priority: entry.strong ? 2 : 1 });
                this.queueStats(chunk);
                return chunk;
            }

            // A new chunk is placed by its estimate at once and re-sorted once its exact
            // counts are in.
            merge(chunk) {
                if (this.building === chunk) this.building = [];
                this.ranked = this.ranked.concat(chunk);
                this.resortTail();
                this.touch();
                this.rankedWaiters = this.rankedWaiters.filter((waiter) => {
                    if (this.ranked.length < waiter.count) return true;
                    waiter.resolve();
                    return false;
                });
            }

            waitForRanked(count) {
                if (this.ranked.length >= count) return Promise.resolve();
                return new Promise((resolve) => this.rankedWaiters.push({ count, resolve }));
            }

            // Milestones lag behind (and views and likes follow them loosely): when a fair
            // share of the works past the last tier boundary turned out to belong on the
            // requested pages, the rest of that tier (and a lookahead past it) is ranked
            // as well.
            deeperTierMatters(count) {
                const extra = this.lastLookahead;
                this.lastLookahead = null;
                if (!extra || !extra.length) return false;
                const top = new Set(this.ranked.slice(0, count));
                const hits = extra.filter((item) => item.stats && top.has(item)).length;
                return hits >= Math.max(2, count * DEEPER_TIER_SHARE);
            }

            async rankUpTo(count) {
                if (count > this.target) {
                    this.target = count;
                    this.requeueSkipped();
                }
                let deeperTiers = 0;
                while (this.hasMore()) {
                    if (this.ranked.length >= count) {
                        // At most one deeper tier per page asked for (each costs searches,
                        // which pixiv limits); the next page goes on from there.
                        if (deeperTiers > 0 || !this.deeperTierMatters(count)) break;
                        deeperTiers++;
                    }
                    const chunk = [];
                    const atBoundary = await this.buildChunk(Math.max(0, count - this.ranked.length), chunk);
                    if (!chunk.length) break;
                    // The page counts as filled from here (see getPage). Counts keep
                    // loading while the graph and the lookahead are being listed.
                    this.merge(chunk);
                    const graph = await this.buildGraphChunk(count);
                    if (graph.length) this.merge(graph);
                    const extra = atBoundary && this.lookahead && this.hasMore() ? await this.buildLookahead() : [];
                    if (extra.length) this.merge(extra);
                    await this.countsSettled();
                    this.resortTail();
                    this.lastLookahead = extra;
                }
                // Counts a deeper page brought back from the skipped ones.
                await this.countsSettled();
                this.resortTail();
                this.state.phase = 'ready';
                this.emit();
            }

            // Serialized so a page request and a background prefetch never build at once.
            ensure(count) {
                const run = this.queue.then(() => this.rankUpTo(count));
                this.queue = run.catch(() => {});
                return run;
            }

            async getPage(page) {
                clearTimeout(this.prefetchTimer);
                // Past the ranked pages there is nothing to rank for.
                if (page > this.lastPage) return [];
                const end = page * PAGE_SIZE;
                // Exact counts can take long when pixiv throttles: once the page is filled
                // and requests stall, it is served by estimate; the rest keeps loading.
                this.waitStarted = 0;
                const wait = { done: false };
                try {
                    await Promise.race([this.ensure(end), this.waitForRanked(end).then(() => this.untilStalled(wait))]);
                } finally {
                    wait.done = true;
                }
                this.waitStarted = 0;
                this.hurried = false;
                this.resortTail();
                this.served = Math.max(this.served, Math.min(end, this.ranked.length));
                if (page < this.lastPage) {
                    this.prefetchTimer = setTimeout(() => {
                        this.ensure(end + PAGE_SIZE).catch(() => {});
                    }, PREFETCH_DELAY_MS);
                }
                return this.ranked.slice(end - PAGE_SIZE, end).map(stripInternal);
            }

            // pixiv's own request is only needed once per search.
            async answer(page, fetchOriginal) {
                await Promise.race([statsCache.load(), delay(STATS_LOAD_WAIT_MS)]);
                if (this.rules === undefined) this.rules = await viewer.rules();
                if (!this.shell) {
                    const response = await fetchOriginal();
                    const json = await response.clone().json();
                    if (!json || json.error || !readSearchBlock(json.body, this.req.field)) return response;
                    this.setShell(json, page);
                    if (!this.total) {
                        this.state.phase = 'empty';
                        this.emit();
                        return response;
                    }
                } else if (!this.total) {
                    return fetchOriginal();
                }
                const items = await this.getPage(page);
                const json = JSON.parse(this.shell);
                const block = json.body[this.req.field];
                block.data = items;
                block.total = this.total;
                block.lastPage = this.lastPage;
                return jsonResponse(json);
            }
        }

        // An artist's works (all, illustrations or manga, or one of their tags) or a
        // user's bookmarks. pixiv pages these lists itself; the whole list is read (100
        // works per request, counts start with the first hundred) and every page pixiv
        // asks for is answered from the ranking.
        class WorkListRanking extends Ranking {
            constructor(list, options) {
                super(list.key, options);
                this.list = list;
                this.listLimiter = new RateLimiter(RECOMMEND_INTERVAL_MS);
                this.listing = null;
                this.listed = new Set();
                // The artist's ids in pixiv's own order (newest first), to tell which page
                // pixiv asks for by its ids.
                this.order = [];
            }

            ensureListed() {
                if (!this.listing) this.listing = this.loadList();
                return this.listing;
            }

            request(task) {
                return withRetry(task, this.listLimiter, this.signal).finally(() => this.touch());
            }

            async loadList() {
                if (this.list.kind === 'ids') {
                    const ids = await this.request(() => getProfileIds(this.list, this.signal, this.priority));
                    this.order = ids.sort((a, b) => Number(b) - Number(a));
                    const batches = [];
                    for (let i = 0; i < this.order.length; i += LIST_BATCH) batches.push(i);
                    await mapLimit(batches, LIST_PARALLEL, async (offset) => {
                        const ids = this.order.slice(offset, offset + LIST_BATCH);
                        this.add(await this.request(() => getProfileWorks(this.list, ids, this.signal, this.priority)), offset);
                    });
                } else {
                    const first = await this.request(() => getListPage(this.list, 0, this.signal, this.priority));
                    this.add(first.works, 0);
                    const offsets = [];
                    for (let offset = LIST_BATCH; offset < first.total; offset += LIST_BATCH) offsets.push(offset);
                    await mapLimit(offsets, LIST_PARALLEL, async (offset) => {
                        this.add((await this.request(() => getListPage(this.list, offset, this.signal, this.priority))).works, offset);
                    });
                }
                if (!this.statsQueue.length && !this.statsActive) this.state.phase = 'ready';
                this.emit();
            }

            add(works, offset) {
                const chunk = [];
                works.forEach((work, i) => {
                    const id = String(work.id);
                    // A list that changed while it was read can repeat a work.
                    if (this.listed.has(id)) return;
                    this.listed.add(id);
                    // pixiv lists these (an artist's AI works) but its client hides them:
                    // they go last, uncounted, so the pages fill with works that show.
                    chunk.push(this.prepare(work, 0, { pos: offset + i, unviewable: !work.isMasked && !canView(work, this.rules) }));
                });
                this.ranked = this.ranked.concat(chunk);
                this.queueStats(chunk);
                this.emit();
            }

            // pixiv asks for a page by its ids; their place in pixiv's own order (newest
            // first, or oldest first with order=asc) gives the page.
            positionOf(ids) {
                const at = this.order.indexOf(String(ids[0]));
                if (at < 0) return -1;
                const ascending = ids.length > 1 && Number(ids[0]) < Number(ids[1]);
                return ascending ? this.order.length - 1 - at : at;
            }

            async answer(request, fetchOriginal) {
                await Promise.race([statsCache.load(), delay(STATS_LOAD_WAIT_MS)]);
                if (this.rules === undefined) this.rules = await viewer.rules();
                await this.ensureListed();
                const byIds = this.list.kind === 'ids';
                const offset = byIds ? this.positionOf(request.ids) : request.offset;
                const limit = byIds ? request.ids.length : request.limit;
                // A page that is not in the list as read (it changed meanwhile) stays pixiv's own.
                if (offset < 0 || !limit) return fetchOriginal();
                const end = offset + limit;
                this.target = Math.max(this.target, end);
                this.waitStarted = 0;
                const settled = this.countsSettled();
                settled.catch(() => {});
                const wait = { done: false };
                try {
                    await Promise.race([settled, this.untilStalled(wait)]);
                } finally {
                    wait.done = true;
                }
                this.waitStarted = 0;
                this.hurried = false;
                this.resortTail();
                this.served = Math.max(this.served, Math.min(end, this.ranked.length));
                if (!this.statsQueue.length && !this.statsActive) this.state.phase = 'ready';
                this.emit();
                // Served by estimate: the counts still loading end the ranking later.
                settled.then(() => {
                    if (this.state.phase !== 'ranking' || this.statsQueue.length || this.statsActive) return;
                    this.state.phase = 'ready';
                    this.emit();
                }, () => {});
                const page = this.ranked.slice(offset, end);
                return byIds ? this.answerIds(request, page) : this.answerOffset(fetchOriginal, page);
            }

            // The page's works are requested fresh (their bookmark state may have changed)
            // and handed to pixiv under the ids it asked for, in ranked order: pixiv shows
            // the works it gets, keyed by the ids it requested.
            async answerIds(request, page) {
                const url = new URL(request.url.href);
                url.searchParams.delete('ids[]');
                for (const item of page) url.searchParams.append('ids[]', item.id);
                const fresh = page.length ? await this.request(() => fetchJson(url.pathname + url.search, { signal: this.signal, priority: this.priority })) : null;
                const works = {};
                request.ids.forEach((id, i) => {
                    const item = page[i];
                    if (item) works[id] = (fresh && fresh.works && fresh.works[item.id]) || stripInternal(item);
                });
                const body = Object.assign({ extraData: null, zoneConfig: {} }, fresh, { works });
                return jsonResponse({ error: false, message: '', body });
            }

            async answerOffset(fetchOriginal, page) {
                const response = await fetchOriginal();
                let json = null;
                try {
                    json = await response.clone().json();
                } catch (e) {
                    return response;
                }
                if (!json || json.error || !json.body || !Array.isArray(json.body.works)) return response;
                json.body.works = page.map(stripInternal);
                return jsonResponse(json);
            }
        }

        // Only the current search or list keeps an engine; counts and search pages
        // survive in their caches, so coming back to an earlier one is cheap.
        let activeEngine = null;

        function getEngine(Kind, spec) {
            const reusable = activeEngine instanceof Kind && activeEngine.key === spec.key && activeEngine.sort === settings.sort
                && !activeEngine.signal.aborted
                && activeEngine.state.phase !== 'error' && activeEngine.state.phase !== 'empty';
            if (!reusable) {
                if (activeEngine) activeEngine.abort();
                setActiveEngine(new Kind(spec, settings));
            }
            return activeEngine;
        }

        function stopEngines() {
            if (activeEngine) activeEngine.abort();
            setActiveEngine(null);
        }

        // ---------------------------------------------------------------------
        // fetch hook: answers pixiv's popular requests with our ranking
        // ---------------------------------------------------------------------

        function isPremium() {
            const layer = window.dataLayer && window.dataLayer[0];
            return Boolean(layer) && layer.premium === 'yes';
        }

        // pixiv loads a page's data before its address changes (Next.js
        // getInitialProps), so a request belongs to the page being navigated to.
        let pendingRoute = null;

        function destinationHref() {
            return pendingRoute || location.href;
        }

        // pixiv keeps list pages cached by request for the life of the page, so lists
        // answered in popular order ("uid|section") must not be shown in pixiv's own order
        // again without a reload (see hookRouter).
        const rankedLists = new Set();

        // Premium accounts get pixiv's own popular search; artist pages and bookmarks
        // have no popular order on pixiv at all, so those are ranked for everyone.
        function engineFor(input) {
            const url = toUrl(input);
            const search = isPremium() ? null : parseSearchRequest(url);
            if (search) return POPULAR_ORDERS.has(search.order) ? { engine: getEngine(PopularRanking, search), request: search.page } : null;
            const page = listPage(destinationHref());
            const list = parseListRequest(url, page);
            if (!list) return null;
            rankedLists.add(`${page.uid}|${page.section}`);
            return { engine: getEngine(WorkListRanking, list), request: list };
        }

        // Every other request goes straight to pixiv; nothing here may break the page.
        function patchedFetch(input) {
            const args = arguments;
            const original = () => nativeFetch.apply(window, args);
            let match = null;
            try {
                match = engineFor(input);
            } catch (e) {
                match = null;
            }
            if (!match) return original();
            return match.engine.respond(match.request, original).catch((error) => {
                if (!isAbortError(error)) {
                    console.warn('[Pixiv Sort]', error);
                    return original();
                }
                // The ranking was stopped (the page was left, the cache cleared). pixiv
                // keeps answers by request, so its own order must not be stored under a
                // popular request: ranked again while its page is still shown, failed
                // otherwise (pixiv asks again when it comes back to the page).
                let again = null;
                try {
                    again = popularKind(destinationHref()) ? engineFor(input) : null;
                } catch (e) {
                    again = null;
                }
                if (!again || again.engine === match.engine) throw error;
                return again.engine.respond(again.request, original).catch((retryError) => {
                    if (isAbortError(retryError)) throw retryError;
                    console.warn('[Pixiv Sort]', retryError);
                    return original();
                });
            });
        }

        window.fetch = patchedFetch;

        // ---------------------------------------------------------------------
        // Click hook: pixiv's own "Sort by popularity" controls
        // ---------------------------------------------------------------------

        // For free accounts pixiv renders its premium suggestion chips as a bare button
        // (the data-ga4 wrapper only exists for premium), so the chip id is read from the
        // button's React props instead.
        function suggestIdFromProps(element) {
            const key = element ? Object.keys(element).find((name) => name.startsWith('__reactFiber$')) : null;
            let fiber = key ? element[key] : null;
            for (let depth = 0; fiber && depth < 12; depth++, fiber = fiber.return) {
                const suggest = fiber.memoizedProps && fiber.memoizedProps.suggest;
                if (suggest && typeof suggest.id === 'string') return suggest.id;
            }
            return null;
        }

        // Returns { order, recent } for pixiv's popular-order controls, null otherwise.
        function orderForControl(target) {
            if (!(target instanceof Element)) return null;
            const tagged = target.closest('[data-ga4-entity-id]');
            const id = tagged ? tagged.getAttribute('data-ga4-entity-id') : '';
            const option = /^search-option\/(popular(?:_male|_female)?_d)$/.exec(id);
            if (option) return { order: option[1], recent: false };
            const suggest = id.startsWith('search-suggest/') ? id.slice('search-suggest/'.length) : suggestIdFromProps(target.closest('button'));
            if (suggest === 'sort-by-popular') return { order: 'popular_d', recent: false };
            if (suggest === 'recent-popular') return { order: 'popular_d', recent: true };
            return null;
        }

        // pixiv's "recent works" filter: the last 30 days in Japan time.
        function japanDate(offsetDays) {
            return new Date(Date.now() + 9 * 3600 * 1000 + offsetDays * 86400 * 1000).toISOString().slice(0, 10);
        }

        function navigateToOrder({ order, recent }) {
            const url = new URL(location.href);
            url.searchParams.set('order', order);
            url.searchParams.delete('p');
            if (recent) {
                url.searchParams.set('scd', japanDate(-30));
                url.searchParams.set('ecd', japanDate(0));
            }
            routeTo(url, false);
        }

        // pixiv's router methods as they were before hookRouter wrapped them, so the
        // script's own navigation is taken as it is.
        const routerMethods = {};

        function routeTo(url, replace) {
            const router = window.next && window.next.router;
            const name = replace ? 'replace' : 'push';
            const method = router && (routerMethods[name] || router[name]);
            if (typeof method === 'function') {
                method.call(router, url.pathname + url.search);
            } else if (replace) {
                location.replace(url.href);
            } else {
                location.assign(url.href);
            }
        }

        // A new sort order reloads a search in pixiv's own order (see ui.onSortChange) and
        // the popular order is entered from there, as by a click: a page loaded with
        // order=popular_* has pixiv drop the order and ask for its pages again, which
        // could leave pixiv's own order cached under the popular request.
        function takeEnterOrder() {
            try {
                const entry = JSON.parse(sessionStorage.getItem(ENTER_ORDER_KEY) || 'null');
                sessionStorage.removeItem(ENTER_ORDER_KEY);
                return entry && typeof entry.href === 'string' && POPULAR_ORDERS.has(entry.order) ? entry : null;
            } catch (e) {
                return null;
            }
        }

        function rememberEnterOrder(href, order) {
            try {
                sessionStorage.setItem(ENTER_ORDER_KEY, JSON.stringify({ href, order }));
                return true;
            } catch (e) {
                return false;
            }
        }

        function samePage(a, b) {
            try {
                const x = new URL(a, location.href);
                const y = new URL(b, location.href);
                return x.pathname === y.pathname && x.search === y.search;
            } catch (e) {
                return false;
            }
        }

        // While the popular order is put back, pixiv removing it is not the user
        // leaving the page: the ranking pixiv waits for keeps going (see watchPage).
        let restoringOrder = false;

        // A reload, a new tab or a link with order=popular_* loads the page with that
        // order, but pixiv's client removes it right away for free accounts (there is
        // no server redirect). The order is put back as soon as pixiv's store and router
        // exist, unless the user has started doing something else. After a new sort
        // order the page loads without it and it is entered the same way.
        function restoreInitialOrder() {
            let target = isPopularUrl(initialHref) ? new URL(initialHref) : null;
            const entry = takeEnterOrder();
            if (!target && entry && samePage(entry.href, initialHref)) {
                target = new URL(initialHref);
                target.searchParams.set('order', entry.order);
            }
            if (!target || isPremium()) return;
            const started = Date.now();
            let userActed = false;
            const onAct = () => {
                userActed = true;
            };
            window.addEventListener('pointerdown', onAct, { capture: true, once: true });
            window.addEventListener('keydown', onAct, { capture: true, once: true });
            restoringOrder = true;
            // Given up: pixiv's removal of the order now counts as leaving the page.
            const giveUp = () => {
                restoringOrder = false;
                if (!isPopularPage()) leavePopular();
            };
            const tick = () => {
                if (isPremium() || userActed || Date.now() - started > RESTORE_WINDOW_MS || location.pathname !== target.pathname) {
                    giveUp();
                    return;
                }
                if (!(window.next && window.next.router) || !premiumView.set(true)) {
                    setTimeout(tick, 100);
                    return;
                }
                if (!isPopularUrl(location.href)) {
                    restoringOrder = false;
                    routeTo(target, true);
                    return;
                }
                // Still popular: pixiv may not have normalized the URL yet.
                setTimeout(tick, 250);
            };
            tick();
        }

        // The popular order is left: its ranking stops and pixiv's own flag comes back.
        function leavePopular() {
            stopEngines();
            premiumView.set(false);
        }

        function onClickCapture(event) {
            // While the premium view is on, pixiv's own controls already work (and the
            // "recent works" chip must stay a toggle), so only the entry click is taken over.
            if (event.button !== 0 || isPremium() || premiumView.enabled) return;
            const control = orderForControl(event.target);
            if (!control) return;
            // If pixiv changed and the flag can't be set, the click stays pixiv's own.
            if (!premiumView.set(true)) {
                console.warn('[Pixiv Sort] could not switch pixiv to its popular view');
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            statsCache.load();
            closeOrderMenu();
            navigateToOrder(control);
        }

        // The blocked click would have closed pixiv's order dropdown; its toggle does it instead.
        function closeOrderMenu() {
            if (!document.querySelector('[data-ga4-label="select_order_button"]')) return;
            const toggle = document.querySelector('[data-ga4-label="open_dropdown_button"]');
            if (toggle) toggle.click();
        }

        document.addEventListener('click', onClickCapture, true);

        // ---------------------------------------------------------------------
        // Premium view: on every navigation pixiv's search page normalizes its URL and
        // drops order=popular_* for free accounts. While the popular order is shown,
        // the page's own copy of the account flag (Redux userData.self.premium) is set
        // to premium so the order stays. Nothing is sent to pixiv's servers; the real
        // status keeps coming from dataLayer (isPremium) and is restored as soon as
        // the popular order is left.
        // ---------------------------------------------------------------------

        function isPopularUrl(url) {
            try {
                return POPULAR_ORDERS.has(new URL(url, location.href).searchParams.get('order'));
            } catch (e) {
                return false;
            }
        }

        function selfOf(store) {
            try {
                const state = store.getState();
                return (state && state.userData && state.userData.self) || null;
            } catch (e) {
                return null;
            }
        }

        const premiumView = {
            store: null,
            enabled: false,

            findStore() {
                if (this.store) return this.store;
                const root = document.getElementById('__next');
                const key = root && Object.keys(root).find((name) => name.startsWith('__reactContainer$'));
                const stack = key ? [root[key]] : [];
                for (let steps = 0; stack.length && steps < 5000; steps++) {
                    const fiber = stack.pop();
                    const store = fiber.memoizedProps && fiber.memoizedProps.store;
                    if (store && typeof store.getState === 'function' && typeof store.dispatch === 'function') {
                        this.store = store;
                        return store;
                    }
                    if (fiber.sibling) stack.push(fiber.sibling);
                    if (fiber.child) stack.push(fiber.child);
                }
                return null;
            },

            // Returns whether the flag now has the wanted value: an action pixiv no longer
            // knows, or a store replaced since it was found, must not count as success.
            set(on) {
                if (isPremium() || this.enabled === on) return true;
                for (let attempt = 0; attempt < 2; attempt++) {
                    const store = this.findStore();
                    const self = store && selfOf(store);
                    if (!self) return false;
                    store.dispatch({ type: 'pixiv/spa/userdata/SET_SELF_EXTRA_DATA', payload: { premium: on } });
                    const after = selfOf(store);
                    if (after && Boolean(after.premium) === on) {
                        this.enabled = on;
                        return true;
                    }
                    this.store = null;
                }
                return false;
            },
        };

        // pixiv's pager, tabs and tag links drop parameters they don't know, so within
        // one section (works or bookmarks) of one user the popular order is carried over.
        function keepListSort(href) {
            if (typeof href !== 'string') return href;
            const from = listPage(location.href);
            if (!from || !from.popular) return href;
            const to = listPage(href);
            if (!to || to.popular || to.uid !== from.uid || to.section !== from.section) return href;
            to.url.searchParams.set(LIST_SORT_PARAM, LIST_SORT_VALUE);
            return to.url.pathname + to.url.search + to.url.hash;
        }

        // Back/forward to a popular page must switch the flag before pixiv renders it,
        // and requests made while a route loads belong to the new page.
        function hookRouter(attempt) {
            const router = window.next && window.next.router;
            if (!router || !router.events) {
                if (attempt < 50) setTimeout(() => hookRouter(attempt + 1), 200);
                return;
            }
            router.events.on('routeChangeStart', (url) => {
                pendingRoute = new URL(url, location.href).href;
                if (isPopularUrl(url)) premiumView.set(true);
            });
            router.events.on('routeChangeComplete', (url) => {
                pendingRoute = null;
                if (!isPopularUrl(url)) premiumView.set(false);
            });
            router.events.on('routeChangeError', () => {
                pendingRoute = null;
            });
            for (const name of ['push', 'replace']) {
                const original = router[name];
                if (typeof original !== 'function' || routerMethods[name]) continue;
                routerMethods[name] = original;
                router[name] = function (url, as, options) {
                    const href = keepListSort(url);
                    const shown = keepListSort(as);
                    // pixiv would show the ranked pages it cached under the same requests.
                    const to = listPage(typeof shown === 'string' ? shown : href);
                    if (to && !to.popular && rankedLists.has(`${to.uid}|${to.section}`)) {
                        location[name === 'replace' ? 'replace' : 'assign'](to.url.href);
                        return Promise.resolve(true);
                    }
                    return original.call(this, href, shown, options);
                };
            }
        }

        // ---------------------------------------------------------------------
        // UI: progress line, launcher with settings, bookmark badges
        // ---------------------------------------------------------------------

        // 'search' or 'list' when the page is shown in popular order by this script.
        function popularKind(href) {
            const page = listPage(href);
            if (page) return page.popular ? 'list' : null;
            return isPopularUrl(href) && !isPremium() ? 'search' : null;
        }

        function isPopularPage() {
            return popularKind(location.href) !== null;
        }

        function h(tag, props, ...children) {
            const el = document.createElement(tag);
            for (const [name, value] of Object.entries(props || {})) {
                if (value == null || value === false) continue;
                if (name === 'class') el.className = value;
                else if (name === 'text') el.textContent = value;
                else if (name.startsWith('on')) el.addEventListener(name.slice(2), value);
                else if (name in el) el[name] = value;
                else el.setAttribute(name, value === true ? '' : value);
            }
            for (const child of children.flat()) {
                if (child != null && child !== false) el.append(child);
            }
            return el;
        }

        // Colors come from pixiv's own design tokens (charcoal), so the UI follows the
        // site's light and dark themes; the fallbacks are pixiv's light values.
        const UI_STYLE = `
            :host {
                all: initial;
                --bg: var(--charcoal-surface1, #ffffff);
                --bg-hover: var(--charcoal-surface1-hover, #f5f5f5);
                --fill: var(--charcoal-surface3, rgba(0, 0, 0, 0.04));
                --fill-hover: var(--charcoal-surface3-hover, rgba(0, 0, 0, 0.08));
                --fg: var(--charcoal-text1, #1f1f1f);
                --fg2: var(--charcoal-text2, #474747);
                --fg3: var(--charcoal-text3, #858585);
                --line: var(--charcoal-border, rgba(0, 0, 0, 0.08));
                --brand: var(--charcoal-brand, #0096fa);
                display: block;
                color: var(--fg);
                font-size: 14px;
                line-height: 22px;
            }
            *, *::before, *::after { box-sizing: border-box; }
            [hidden] { display: none !important; }
            button, input { font: inherit; color: inherit; margin: 0; }
            button { cursor: pointer; }

            .launcher {
                position: fixed; left: 16px; bottom: 16px; z-index: 2147483000;
                display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px 0 10px;
                border: 1px solid var(--line); border-radius: 16px; background: var(--bg);
                color: var(--fg2); font-size: 12px; font-weight: 700; line-height: 1;
            }
            .launcher:hover { background: var(--bg-hover); color: var(--fg); }
            .launcher svg { width: 14px; height: 14px; fill: var(--brand); }
            .launcher.busy svg { animation: pulse 1.6s ease-in-out infinite; }
            @keyframes pulse { 50% { opacity: 0.35; } }

            .menu {
                position: fixed; left: 16px; bottom: 56px; z-index: 2147483000;
                width: 288px; max-width: calc(100vw - 32px); padding: 8px 0;
                border: 1px solid var(--line); border-radius: 8px; background: var(--bg);
            }
            .head { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 4px 16px; font-weight: 700; }
            .close { width: 32px; height: 32px; border: 0; border-radius: 4px; background: none; color: var(--fg3); font-size: 18px; line-height: 1; }
            .close:hover { background: var(--bg-hover); color: var(--fg); }
            .row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 40px; padding: 0 16px; }
            label.row { cursor: pointer; }
            label.row:hover, summary.row:hover { background: var(--bg-hover); }
            .sep { height: 1px; margin: 8px 0; background: var(--line); }
            details > summary { list-style: none; cursor: pointer; color: var(--fg2); }
            details > summary::-webkit-details-marker { display: none; }
            details > summary::after { content: ""; width: 6px; height: 6px; margin-right: 4px; border: solid var(--fg3); border-width: 0 1.5px 1.5px 0; transform: rotate(45deg); }
            details[open] > summary::after { transform: rotate(-135deg); }
            input[type="checkbox"], input[type="radio"] { width: 16px; height: 16px; accent-color: var(--brand); }
            .group-title { padding: 4px 16px 0; color: var(--fg3); font-size: 12px; line-height: 20px; }
            input[type="number"] { width: 56px; height: 32px; padding: 0 8px; border: 1px solid var(--line); border-radius: 4px; background: transparent; }
            .btn { height: 32px; padding: 0 16px; border: 0; border-radius: 16px; background: var(--fill); color: var(--fg2); font-size: 12px; font-weight: 700; }
            .btn:hover { background: var(--fill-hover); color: var(--fg); }
            .muted { color: var(--fg3); font-size: 12px; }

            .status {
                display: grid; grid-template-columns: auto auto auto 1fr; align-items: center; gap: 8px 16px;
                margin-top: 16px; padding: 12px 16px; border-radius: 8px; background: var(--fill);
            }
            .status.floating {
                position: fixed; left: 16px; bottom: 56px; z-index: 2147483000; margin: 0;
                width: min(400px, calc(100vw - 32px)); border: 1px solid var(--line); background: var(--bg);
            }
            .status-title { font-weight: 700; }
            .status-meta { color: var(--fg3); font-size: 12px; font-variant-numeric: tabular-nums; }
            .link { padding: 0; border: 0; background: none; color: var(--brand); font-weight: 700; }
            .link:hover { text-decoration: underline; }
            .link:disabled { color: var(--fg3); text-decoration: none; cursor: default; }
            .bar { grid-column: 1 / -1; height: 2px; border-radius: 1px; background: var(--line); overflow: hidden; }
            .bar i { display: block; width: 100%; height: 100%; background: var(--brand); transform-origin: left; transform: scaleX(0); transition: transform 0.4s ease-out; }
            .bar.busy i { width: 30%; transform: none; transition: none; animation: slide 1.4s ease-in-out infinite; }
            @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(340%); } }

            .chip {
                display: flex; align-items: center; height: 32px; padding: 0 8px; border: 0; border-radius: 4px;
                background: none; color: var(--fg3); font-size: 14px; font-weight: 700; white-space: nowrap;
            }
            .chip:hover { background: var(--fill); color: var(--fg2); }
            .chip.on { background: var(--fill); color: var(--fg); }

            .switch { display: flex; gap: 2px; padding: 2px; border-radius: 16px; background: var(--fill); }
            .switch button {
                display: flex; align-items: center; gap: 4px; height: 28px; padding: 0 12px; border: 0; border-radius: 14px;
                background: none; color: var(--fg3); font-size: 12px; font-weight: 700; white-space: nowrap;
            }
            .switch button:hover { color: var(--fg2); }
            .switch button[aria-pressed="true"] { background: var(--bg); color: var(--fg); box-shadow: 0 0 0 1px var(--line); cursor: default; }
            .switch svg { width: 14px; height: 14px; fill: currentColor; }
        `;

        // The script's star, also its @icon.
        const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.94 6.08 6.56.82-4.83 4.6 1.24 6.6L12 17.36 6.09 20.6l1.24-6.6-4.83-4.6 6.56-.82z"/></svg>';

        // Icons per sort order, on the switch and the badges: pixiv's bookmark heart, an eye.
        const SORT_ICONS = {
            bookmarks: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14s-6.5-3.8-6.5-8.3C1.5 3.6 3.1 2 5.1 2 6.3 2 7.4 2.6 8 3.5 8.6 2.6 9.7 2 10.9 2c2 0 3.6 1.6 3.6 3.7C14.5 10.2 8 14 8 14z"/></svg>',
            views: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3C4.4 3 1.6 5.3.5 8c1.1 2.7 3.9 5 7.5 5s6.4-2.3 7.5-5C14.4 5.3 11.6 3 8 3zm0 8.3A3.3 3.3 0 1 1 8 4.7a3.3 3.3 0 0 1 0 6.6zm0-5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z"/></svg>',
        };

        const BADGE_CSS = `
            .pixiv-sort-badge {
                position: absolute; left: 6px; bottom: 6px; z-index: 2; pointer-events: none;
                display: flex; align-items: center; gap: 3px;
                padding: 2px 7px; border-radius: 10px; background: rgba(0, 0, 0, 0.66); color: #fff;
                font: 700 11px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .pixiv-sort-badge svg { width: 12px; height: 12px; fill: currentColor; }
        `;

        // pixiv's search options (sort row and filter chips): the progress line goes
        // right below them, where the results appear. It is the outermost element that
        // still starts at the sort toggle's row.
        function searchOptionsBlock() {
            const toggle = document.querySelector('[data-ga4-label="open_dropdown_button"]');
            if (!toggle) return null;
            const top = toggle.getBoundingClientRect().top;
            let block = toggle;
            while (block.parentElement && block.parentElement !== document.body
                && Math.abs(block.parentElement.getBoundingClientRect().top - top) < 2) block = block.parentElement;
            return block === toggle ? null : block;
        }

        // The previous sibling that is pixiv's, not one of the script's own elements.
        function previousPixivSibling(element) {
            let sibling = element.previousElementSibling;
            while (sibling && sibling.id && sibling.id.startsWith('pixiv-sort')) sibling = sibling.previousElementSibling;
            return sibling;
        }

        // On list pages: the block holding the thumbnail grid, right after the list's
        // header (artist works) or filter bar (bookmarks).
        function gridBlock() {
            const link = document.querySelector('a[data-ga4-label="thumbnail_link"]');
            let block = link && link.closest('ul');
            for (let depth = 0; block && depth < 4; depth++, block = block.parentElement) {
                if (previousPixivSibling(block)) return block;
            }
            return null;
        }

        // pixiv keeps a tall loading placeholder above an artist's works while an id it
        // asked for is not among the works it got. A popular page holds other works than
        // the newest ones pixiv asked for, so the placeholder would stay under the header
        // after the grid shows; it is collapsed then.
        function collapseLoadingSpacer() {
            const page = listPage(location.href);
            if (!page || !page.popular || page.section !== 'works') return;
            const block = gridBlock();
            const spacer = block && previousPixivSibling(block);
            if (!spacer || spacer.firstChild || spacer.style.minHeight === '0px') return;
            if (parseFloat(getComputedStyle(spacer).minHeight) > 0) spacer.style.minHeight = '0px';
        }

        // Where the progress line goes: below pixiv's search options, or above a list's grid.
        function statusSpot() {
            if (listPage(location.href)) {
                const block = gridBlock();
                return block && { element: block, after: false };
            }
            const block = searchOptionsBlock();
            return block && { element: block, after: true };
        }

        // The element the list toggle follows: the count in an artist's works header, or
        // pixiv's own order dropdown in the bookmarks filter bar.
        function toggleSpot(page) {
            const block = gridBlock();
            if (!block) return null;
            if (page.section === 'bookmarks') {
                const bar = previousPixivSibling(block);
                return bar && bar.querySelector('button');
            }
            const heading = block.parentElement && block.parentElement.querySelector('h2');
            let last = heading && heading.parentElement.lastElementChild;
            while (last && last.id && last.id.startsWith('pixiv-sort')) last = last.previousElementSibling;
            return last;
        }

        // Where the sort switch goes: right after the control that turned the popular
        // order on, pixiv's order dropdown (search) or the list toggle.
        function switchSpot() {
            if (listPage(location.href)) return listToggle.host && listToggle.host.isConnected ? listToggle.host : null;
            const toggle = document.querySelector('[data-ga4-label="open_dropdown_button"]');
            if (!toggle) return null;
            const wrapper = toggle.parentElement;
            return wrapper && wrapper.children.length === 1 ? wrapper : toggle;
        }

        function shadowHost(id) {
            const host = h('div', { id });
            host.style.fontFamily = getComputedStyle(document.body).fontFamily;
            const root = host.attachShadow({ mode: 'open' });
            root.append(h('style', { text: UI_STYLE }));
            return { host, root };
        }

        const ui = {
            host: null,
            engine: null,
            renderTimer: null,
            statusTimer: null,
            spot: null,
            settingsOpen: false,
            // Set once mount() completed; a half-built UI never renders.
            ready: false,

            mount() {
                if (this.host) return;
                document.head.append(h('style', { id: 'pixiv-sort-badge-style', text: BADGE_CSS }));

                // Launcher and settings (fixed, bottom left).
                const main = shadowHost('pixiv-sort-root');
                this.host = main.host;
                this.launcher = h('button', { class: 'launcher', type: 'button', title: t('settings'), onclick: () => this.toggleMenu() });
                this.launcher.innerHTML = STAR_SVG;
                this.launcher.append('Pixiv Sort');
                this.sortInputs = Object.keys(METRICS).map((sort) => h('input', { type: 'radio', name: 'pixiv-sort-order', value: sort, onchange: () => this.onSortChange(sort) }));
                this.badgesInput = h('input', { type: 'checkbox', onchange: () => this.onSettingsChange() });
                this.concurrencyInput = h('input', { type: 'number', min: 1, max: 12, step: 1, onchange: () => this.onSettingsChange() });
                this.cacheNote = h('span', { class: 'muted' });
                this.menu = h('div', { class: 'menu', role: 'dialog', 'aria-label': t('settings'), hidden: true },
                    h('div', { class: 'head' }, h('span', { text: 'Pixiv Sort' }),
                        h('button', { class: 'close', type: 'button', title: t('close'), 'aria-label': t('close'), text: '×', onclick: () => this.closeMenu() })),
                    h('div', { class: 'group', role: 'radiogroup', 'aria-label': t('sortBy') },
                        h('div', { class: 'group-title', text: t('sortBy') }),
                        this.sortInputs.map((input) => h('label', { class: 'row' }, h('span', { text: t(input.value) }), input))),
                    h('div', { class: 'sep' }),
                    h('label', { class: 'row' }, h('span', { text: t('badges') }), this.badgesInput),
                    h('div', { class: 'sep' }),
                    h('details', {},
                        h('summary', { class: 'row', text: t('advanced') }),
                        h('label', { class: 'row' }, h('span', { text: t('concurrency') }), this.concurrencyInput),
                        h('div', { class: 'row' }, this.cacheNote, h('button', { class: 'btn', type: 'button', text: t('clearCache'), onclick: () => this.onClearCache() }))));
                main.root.append(this.menu, this.launcher);
                document.body.append(this.host);

                // Progress line, placed in the page while pixiv waits for a page.
                const status = shadowHost('pixiv-sort-status');
                this.statusHost = status.host;
                this.statusTitle = h('span', { class: 'status-title', text: t('sorting') });
                this.statusMeta = h('span', { class: 'status-meta' });
                this.showNowButton = h('button', { class: 'link', type: 'button', text: t('showNow'), onclick: () => this.onShowNow() });
                this.statusFill = h('i');
                this.statusBar = h('div', { class: 'bar' }, this.statusFill);
                this.statusBox = h('div', { class: 'status', role: 'status', 'aria-live': 'polite' },
                    this.statusTitle, this.statusMeta, this.showNowButton, this.statusBar);
                status.root.append(this.statusBox);

                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape' && !this.menu.hidden) this.closeMenu();
                });
                document.addEventListener('pointerdown', (event) => {
                    if (!this.menu.hidden && !event.composedPath().includes(this.host)) this.closeMenu();
                }, true);
                this.syncControls();
                this.ready = true;
            },

            syncControls() {
                for (const input of this.sortInputs) input.checked = input.value === settings.sort;
                this.concurrencyInput.value = settings.concurrency;
                this.badgesInput.checked = settings.badges;
            },

            toggleMenu() {
                if (this.menu.hidden) this.openSettings();
                else this.closeMenu();
            },

            openSettings() {
                this.settingsOpen = true;
                this.menu.hidden = false;
                this.cacheNote.textContent = '';
                this.render();
            },

            closeMenu() {
                this.settingsOpen = false;
                this.menu.hidden = true;
                this.render();
            },

            onSettingsChange() {
                updateSettings({ concurrency: this.concurrencyInput.value, badges: this.badgesInput.checked });
                this.syncControls();
                if (activeEngine) activeEngine.setConcurrency(settings.concurrency);
                pageWatch.update();
            },

            // From the switch or the menu. pixiv keeps the pages it has shown cached by
            // request, so a new order takes a reload. It starts on the first page (page 3
            // of another order is other works), the search pages read so far come back
            // from IndexedDB (listingCache), and the switch returns to the same spot on
            // screen (see sortSwitch).
            onSortChange(sort, byKeyboard = false) {
                if (sort === settings.sort) return;
                updateSettings({ sort });
                this.syncControls();
                sortSwitch.sync();
                pageWatch.schedule();
                if (!isPopularPage()) return;
                sortSwitch.remember(byKeyboard);
                const url = new URL(location.href);
                url.searchParams.delete('p');
                // A search reloads in pixiv's own order and enters the popular order
                // from there (see restoreInitialOrder).
                const order = url.searchParams.get('order');
                if (popularKind(location.href) === 'search' && POPULAR_ORDERS.has(order)) {
                    url.searchParams.delete('order');
                    if (!rememberEnterOrder(url.href, order)) url.searchParams.set('order', order);
                }
                stopEngines();
                statsCache.flush();
                location.replace(url.href);
            },

            onShowNow() {
                if (this.engine) this.engine.hurry();
                this.showNowButton.disabled = true;
            },

            onClearCache() {
                statsCache.clear();
                popularPool.clear();
                listingCache.clear();
                stopEngines();
                this.cacheNote.textContent = t('cacheCleared');
            },

            attach(engine) {
                if (this.engine === engine) return;
                if (this.engine) this.engine.listeners.delete(this.onEngine);
                this.engine = engine;
                if (engine) engine.listeners.add(this.onEngine);
                this.render();
            },

            onEngine: () => {
                ui.scheduleRender();
                pageWatch.schedule();
            },

            scheduleRender() {
                if (this.renderTimer) return;
                this.renderTimer = setTimeout(() => {
                    this.renderTimer = null;
                    this.render();
                }, 150);
            },

            render() {
                if (!this.ready) return;
                const popular = isPopularPage();
                const engine = popular ? this.engine : null;
                this.renderStatus(engine);
                this.launcher.hidden = !popular;
                if (!popular && !this.settingsOpen) this.menu.hidden = true;
                const state = engine && engine.state;
                const busy = Boolean(state) && !engine.waiting && (state.phase === 'listing' || state.phase === 'ranking');
                this.launcher.classList.toggle('busy', busy);
            },

            renderStatus(engine) {
                const state = engine && engine.state;
                const show = Boolean(engine) && engine.waiting > 0 && state.phase !== 'error' && state.phase !== 'empty';
                if (!show) {
                    this.statusHost.remove();
                    this.spot = null;
                    clearInterval(this.statusTimer);
                    this.statusTimer = null;
                    this.showNowButton.disabled = false;
                    return;
                }
                // In the page (see statusSpot); floating above the launcher otherwise. The
                // spot is looked up again only when pixiv re-renders it.
                if (!this.spot || !this.spot.element.isConnected) this.spot = statusSpot();
                const spot = this.spot;
                if (spot) {
                    const neighbour = spot.after ? spot.element.nextElementSibling : spot.element.previousElementSibling;
                    if (neighbour !== this.statusHost) spot.element[spot.after ? 'after' : 'before'](this.statusHost);
                } else if (this.statusHost.parentNode !== document.body) {
                    document.body.append(this.statusHost);
                }
                this.statusBox.classList.toggle('floating', !spot);
                // The time estimate moves on its own between engine events.
                if (!this.statusTimer) this.statusTimer = setInterval(() => this.render(), 500);
                const now = Date.now();
                const eta = engine.pageEta(now);
                const counting = state.phase === 'ranking' && state.total > 0;
                const meta = [];
                if (counting) meta.push(`${numberFormat.format(state.done)} / ${numberFormat.format(state.total)}`);
                if (eta != null && eta >= 1500) meta.push(t('eta', { seconds: Math.ceil(eta / 1000) }));
                this.statusMeta.textContent = meta.join(' · ');
                let progress = null;
                if (counting) {
                    const elapsed = now - engine.pageStarted;
                    progress = eta != null ? elapsed / (elapsed + eta) : state.done / state.total;
                }
                this.statusBar.classList.toggle('busy', progress == null);
                this.statusFill.style.transform = progress == null ? '' : `scaleX(${Math.min(1, progress).toFixed(3)})`;
                if (engine.hurried) this.showNowButton.disabled = true;
            },
        };
        function setActiveEngine(engine) {
            activeEngine = engine;
            ui.attach(engine);
        }

        // The sorted-by count on pixiv's own thumbnails while the popular order is shown.
        const badges = {
            refresh() {
                if (!(settings.badges && isPopularPage())) {
                    for (const badge of document.querySelectorAll('.pixiv-sort-badge')) badge.remove();
                    return;
                }
                for (const link of document.querySelectorAll('a[data-ga4-label="thumbnail_link"][data-gtm-value]')) {
                    const box = link.firstElementChild;
                    const stats = box && statsCache.get(link.getAttribute('data-gtm-value'));
                    if (!stats) continue;
                    let badge = box.querySelector(':scope > .pixiv-sort-badge');
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'pixiv-sort-badge';
                        box.append(badge);
                    }
                    const count = stats[METRICS[settings.sort].field];
                    const value = `${settings.sort}:${count}`;
                    if (badge.dataset.value === value) continue;
                    badge.dataset.value = value;
                    badge.innerHTML = SORT_ICONS[settings.sort];
                    badge.append(compactFormat.format(count));
                    badge.title = [
                        `♥ ${numberFormat.format(stats.bookmarkCount)}`,
                        `👍 ${numberFormat.format(stats.likeCount)}`,
                        `👁 ${numberFormat.format(stats.viewCount)}`,
                    ].join(' · ');
                }
            },
        };

        // "Sort by popularity" on artist pages and bookmarks, in pixiv's chip style.
        const listToggle = {
            host: null,
            button: null,

            sync() {
                const page = listPage(location.href);
                const spot = page && toggleSpot(page);
                if (!spot) {
                    if (this.host) this.host.remove();
                    return;
                }
                if (!this.host) this.build();
                this.button.classList.toggle('on', page.popular);
                this.button.setAttribute('aria-pressed', String(page.popular));
                // The bookmarks filter bar spaces its items itself.
                this.host.style.marginLeft = page.section === 'bookmarks' ? '0' : '16px';
                if (spot.nextElementSibling !== this.host) spot.after(this.host);
            },

            build() {
                const { host, root } = shadowHost('pixiv-sort-toggle');
                host.style.display = 'flex';
                host.style.alignSelf = 'center';
                this.button = h('button', { class: 'chip', type: 'button', text: t('sortPopular'), onclick: () => this.toggle() });
                root.append(this.button);
                this.host = host;
            },

            // A full navigation: pixiv keeps list pages in its own cache by request, so a
            // route change on the same page shows the cached order and asks for nothing.
            toggle() {
                const page = listPage(location.href);
                if (!page) return;
                const url = new URL(location.href);
                if (page.popular) url.searchParams.delete(LIST_SORT_PARAM);
                else url.searchParams.set(LIST_SORT_PARAM, LIST_SORT_VALUE);
                url.searchParams.delete('p');
                location.assign(url.href);
            },
        };

        // Bookmarks or views, right next to the popular order it changes, in pixiv's
        // segmented style; it shows only while the popular order does. The same choice
        // is in the settings menu.
        const sortSwitch = {
            host: null,
            buttons: [],

            sync() {
                const spot = isPopularPage() ? switchSpot() : null;
                if (!spot) {
                    if (this.host) this.host.remove();
                    return;
                }
                if (!this.host) this.build();
                for (const button of this.buttons) button.setAttribute('aria-pressed', String(button.value === settings.sort));
                // The bookmarks filter bar spaces its items itself.
                const page = listPage(location.href);
                this.host.style.margin = page && page.section === 'bookmarks' ? '0' : '0 8px';
                if (spot.nextElementSibling === this.host) return;
                spot.after(this.host);
                this.restore();
            },

            // Where the switch was on screen before the reload a new order takes.
            remember(byKeyboard) {
                if (!this.host || !this.host.isConnected) return;
                const state = { top: this.host.getBoundingClientRect().top, focus: byKeyboard };
                try {
                    sessionStorage.setItem(SWITCH_RELOAD_KEY, JSON.stringify(state));
                } catch (e) {
                    // The page just starts at the top.
                }
            },

            // After that reload: the switch at the same spot, the new order right below
            // it, and keyboard focus back on it.
            restore() {
                let state = null;
                try {
                    state = JSON.parse(sessionStorage.getItem(SWITCH_RELOAD_KEY) || 'null');
                    sessionStorage.removeItem(SWITCH_RELOAD_KEY);
                } catch (e) {
                    return;
                }
                if (!state || typeof state.top !== 'number') return;
                window.scrollBy(0, this.host.getBoundingClientRect().top - state.top);
                const active = this.buttons.find((button) => button.value === settings.sort);
                if (state.focus && active) active.focus({ preventScroll: true });
            },

            build() {
                const { host, root } = shadowHost('pixiv-sort-switch');
                host.style.display = 'flex';
                host.style.alignItems = 'center';
                host.style.alignSelf = 'center';
                this.buttons = Object.keys(METRICS).map((sort) => {
                    // A click from the keyboard (Enter, Space) has no pointer detail.
                    const button = h('button', { type: 'button', value: sort, onclick: (event) => ui.onSortChange(sort, event.detail === 0) });
                    button.innerHTML = SORT_ICONS[sort];
                    button.append(t(sort));
                    return button;
                });
                root.append(h('div', { class: 'switch', role: 'group', 'aria-label': t('sortBy') }, this.buttons));
                this.host = host;
            },
        };

        // pixiv renders thumbnails, list headers and its search options as they come, so
        // the page is watched, but only where something of the script's can show:
        // popular pages (badges, the sort switch) and list pages (the toggle).
        const pageWatch = {
            timer: null,
            observer: null,

            update() {
                const wanted = isPopularPage() || Boolean(listPage(location.href));
                if (wanted && !this.observer) {
                    this.observer = new MutationObserver(() => this.schedule());
                    this.observer.observe(document.body, { childList: true, subtree: true });
                } else if (!wanted && this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }
                this.schedule();
            },

            schedule() {
                if (this.timer) return;
                this.timer = setTimeout(() => {
                    this.timer = null;
                    safely('badges', () => badges.refresh());
                    safely('list toggle', () => listToggle.sync());
                    safely('loading spacer', collapseLoadingSpacer);
                    safely('sort switch', () => sortSwitch.sync());
                }, 250);
            },
        };

        // pixiv's router changes the address through the history API, so that is where
        // navigation is noticed (instead of watching every DOM change on every page).
        function watchPage() {
            let lastHref = location.href;
            const onLocation = () => {
                if (location.href === lastHref) return;
                lastHref = location.href;
                if (!isPopularPage() && !restoringOrder) leavePopular();
                pageWatch.update();
                ui.scheduleRender();
            };
            for (const name of ['pushState', 'replaceState']) {
                const original = history[name];
                history[name] = function () {
                    const result = original.apply(this, arguments);
                    queueMicrotask(onLocation);
                    return result;
                };
            }
            window.addEventListener('popstate', onLocation);
            pageWatch.update();
        }

        // A part that fails because pixiv changed something must not take the others
        // down: the fetch hook and the router hook keep working without the UI.
        function safely(name, step) {
            try {
                step();
            } catch (error) {
                console.warn(`[Pixiv Sort] ${name} failed`, error);
            }
        }

        function start() {
            dropOldStorage();
            if (popularKind(initialHref)) statsCache.load();
            window.addEventListener('pagehide', () => statsCache.flush());
            safely('order restore', restoreInitialOrder);
            const boot = () => {
                safely('UI', () => {
                    ui.mount();
                    ui.render();
                });
                safely('page watcher', watchPage);
                safely('router hook', () => hookRouter(0));
            };
            if (document.body) boot();
            else document.addEventListener('DOMContentLoaded', boot, { once: true });
        }

        start();
    }
})();
