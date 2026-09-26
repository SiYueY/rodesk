import { computed, ref } from 'vue';
import type { CameraSource } from '../types';

export function useCameraSources(initialSources: CameraSource[]) {
  const sources = ref(initialSources);
  const selectedId = ref(initialSources[0]?.id ?? '');
  const selectedSource = computed(
    () => sources.value.find((source) => source.id === selectedId.value) ?? null,
  );
  const menuOpen = ref(false);

  function selectSource(id: string): CameraSource | null {
    const source = sources.value.find((candidate) => candidate.id === id);
    if (!source) return null;
    selectedId.value = source.id;
    menuOpen.value = false;
    return source;
  }
  function openMenu() {
    menuOpen.value = true;
  }
  function closeMenu() {
    menuOpen.value = false;
  }
  function toggleMenu() {
    menuOpen.value = !menuOpen.value;
  }

  return {
    sources,
    selectedId,
    selectedSource,
    menuOpen,
    selectSource,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}
