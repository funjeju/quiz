import { adminDb } from '@/lib/firebase/admin';

export interface PipelineConfig {
  isAutoPilotEnabled: boolean;
  lastAutoRun?: any;
  autoRunStatus?: string;
  updatedAt: any;
}

const CONFIG_DOC_PATH = 'system_configs/pipeline';

export async function getPipelineConfig(): Promise<PipelineConfig> {
  try {
    const doc = await adminDb.doc(CONFIG_DOC_PATH).get();
    if (!doc.exists) {
      // Default config
      const defaultConfig: PipelineConfig = {
        isAutoPilotEnabled: true,
        updatedAt: new Date(),
      };
      await adminDb.doc(CONFIG_DOC_PATH).set(defaultConfig);
      return defaultConfig;
    }
    return doc.data() as PipelineConfig;
  } catch (error) {
    console.error('Error fetching pipeline config:', error);
    return { isAutoPilotEnabled: true, updatedAt: new Date() };
  }
}

export async function updatePipelineConfig(updates: Partial<PipelineConfig>) {
  try {
    await adminDb.doc(CONFIG_DOC_PATH).set({
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating pipeline config:', error);
    throw error;
  }
}
