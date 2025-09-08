<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import OptionBox from "./components/OptionBox.vue";
import { xor2, union } from "./utils";

// Configuration
const API_URL = "/w/api.php";

// State
const defaultOptions: Options = {
  limit: 50,
  my_name: "",
  show: [],
  reviewed: [],
};
const options = useLocalStorage<Options>(
  `[${__APP_ID__}] options`,
  defaultOptions
);
function resetOptions() {
  confirm(
    "Are you sure you want to reset all options? This will also remove all reviewed marks."
  ) && (options.value = defaultOptions);
}

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

    // Mark my edits as reviewed
    markMyEditsAsReviewed(uniqueNewChanges);

    // revert the order to maintain chronological order
    uniqueNewChanges.reverse();

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

    // Mark my edits as reviewed
    markMyEditsAsReviewed(newChanges);

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

onMounted(() => {
  refreshChanges();
});

function markMyEditsAsReviewed(rawChanges: RecentChange[]) {
  if (!options.value.my_name) return;
  const myEdits = rawChanges
    .filter((change) => change.user === options.value.my_name)
    .map((change) => change.rcid);
  options.value.reviewed = union(options.value.reviewed, myEdits);
}
</script>

<template>
  <option-box
    v-model="options"
    @update="refreshChanges"
    @reset="resetOptions"
  />

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
    <hr class="!m-0" />

    <div class="text-xs truncate" v-for="change in changes" :key="change.rcid">
      <input
        type="checkbox"
        :checked="options.reviewed.includes(change.rcid)"
        @click="options.reviewed = xor2(options.reviewed, [change.rcid])"
        class="inline-block"
      />
      {{ new Date(change.timestamp).toLocaleDateString() }}
      {{ new Date(change.timestamp).toLocaleTimeString() }}
      |
      <a
        target="_blank"
        v-if="change.type === 'edit'"
        :href="`https://xyy.huijiwiki.com/index.php?title=${encodeURIComponent(
          change.title
        )}&curid=${change.rcid}&diff=${change.revid}&oldid=${change.old_revid}`"
        @click="options.reviewed = union(options.reviewed, [change.rcid])"
        @auxclick="
          (e) => {
            if (e.button === 1)
              options.reviewed = union(options.reviewed, [change.rcid]);
          }
        "
      >
        {{ `#${change.rcid}` }}
      </a>
      <span v-else>
        {{ `#${change.rcid}` }}
      </span>
      |
      <a target="_blank" :href="`/wiki/${encodeURIComponent(change.title)}`">
        {{ change.title }}
      </a>
      |
      <a
        target="_blank"
        :href="`/wiki/User:${encodeURIComponent(change.user)}`"
      >
        {{ change.user }}
      </a>
      |
      <span v-if="change.type !== 'edit'">
        {{ change.logtype }}
      </span>
      <span v-else>
        {{
          new Intl.NumberFormat(undefined, {
            signDisplay: "always",
          }).format((change.newlen || 0) - (change.oldlen || 0))
        }}
        Bytes
      </span>
      |
      <span v-html="change.parsedcomment || '(No edit comment)'"></span>
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
