export interface CallService {
  start(): Promise<void>;
  end(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  setSubtitleEnabled(enabled: boolean): Promise<void>;
  setSpeakerEnabled(enabled: boolean): Promise<void>;
}
