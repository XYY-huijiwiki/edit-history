<template>
  <shadow-root>
    <fieldset>
      <legend>筛选</legend>
      <label v-for="checkbox in checkboxes" :key="'checkbox-' + checkbox.value">
        <input
          type="checkbox"
          :value="checkbox.value"
          v-model="options.show"
          @change="$emit('update')"
        />
        {{ checkbox.label }}
      </label>
    </fieldset>
    <fieldset>
      <legend>选项</legend>
      <div>
        每次加载<select v-model="options.limit">
          <option
            v-for="item in menuItems"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label || item.value }}
          </option></select
        >条数据。
      </div>
      <div>
        自动将自己（<input
          type="text"
          v-model="options.my_name"
          style="width: 8em"
        />）的操作标记为已检查。留空则禁用。
      </div>
      <div>
        <button @click="$emit('reset')" type="button" style="cursor: pointer">
          重置
        </button>
        所有选项。这也会清空已检查标记。
      </div>
    </fieldset>
  </shadow-root>
</template>

<script setup lang="ts">
import { defineModel, defineEmits } from "vue";
import { ShadowRoot } from "vue-shadow-dom";

const options = defineModel<Options>({
  required: true,
});

defineEmits(["update", "reset"]);

interface Checkbox {
  label: string;
  value: string;
}

const checkboxes: Checkbox[] = [
  {
    label: "!anon",
    value: "!anon",
  },
  {
    label: "!autopatrolled",
    value: "!autopatrolled",
  },
  {
    label: "!bot",
    value: "!bot",
  },
  {
    label: "!minor",
    value: "!minor",
  },
  {
    label: "!patrolled",
    value: "!patrolled",
  },
  {
    label: "!redirect",
    value: "!redirect",
  },
  {
    label: "anon",
    value: "anon",
  },
  {
    label: "autopatrolled",
    value: "autopatrolled",
  },
  {
    label: "bot",
    value: "bot",
  },
  {
    label: "minor",
    value: "minor",
  },
  {
    label: "patrolled",
    value: "patrolled",
  },
  {
    label: "redirect",
    value: "redirect",
  },
  {
    label: "unpatrolled",
    value: "unpatrolled",
  },
];

interface MenuItem {
  label?: string;
  value: number;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "250", value: 250 },
  { label: "500", value: 500 },
];
</script>
