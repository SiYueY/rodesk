<script setup lang="ts">
import CallControlButton from './CallControlButton.vue';

defineProps<{
  micEnabled: boolean;
  cameraEnabled: boolean;
  subtitleEnabled: boolean;
  speakerEnabled: boolean;
  ended: boolean;
}>();
const emit = defineEmits<{
  'toggle-mic': [];
  'toggle-camera': [];
  'toggle-subtitle': [];
  'toggle-speaker': [];
  end: [];
  more: [];
}>();
</script>

<template>
  <div class="call-control-area">
    <div class="call-controls">
      <CallControlButton
        label="麦克风"
        :enabled="micEnabled"
        :disabled="ended"
        @click="emit('toggle-mic')"
      >
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <rect height="11" rx="3" width="6" x="9" y="3"></rect>
          <path
            d="M6.5 11.5a5.5 5.5 0 0 0 11 0"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          ></path>
          <path
            d="M12 17v4M9 21h6"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          ></path>
        </svg>
      </CallControlButton>
      <CallControlButton
        label="摄像头"
        :enabled="cameraEnabled"
        :disabled="ended"
        @click="emit('toggle-camera')"
      >
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <rect height="12" rx="2.4" width="12" x="3" y="6"></rect>
          <path d="M16 10.2 21 7.7v8.6L16 13.8z"></path>
        </svg>
      </CallControlButton>
      <button
        aria-label="字幕"
        class="call-control subtitle"
        :class="{ 'is-off': !subtitleEnabled }"
        type="button"
        :aria-pressed="subtitleEnabled"
        :disabled="ended"
        @click="emit('toggle-subtitle')"
      >
        <span> 字 </span>
      </button>
      <CallControlButton
        label="扬声器"
        :enabled="speakerEnabled"
        :disabled="ended"
        @click="emit('toggle-speaker')"
      >
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 9h4l5-4v14l-5-4H4z"></path>
          <path
            d="M16 8.2a5 5 0 0 1 0 7.6"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          ></path>
          <path
            d="M18.5 5.8a8.4 8.4 0 0 1 0 12.4"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          ></path>
        </svg>
      </CallControlButton>
      <button
        aria-label="结束通话"
        class="call-control end"
        type="button"
        :disabled="ended"
        @click="emit('end')"
      >
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M6 6l12 12M18 6 6 18"></path>
        </svg>
      </button>
      <button
        aria-label="更多"
        class="call-control secondary"
        type="button"
        :disabled="ended"
        @click="emit('more')"
      >
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.8"></circle>
          <circle cx="12" cy="12" r="1.8"></circle>
          <circle cx="19" cy="12" r="1.8"></circle>
        </svg>
      </button>
    </div>
  </div>
</template>
