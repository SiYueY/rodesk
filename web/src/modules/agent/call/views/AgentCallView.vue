<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import CallMediaLayer from '../components/CallMediaLayer.vue';
import CallTopBar from '../components/CallTopBar.vue';
import CallStatus from '../components/CallStatus.vue';
import CallControls from '../components/CallControls.vue';
import CallMoreSheet from '../components/CallMoreSheet.vue';
import CallToast from '../components/CallToast.vue';
import { useCallSession } from '../composables/useCallSession';
import { useCameraSources } from '../composables/useCameraSources';
import { defaultCameraSources, phasePresentation } from '../types';
import { callRuntimeFactoryKey, createCallRuntime } from '../services';
import '../call.css';

const router = useRouter();
const call = useCallSession();
const camera = useCameraSources(defaultCameraSources);
const runtime = inject(callRuntimeFactoryKey, createCallRuntime)();
const presentation = computed(() => phasePresentation[call.phase.value]);
let active = true;
let closed = false;
let closing: Promise<void> | null = null;
let ending = false;
let sourceRequest = 0;
const pending = new Set<'mic' | 'camera' | 'subtitle' | 'speaker'>();

function reportError(reason: unknown) {
  if (active) call.showToast(reason instanceof Error ? reason.message : '通话操作失败');
}
watch(runtime.camera.error, (message) => {
  if (message) reportError(new Error(message));
});
async function performToggle(
  key: 'mic' | 'camera' | 'subtitle' | 'speaker',
  operation: () => Promise<void>,
  commit: () => void,
) {
  if (!active || call.ended.value || pending.has(key)) return;
  pending.add(key);
  try {
    await operation();
    if (active && !call.ended.value) commit();
  } catch (reason) {
    reportError(reason);
  } finally {
    pending.delete(key);
  }
}
function toggleMic() {
  return performToggle(
    'mic',
    () => runtime.service.setMicrophoneEnabled(!call.micEnabled.value),
    call.toggleMicrophone,
  );
}
function toggleCamera() {
  const next = !call.cameraEnabled.value;
  return performToggle(
    'camera',
    async () => {
      await runtime.service.setCameraEnabled(next);
      try {
        if (next && camera.selectedSource.value)
          await runtime.camera.open(camera.selectedSource.value);
        else {
          sourceRequest += 1;
          runtime.camera.close();
        }
      } catch (reason) {
        await runtime.service.setCameraEnabled(!next);
        throw reason;
      }
    },
    () => {
      call.toggleCamera();
      if (!next) camera.closeMenu();
    },
  );
}
function toggleSubtitle() {
  return performToggle(
    'subtitle',
    () => runtime.service.setSubtitleEnabled(!call.subtitleEnabled.value),
    call.toggleSubtitle,
  );
}
function toggleSpeaker() {
  return performToggle(
    'speaker',
    () => runtime.service.setSpeakerEnabled(!call.speakerEnabled.value),
    call.toggleSpeaker,
  );
}
async function selectCamera(id: string) {
  if (!active || call.ended.value) return;
  const source = camera.sources.value.find((candidate) => candidate.id === id);
  if (!source) return;
  const request = ++sourceRequest;
  try {
    await runtime.camera.open(source);
    if (request !== sourceRequest || !active || call.ended.value) return;
    camera.selectSource(id);
    call.showToast(`已切换到${source.label}`);
  } catch (reason) {
    if (request === sourceRequest) reportError(reason);
  }
}
function closeSession(): Promise<void> {
  if (closing) return closing;
  if (closed) return Promise.resolve();
  active = false;
  closed = true;
  sourceRequest += 1;
  runtime.camera.close();
  closing = Promise.resolve()
    .then(() => runtime.service.end())
    .finally(() => {
      closing = null;
    });
  return closing;
}
function endCall() {
  if (ending) return;
  ending = true;
  camera.closeMenu();
  void closeSession().catch((reason: unknown) => {
    console.warn('Call cleanup failed', reason);
  });
  void router.replace('/');
}
onMounted(() => {
  void runtime.service
    .start()
    .then(() =>
      active && camera.selectedSource.value
        ? runtime.camera.open(camera.selectedSource.value)
        : undefined,
    )
    .catch(reportError);
});
onUnmounted(() => {
  active = false;
  camera.closeMenu();
  if (!ending) {
    void closeSession().catch((reason: unknown) => {
      console.warn('Call cleanup failed', reason);
    });
  }
});
</script>

<template>
  <main
    class="agent-call-page"
    :class="{ 'camera-off': !call.cameraEnabled.value, ended: call.ended.value }"
  >
    <CallMediaLayer
      :stream="runtime.camera.stream.value"
      :camera-enabled="call.cameraEnabled.value"
      @playback-error="call.showToast($event)"
    />
    <section class="call-overlay">
      <CallTopBar
        :camera-enabled="call.cameraEnabled.value"
        :ended="call.ended.value"
        :camera-menu-open="camera.menuOpen.value"
        :selected-camera-id="camera.selectedId.value"
        :camera-sources="camera.sources.value"
        @scenario="call.showToast('情景选择器占位')"
        @toggle-camera-menu="camera.toggleMenu"
        @select-camera="selectCamera"
        @close-camera-menu="camera.closeMenu"
      />
      <div />
      <CallStatus
        :label="presentation.label"
        :show-dots="presentation.showDots"
        :ended="call.ended.value"
        @cycle="call.cyclePhase"
      />
      <CallControls
        :mic-enabled="call.micEnabled.value"
        :camera-enabled="call.cameraEnabled.value"
        :subtitle-enabled="call.subtitleEnabled.value"
        :speaker-enabled="call.speakerEnabled.value"
        :ended="call.ended.value"
        @toggle-mic="toggleMic"
        @toggle-camera="toggleCamera"
        @toggle-subtitle="toggleSubtitle"
        @toggle-speaker="toggleSpeaker"
        @end="endCall"
        @more="call.openMore"
      />
    </section>
    <CallMoreSheet
      :open="call.moreOpen.value"
      @close="call.closeMore"
      @scenario="call.showToast('情景选择器占位')"
      @subtitle="toggleSubtitle"
      @device="call.showToast('设备设置占位')"
    />
    <CallToast :message="call.toastMessage.value" :visible="call.toastVisible.value" />
  </main>
</template>
