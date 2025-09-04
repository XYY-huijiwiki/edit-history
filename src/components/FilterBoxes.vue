<template>
  <shadow-root>
    <fieldset>
      <legend>Filter</legend>
      <div>
        <label
          v-for="checkbox in checkboxes"
          :key="'checkbox-' + checkbox.value"
        >
          <input
            type="checkbox"
            :value="checkbox.value"
            v-model="checkboxValue"
            @change="$emit('update')"
          />
          {{ checkbox.label }}
        </label>
      </div>
    </fieldset>
  </shadow-root>
</template>

<script setup lang="ts">
import { defineModel, defineEmits } from "vue";
import { ShadowRoot } from "vue-shadow-dom";

const checkboxValue = defineModel<string[]>({
  type: Array,
  required: true,
});

defineEmits(["update"]);

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
</script>
