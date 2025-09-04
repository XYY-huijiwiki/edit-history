<template>
  <shadow-root>
    <fieldset>
      <legend>Limit</legend>
      <div>
        <select v-model="selection" @change="$emit('update')">
          <option
            v-for="item in menuItems"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label || item.value }}
          </option>
        </select>
      </div>
    </fieldset>
  </shadow-root>
</template>

<script setup lang="ts">
import { defineModel, defineEmits } from "vue";
import { ShadowRoot } from "vue-shadow-dom";

const selection = defineModel<number>({
  type: Number,
  required: true,
});

defineEmits(["update"]);

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
