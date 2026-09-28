import { User } from 'firebase/auth';

export interface RoadmapItem {
  id: string;
  title: string;
  category: string;
  status: 'Planned' | 'In Development' | 'Released';
  votes: number;
  description: string;
}

export interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  isBeta?: boolean;
  onToggleBeta?: (enabled: boolean) => void;
  user: User | null;
  initialTab?: 'dev' | 'public' | 'aidbase' | 'beta';
}

export interface BroadcastStatusResponse {
  config: any;
  state: {
    publicReleasedVersion: string;
  };
  preview: {
    feedhiveCopy: string;
  };
}
