export type AliyunOssConfig = {
  endpoint: string;
  bucketName: string;
  accessKeyId: string;
  accessKeySecret: string;
  dir: string;
};

export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain?: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
  aliyun: {
    oss: AliyunOssConfig;
  };
};
