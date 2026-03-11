/**
 * 站点配置 Schema 类型系统与默认值
 */

// ==================== Schema 类型定义 ====================

export interface IStringSchema {
  type: 'string';
  title: string;
  description?: string;
  inputType?: 'text' | 'textarea' | 'color' | 'url';
  enumType?: readonly string[];
  defaultValue?: string;
  span?: number;
}

export interface INumberSchema {
  type: 'number';
  title: string;
  description?: string;
  inputType?: 'input' | 'slider';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  span?: number;
}

export interface IBooleanSchema {
  type: 'boolean';
  title: string;
  description?: string;
  defaultValue?: boolean;
  span?: number;
}

export type IFieldSchema = IStringSchema | INumberSchema | IBooleanSchema;

export interface IObjectSchema {
  type: 'object';
  title: string;
  description?: string;
  properties: Record<string, IFieldSchema>;
}

export type SiteSchema = Record<string, IObjectSchema>;

// ==================== 配置项定义 ====================

export const siteConfigSchema: SiteSchema = {
  basic: {
    type: 'object',
    title: '基本配置',
    description: '系统基本信息配置',
    properties: {
      systemTitle: {
        type: 'string',
        title: '系统标题',
        inputType: 'text',
        defaultValue: 'Mall Admin',
        span: 12,
      },
      defaultPage: {
        type: 'string',
        title: '默认页面',
        description: '登录后跳转的默认页面路径',
        inputType: 'text',
        defaultValue: '/home',
        span: 12,
      },
      logoUrl: {
        type: 'string',
        title: 'Logo 地址',
        description: '系统 Logo 图片 URL',
        inputType: 'url',
        defaultValue: '',
        span: 24,
      },
    },
  },
  watermark: {
    type: 'object',
    title: '水印配置',
    description: '页面水印显示配置',
    properties: {
      enabled: {
        type: 'boolean',
        title: '启用水印',
        defaultValue: false,
        span: 24,
      },
      content: {
        type: 'string',
        title: '水印内容',
        inputType: 'text',
        defaultValue: 'Mall Admin',
        span: 12,
      },
      color: {
        type: 'string',
        title: '水印颜色',
        inputType: 'color',
        defaultValue: '#000000',
        span: 12,
      },
      fontSize: {
        type: 'number',
        title: '字体大小',
        inputType: 'input',
        min: 12,
        max: 48,
        defaultValue: 16,
        span: 12,
      },
      fontWeight: {
        type: 'string',
        title: '字体粗细',
        enumType: [
          'normal',
          'bold',
          '300',
          '400',
          '500',
          '600',
          '700',
        ] as const,
        defaultValue: 'normal',
        span: 12,
      },
      opacity: {
        type: 'number',
        title: '透明度',
        inputType: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0.15,
        span: 24,
      },
      rotate: {
        type: 'number',
        title: '旋转角度',
        inputType: 'slider',
        min: -90,
        max: 90,
        defaultValue: -22,
        span: 24,
      },
      gapX: {
        type: 'number',
        title: '水平间距',
        inputType: 'input',
        min: 50,
        max: 500,
        defaultValue: 200,
        span: 12,
      },
      gapY: {
        type: 'number',
        title: '垂直间距',
        inputType: 'input',
        min: 50,
        max: 500,
        defaultValue: 150,
        span: 12,
      },
    },
  },
  sentry: {
    type: 'object',
    title: 'Sentry 监控配置',
    description: '错误监控与性能追踪配置，修改后需刷新页面生效',
    properties: {
      enabled: {
        type: 'boolean',
        title: '启用 Sentry',
        description: '运行时开关，优先级低于 VITE_ENABLE_SENTRY 环境变量',
        defaultValue: false,
        span: 24,
      },
      dsn: {
        type: 'string',
        title: 'DSN',
        description: 'Sentry 项目的数据源名称',
        inputType: 'url',
        defaultValue: '',
        span: 24,
      },
      enablePerformance: {
        type: 'boolean',
        title: '性能监控',
        defaultValue: true,
        span: 12,
      },
      enableReplay: {
        type: 'boolean',
        title: '会话重放',
        defaultValue: true,
        span: 12,
      },
      enableRouterTracking: {
        type: 'boolean',
        title: '路由追踪',
        defaultValue: true,
        span: 12,
      },
      enableFeedback: {
        type: 'boolean',
        title: '用户反馈',
        defaultValue: false,
        span: 12,
      },
      tracesSampleRate: {
        type: 'number',
        title: '追踪采样率',
        description: '性能追踪的采样比例（0~1），生产环境建议 0.1',
        inputType: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.1,
        span: 24,
      },
      replaysSessionSampleRate: {
        type: 'number',
        title: '会话重放采样率',
        description: '正常会话被录制的比例（0~1）',
        inputType: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0.01,
        span: 24,
      },
      replaysOnErrorSampleRate: {
        type: 'number',
        title: '错误时重放采样率',
        description: '发生错误时会话被录制的比例，建议保持 1.0',
        inputType: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 1.0,
        span: 24,
      },
    },
  },
};

// ==================== 类型声明 ====================

export interface BasicConfig {
  systemTitle: string;
  defaultPage: string;
  logoUrl: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  content: string;
  color: string;
  fontSize: number;
  fontWeight: string;
  opacity: number;
  rotate: number;
  gapX: number;
  gapY: number;
}

export interface SentryConfig {
  enabled: boolean;
  dsn: string;
  enablePerformance: boolean;
  enableReplay: boolean;
  enableRouterTracking: boolean;
  enableFeedback: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

export interface SiteConfig {
  basic: BasicConfig;
  watermark: WatermarkConfig;
  sentry: SentryConfig;
}

// ==================== 工具函数 ====================

/**
 * 从 schema 中提取默认值
 */
export function extractDefaults(schema: SiteSchema): SiteConfig {
  const result: Record<string, Record<string, unknown>> = {};
  for (const [sectionKey, section] of Object.entries(schema)) {
    result[sectionKey] = {};
    for (const [fieldKey, field] of Object.entries(section.properties)) {
      result[sectionKey][fieldKey] = field.defaultValue;
    }
  }
  return result as SiteConfig;
}

export const defaultSiteConfig: SiteConfig = extractDefaults(siteConfigSchema);

/**
 * 深度合并配置，custom 覆盖默认值
 */
export function mergeConfig(custom: Partial<SiteConfig>): SiteConfig {
  return {
    basic: { ...defaultSiteConfig.basic, ...(custom.basic ?? {}) },
    watermark: { ...defaultSiteConfig.watermark, ...(custom.watermark ?? {}) },
    sentry: { ...defaultSiteConfig.sentry, ...(custom.sentry ?? {}) },
  };
}
