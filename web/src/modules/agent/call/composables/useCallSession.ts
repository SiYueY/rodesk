import { getCurrentScope, onScopeDispose, ref } from 'vue';
import type { CallPhase } from '../types';

const demoPhases: CallPhase[] = ['ready', 'listening', 'thinking', 'speaking'];

export function useCallSession() {
  const micEnabled = ref(true);
  const cameraEnabled = ref(true);
  const subtitleEnabled = ref(true);
  const speakerEnabled = ref(true);
  const phase = ref<CallPhase>('ready');
  const ended = ref(false);
  const moreOpen = ref(false);
  const toastMessage = ref('');
  const toastVisible = ref(false);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  function showToast(message: string) {
    toastMessage.value = message;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, 1500);
  }
  function toggleMicrophone() {
    if (ended.value) return;
    micEnabled.value = !micEnabled.value;
    showToast(micEnabled.value ? '麦克风已开启' : '麦克风已关闭');
  }
  function toggleCamera() {
    if (ended.value) return;
    cameraEnabled.value = !cameraEnabled.value;
    showToast(cameraEnabled.value ? '已开启摄像头' : '已切换为语音通话');
  }
  function toggleSubtitle() {
    if (ended.value) return;
    subtitleEnabled.value = !subtitleEnabled.value;
    showToast(subtitleEnabled.value ? '字幕已开启' : '字幕已关闭');
  }
  function toggleSpeaker() {
    if (ended.value) return;
    speakerEnabled.value = !speakerEnabled.value;
    showToast(speakerEnabled.value ? '扬声器已开启' : '扬声器已关闭');
  }
  function cyclePhase() {
    if (ended.value) return;
    phase.value = demoPhases[(demoPhases.indexOf(phase.value) + 1) % demoPhases.length];
  }
  function setPhase(next: CallPhase) {
    if (!ended.value) phase.value = next;
  }
  function openMore() {
    if (!ended.value) moreOpen.value = true;
  }
  function closeMore() {
    moreOpen.value = false;
  }
  function endCall() {
    if (ended.value) return;
    ended.value = true;
    phase.value = 'ended';
    closeMore();
    showToast('通话已结束');
  }
  function dispose() {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = undefined;
  }
  if (getCurrentScope()) onScopeDispose(dispose);

  return {
    micEnabled,
    cameraEnabled,
    subtitleEnabled,
    speakerEnabled,
    phase,
    ended,
    moreOpen,
    toastMessage,
    toastVisible,
    showToast,
    toggleMicrophone,
    toggleCamera,
    toggleSubtitle,
    toggleSpeaker,
    cyclePhase,
    setPhase,
    openMore,
    closeMore,
    endCall,
    dispose,
  };
}
