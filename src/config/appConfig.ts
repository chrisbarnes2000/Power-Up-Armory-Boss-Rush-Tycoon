import { APP_VERSION, DEV_BUILD_VERSION } from '../version';

export interface AppConfig {
  version: string;
  versionTag: string;
  devVersionTag: string;
  releaseName: string;
  appName: string;
  fullTitle: string;
  year: number;
  analytics: {
    googleAnalyticsMeasurementId: string;
    vemetricProjectId: string;
  };
  partner: {
    name: string;
    url: string;
    description: string;
  };
  governance: {
    jpl: string;
    a11y: string;
    itil: string;
    srs: string;
  };
}

export const APP_CONFIG: AppConfig = {
  version: APP_VERSION,
  versionTag: `v${APP_VERSION}`,
  devVersionTag: `v${DEV_BUILD_VERSION}`,
  releaseName: 'Boss Rush Tycoon · Shop Architecture',
  appName: 'Power-Up Armory',
  fullTitle: 'Power-Up Armory · Boss Rush Tycoon',
  year: 2026,
  analytics: {
    googleAnalyticsMeasurementId: 'G-YX5LPMCNB8',
    vemetricProjectId: 'noe2otBcUczGyZJF'
  },
  partner: {
    name: 'RapportVerse',
    url: 'https://rapprt.space',
    description: 'Visual human relationship mapping, qualitative trust topology, and neurodiversity-affirming connection architecture.'
  },
  governance: {
    jpl: 'NASA JPL Power of 10',
    a11y: 'WCAG 2.1/2.2 AA Accessible',
    itil: 'ITIL v4 Service Management',
    srs: 'IEEE 830 SRS / FSD Spec'
  }
};
