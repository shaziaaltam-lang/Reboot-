export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  emotion_detected?: string;
  intent?: string;
}

export interface Fact {
  fact: string;
  timestamp: string;
  type: string;
}

export interface VisitedLocation {
  name: string;
  lat: number;
  lng: number;
  timestamp: string;
  whatiSaw: string;
  emotion: string;
}

export interface MappedObject {
  name: string;
  lat: number;
  lng: number;
  relativePos: string; // "1.2m front, 0.5m right"
  lastSeen: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  age?: string;
  job?: string;
  preferences: {
    voice_speed: number;
    personality: string;
    voice_type: string;
    memory_enabled: boolean;
    show_transcripts: boolean;
  };
  known_facts: Fact[];
  interests: string[];
  first_seen: string;
  last_seen: string;
  total_conversations: number;
  mood_history: { mood: string; date: string }[];
  visited_locations?: VisitedLocation[];
  mapped_objects?: MappedObject[];
}

export interface Persona {
  id: string;
  name: string;
  gender: "female" | "male" | "neutral";
  age: string;
  archetype: string;
  traits: string[];
  speech_patterns: {
    greeting_variations: string[];
    farewell_variations: string[];
    thinking_phrases: string[];
    listening_feedback: string[];
  };
  emotional_responses: {
    joy: string;
    sadness: string;
    surprise: string;
    anger: string;
    curiosity: string;
  };
  example_response: string;
}

// Sensor telemetry types for the Eyes of the AI
export interface GPSTelemetry {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  speed: number; // m/s
  heading: number; // degrees
}

export interface MotionTelemetry {
  roll: number; // pitch/roll/yaw (Euler angles)
  pitch: number;
  yaw: number;
  x: number; // acceleration m/s2
  y: number;
  z: number;
}

export interface EnvironmentTelemetry {
  brightnessLux: number;
  pressureHpa: number;
  altitudeEstimate: number;
  near: boolean;
  distanceCm: number;
}

export interface FusionState {
  position_3d: { x: number; y: number; z: number };
  orientation_euler: { roll: number; pitch: number; yaw: number };
  linear_velocity: { x: number; y: number; z: number };
  angular_velocity: { x: number; y: number; z: number };
  linear_acceleration: { x: number; y: number; z: number };
  movement_state: "idle" | "walking" | "running" | "driving" | "falling" | "shaking";
  carrying_state: "hand" | "pocket" | "bag" | "car_mount" | "table";
  stability_score: number;
  step_count: number;
  cadence: number;
  isDizzy: boolean;
  isFallen: boolean;
}

export interface TelemetryData {
  gps: GPSTelemetry;
  motion: MotionTelemetry;
  env: EnvironmentTelemetry;
  fusion: FusionState;
}

export interface AppState {
  currentCallState: "idle" | "listening" | "thinking" | "speaking";
  callDurationSeconds: number;
  activePersona: Persona;
  userProfile: UserProfile;
  messages: Message[];
  selectedTab: "architecture" | "dataflow" | "pipeline" | "memory" | "errors" | "performance" | "broker";
}
