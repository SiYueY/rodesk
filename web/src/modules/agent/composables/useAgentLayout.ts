import { computed, onMounted, onUnmounted, ref, type CSSProperties } from 'vue';

export const SIDEBAR_DEFAULT_WIDTH = 280;
export const SIDEBAR_MIN_WIDTH = 264;
export const SIDEBAR_MAX_WIDTH = 420;
export const RIGHTBAR_MIN_WIDTH = 300;
export const RIGHTBAR_MAX_RATIO = 0.7;
export const RIGHTBAR_DEFAULT_RATIO = 0.45;
export const CONVERSATION_MIN_WIDTH = 400;
export const NARROW_VIEWPORT_QUERY = '(max-width: 1023px)';

export type DragSide = 'sidebar' | 'rightbar';

export interface AgentLayoutState {
  frameWidth: number;
  narrow: boolean;
  sidebarExpanded: boolean;
  rightbarExpanded: boolean;
  sidebarWidth: number;
  rightbarWidth: number;
}

export interface AgentLayoutColumns {
  left: number;
  right: number;
}

interface DragState {
  side: DragSide;
  pointerId: number;
  startX: number;
  startSidebar: number;
  startRightbar: number;
}

export function clampWidth(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

export function resolveAgentLayoutColumns(state: AgentLayoutState): AgentLayoutColumns {
  if (state.narrow) return { left: 0, right: 0 };

  const left = state.sidebarExpanded
    ? clampWidth(state.sidebarWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH)
    : 0;
  const rightLimit = Math.min(
    state.frameWidth * RIGHTBAR_MAX_RATIO,
    Math.max(0, state.frameWidth - left - CONVERSATION_MIN_WIDTH),
  );
  const right =
    state.rightbarExpanded && rightLimit >= RIGHTBAR_MIN_WIDTH
      ? clampWidth(state.rightbarWidth, RIGHTBAR_MIN_WIDTH, rightLimit)
      : 0;

  return { left, right };
}

export function useAgentLayout() {
  const frame = ref<HTMLElement>();
  const narrow = ref(false);
  const sidebarExpanded = ref(true);
  const rightbarExpanded = ref(true);
  const frameWidth = ref(typeof window === 'undefined' ? 0 : window.innerWidth);
  const sidebarWidth = ref(SIDEBAR_DEFAULT_WIDTH);
  const rightbarWidth = ref(
    (typeof window === 'undefined' ? 0 : window.innerWidth) * RIGHTBAR_DEFAULT_RATIO,
  );
  const drag = ref<DragState | null>(null);

  let media: MediaQueryList | undefined;
  let observer: ResizeObserver | undefined;

  const columns = computed(() =>
    resolveAgentLayoutColumns({
      frameWidth: frameWidth.value,
      narrow: narrow.value,
      sidebarExpanded: sidebarExpanded.value,
      rightbarExpanded: rightbarExpanded.value,
      sidebarWidth: sidebarWidth.value,
      rightbarWidth: rightbarWidth.value,
    }),
  );
  const rightbarVisible = computed(() =>
    narrow.value ? rightbarExpanded.value : columns.value.right > 0,
  );
  const gridStyle = computed<CSSProperties>(() => ({
    gridTemplateColumns: columns.value.left + 'px minmax(0, 1fr) ' + columns.value.right + 'px',
  }));

  function updateViewport(event?: MediaQueryListEvent) {
    const isNarrow = event?.matches ?? media?.matches ?? window.innerWidth < 1024;
    narrow.value = isNarrow;
    sidebarExpanded.value = !isNarrow;
    rightbarExpanded.value = !isNarrow;
  }

  function toggleSidebar() {
    sidebarExpanded.value = !sidebarExpanded.value;
    if (narrow.value && sidebarExpanded.value) rightbarExpanded.value = false;
  }

  function toggleRightbar() {
    rightbarExpanded.value = !rightbarExpanded.value;
    if (narrow.value && rightbarExpanded.value) sidebarExpanded.value = false;
  }

  function openSidebar() {
    sidebarExpanded.value = true;
    if (narrow.value) rightbarExpanded.value = false;
  }

  function openRightbar() {
    rightbarExpanded.value = true;
    if (narrow.value) sidebarExpanded.value = false;
  }

  function closeSidebarAfterNavigation() {
    if (narrow.value) sidebarExpanded.value = false;
  }

  function onDragStart(side: DragSide, event: PointerEvent) {
    if (event.button !== 0 || narrow.value) return;

    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    drag.value = {
      side,
      pointerId: event.pointerId,
      startX: event.clientX,
      startSidebar: columns.value.left,
      startRightbar: columns.value.right,
    };
  }

  function onDragMove(event: PointerEvent) {
    const activeDrag = drag.value;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

    const delta = event.clientX - activeDrag.startX;
    if (activeDrag.side === 'sidebar') {
      sidebarWidth.value = clampWidth(
        activeDrag.startSidebar + delta,
        SIDEBAR_MIN_WIDTH,
        SIDEBAR_MAX_WIDTH,
      );
      return;
    }

    rightbarWidth.value = clampWidth(
      activeDrag.startRightbar - delta,
      RIGHTBAR_MIN_WIDTH,
      frameWidth.value * RIGHTBAR_MAX_RATIO,
    );
  }

  function onDragEnd(event: PointerEvent) {
    if (drag.value?.pointerId !== event.pointerId) return;

    if (
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.value = null;
  }

  onMounted(() => {
    media = window.matchMedia(NARROW_VIEWPORT_QUERY);
    updateViewport();
    media.addEventListener('change', updateViewport);

    observer = new ResizeObserver(([entry]) => {
      frameWidth.value = entry.contentRect.width;
    });
    if (frame.value) observer.observe(frame.value);
  });

  onUnmounted(() => {
    media?.removeEventListener('change', updateViewport);
    observer?.disconnect();
  });

  return {
    columns,
    drag,
    frame,
    gridStyle,
    narrow,
    rightbarExpanded,
    rightbarVisible,
    sidebarExpanded,
    openRightbar,
    openSidebar,
    toggleRightbar,
    toggleSidebar,
    closeSidebarAfterNavigation,
    onDragEnd,
    onDragMove,
    onDragStart,
  };
}
