export type CallPhase = 'ready' | 'listening' | 'thinking' | 'speaking' | 'ended';
export type CameraSourceType = 'local' | 'robot';

export interface CameraSource {
  id: string;
  label: string;
  type: CameraSourceType;
  facingMode?: 'user' | 'environment';
  robotId?: string;
  cameraId?: string;
}

export const defaultCameraSources: CameraSource[] = [
  { id: 'phone-front', label: '手机前置摄像头', type: 'local', facingMode: 'user' },
  { id: 'phone-rear', label: '手机后置摄像头', type: 'local', facingMode: 'environment' },
  {
    id: 'robot-head',
    label: '机器人头部摄像头',
    type: 'robot',
    robotId: 'ROBOT-01',
    cameraId: 'head',
  },
  {
    id: 'robot-chest',
    label: '机器人胸部摄像头',
    type: 'robot',
    robotId: 'ROBOT-01',
    cameraId: 'chest',
  },
  {
    id: 'robot-wrist',
    label: '机器人腕部摄像头',
    type: 'robot',
    robotId: 'ROBOT-01',
    cameraId: 'wrist',
  },
];

export const phasePresentation: Record<CallPhase, { label: string; showDots: boolean }> = {
  ready: { label: '你可以开始说话', showDots: true },
  listening: { label: '正在聆听…', showDots: true },
  thinking: { label: '正在思考…', showDots: true },
  speaking: { label: '说话或点击打断', showDots: false },
  ended: { label: '通话已结束', showDots: false },
};
