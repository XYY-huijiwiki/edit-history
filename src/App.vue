<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import FilterBoxes from "./components/FilterBoxes.vue";
import LimitSelector from "./components/LimitSelector.vue";

// Configuration
const API_URL = "/w/api.php";

// Types
type ChangeType = "edit" | "new" | "log" | "categorize" | "external";

interface RecentChange {
  rcid: number;
  type: ChangeType;
  title: string;
  timestamp: string;
  user: string;
  parsedcomment: string;
  minor?: boolean;
  bot?: boolean;
  newlen?: number;
  oldlen?: number;
  revid?: number;
  old_revid?: number;
}

type ShowOption =
  | "!anon"
  | "!autopatrolled"
  | "!bot"
  | "!minor"
  | "!patrolled"
  | "!redirect"
  | "anon"
  | "autopatrolled"
  | "bot"
  | "minor"
  | "patrolled"
  | "redirect"
  | "unpatrolled";

interface Options {
  limit: number;
  show: ShowOption[];
}

// State
const options = useLocalStorage<Options>(`[${__APP_ID__}] options`, {
  limit: 50,
  show: [],
});

const continueToken = ref<Record<string, string> | null>(null);
const oldestTimestamp = ref<string | null>(null);
const newestTimestamp = ref<string | null>(null);
const displayedChanges = ref(new Set<number>());
const changes = ref<RecentChange[]>([]);
const loading = ref(false);
const loadingNewer = ref(false);
const error = ref<string | null>(null);

// Computed
const hasOlderChanges = computed(() => !!continueToken.value);

// Methods
function refreshChanges() {
  continueToken.value = null;
  oldestTimestamp.value = null;
  newestTimestamp.value = null;
  displayedChanges.value.clear();
  changes.value = [];
  loadOlderChanges();
}

async function loadNewerChanges() {
  if (loadingNewer.value || !newestTimestamp.value) return;

  loadingNewer.value = true;
  error.value = null;

  const url = new URL(API_URL, window.location.origin);
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "recentchanges");
  url.searchParams.set("format", "json");
  url.searchParams.set("rctype", "edit|new|log|categorize|external");
  url.searchParams.set(
    "rcprop",
    "title|timestamp|user|parsedcomment|flags|ids|sizes|loginfo"
  );
  url.searchParams.set("rclimit", options.value.limit.toString());
  url.searchParams.set("rcstart", newestTimestamp.value);
  url.searchParams.set("rcdir", "newer");

  if (options.value.show.length) {
    url.searchParams.set("rcshow", options.value.show.join("|"));
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    if (data.error) throw new Error(data.error.info);

    const newChanges = data.query.recentchanges as RecentChange[];

    if (newChanges.length === 0) {
      alert("No new changes found.");
      return;
    }

    // Filter out any changes that might already be in our list
    const uniqueNewChanges = newChanges.filter(
      (change) =>
        !displayedChanges.value.has(change.rcid) &&
        change.timestamp > newestTimestamp.value!
    );

    if (uniqueNewChanges.length === 0) {
      alert("No new changes found.");
      return;
    }

    // Add new changes to the beginning of the list
    uniqueNewChanges.forEach((change) => {
      displayedChanges.value.add(change.rcid);
    });

    changes.value.unshift(...uniqueNewChanges);

    // Update the newest timestamp
    newestTimestamp.value = uniqueNewChanges[0].timestamp;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "An unknown error occurred";
  } finally {
    loadingNewer.value = false;
  }
}

async function loadOlderChanges() {
  if (loading.value) return;

  loading.value = true;
  error.value = null;

  const url = new URL(API_URL, window.location.origin);
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "recentchanges");
  url.searchParams.set("format", "json");
  url.searchParams.set("rctype", "edit|new|log|categorize|external");
  url.searchParams.set(
    "rcprop",
    "title|timestamp|user|parsedcomment|flags|ids|sizes|loginfo"
  );
  url.searchParams.set("rclimit", options.value.limit.toString());
  url.searchParams.set("rcdir", "older");

  if (options.value.show.length) {
    url.searchParams.set("rcshow", options.value.show.join("|"));
  }

  if (continueToken.value) {
    for (const key in continueToken.value) {
      url.searchParams.set(key, continueToken.value[key]);
    }
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    if (data.error) throw new Error(data.error.info);

    const newChanges = data.query.recentchanges as RecentChange[];
    continueToken.value = data.continue || null;

    // Filter out duplicates
    const uniqueChanges = newChanges.filter(
      (change) => !displayedChanges.value.has(change.rcid)
    );

    uniqueChanges.forEach((change) => {
      displayedChanges.value.add(change.rcid);
    });

    changes.value.push(...uniqueChanges);

    // Set timestamps if not set
    if (changes.value.length > 0) {
      if (!newestTimestamp.value) {
        newestTimestamp.value = changes.value[0].timestamp;
      }
      oldestTimestamp.value = changes.value[changes.value.length - 1].timestamp;
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "An unknown error occurred";
  } finally {
    loading.value = false;
  }
}

function formatFlags(change: RecentChange) {
  const flags = [];
  if (change.type === "new") flags.push("N");
  if (change.minor) flags.push("M");
  if (change.bot) flags.push("B");
  return flags.length > 0 ? flags.join("") : "(No flags)";
}

onMounted(() => {
  refreshChanges();
});
</script>

<template>
  <filter-boxes v-model="options.show" @update="refreshChanges" />
  <limit-selector v-model="options.limit" @update="refreshChanges" />

  <div v-if="error" class="error mt-4 font-bold">Error: {{ error }}</div>
  <div
    v-else
    class="border-4 border-[var(--divider-on-surface)] rounded p-4 mb-4 mt-4"
  >
    <button
      @click="loadNewerChanges"
      :disabled="loadingNewer || !newestTimestamp"
      class="mdui-btn mdui-btn-raised mdui-color- mdui-btn-dense bg-primary mb-4"
    >
      {{ loadingNewer ? "Checking..." : "Check for New Changes" }}
    </button>
    <div v-for="change in changes" :key="change.rcid">
      <hr class="!m-0" />
      <span class="text-sm">
        <a
          v-if="change.type === 'edit'"
          :href="`https://xyy.huijiwiki.com/index.php?title=${encodeURIComponent(
            change.title
          )}&curid=${change.rcid}&diff=${change.revid}&oldid=${
            change.old_revid
          }`"
        >
          {{ `#${change.rcid}` }}
        </a>
        <span v-else>
          {{ `#${change.rcid}` }}
        </span>
        |
        {{ new Date(change.timestamp).toLocaleDateString() }}
        {{ new Date(change.timestamp).toLocaleTimeString() }}
        |
        {{ formatFlags(change) }}
        |
        <a :href="`/wiki/User:${encodeURIComponent(change.user)}`">
          {{ change.user }}
        </a>
        |
        <span>
          {{
            new Intl.NumberFormat(undefined, {
              signDisplay: "always",
            }).format((change.newlen || 0) - (change.oldlen || 0))
          }}
          Bytes
        </span>
      </span>
      <div class="text-sm">
        <a :href="`/wiki/${encodeURIComponent(change.title)}`">
          {{ change.title }}
        </a>
        |
        <span v-html="change.parsedcomment || '(No edit comment)'"></span>
      </div>
    </div>
    <hr class="!mb-4 !mt-0" />
    <button
      @click="loadOlderChanges"
      :disabled="loading || !hasOlderChanges"
      class="mdui-btn mdui-btn-raised mdui-color- mdui-btn-dense bg-primary"
    >
      {{ loading ? "Loading..." : "Load Older Changes" }}
    </button>
  </div>
</template>
