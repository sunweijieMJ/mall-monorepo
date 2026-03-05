/**
 * UniApp API 统一封装
 * 将所有 uni API 调用封装为函数，避免在业务代码中直接使用 uni API
 */

// ==================== 导航相关 ====================

/**
 * 页面跳转 - 保留当前页面
 */
export const navigateTo = (options: {
  url: string;
  animationType?:
    | 'none'
    | 'auto'
    | 'slide-in-right'
    | 'slide-in-left'
    | 'slide-in-top'
    | 'slide-in-bottom'
    | 'fade-in'
    | 'zoom-out'
    | 'zoom-fade-out'
    | 'pop-in';
  animationDuration?: number;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.navigateTo({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 页面重定向 - 关闭当前页面
 */
export const redirectTo = (options: {
  url: string;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.redirectTo({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * Tab 页面跳转
 */
export const switchTab = (options: {
  url: string;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.switchTab({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 页面返回
 */
export const navigateBack = (options?: {
  delta?: number;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.navigateBack({
      delta: 1,
      ...options,
      success: () => {
        options?.success?.();
        resolve();
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 重新加载应用
 */
export const reLaunch = (options: {
  url: string;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.reLaunch({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 交互反馈 ====================

/**
 * 显示消息提示框
 */
export const showToast = (options: {
  title: string;
  icon?: 'success' | 'loading' | 'none' | 'error';
  image?: string;
  duration?: number;
  mask?: boolean;
  position?: 'top' | 'center' | 'bottom';
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.showToast({
      icon: 'none',
      duration: 2000,
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 隐藏消息提示框
 */
export const hideToast = (): void => {
  uni.hideToast();
};

/**
 * 显示 loading 提示框
 */
export const showLoading = (options: {
  title?: string;
  mask?: boolean;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.showLoading({
      title: '加载中...',
      mask: true,
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 隐藏 loading 提示框
 */
export const hideLoading = (): void => {
  uni.hideLoading();
};

/**
 * 显示模态弹窗
 */
export const showModal = (options: {
  title?: string;
  content: string;
  showCancel?: boolean;
  cancelText?: string;
  cancelColor?: string;
  confirmText?: string;
  confirmColor?: string;
  success?: (result: { confirm: boolean; cancel: boolean }) => void;
  fail?: (error: any) => void;
}): Promise<{ confirm: boolean; cancel: boolean }> => {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: '提示',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      ...options,
      success: (result: { confirm: boolean; cancel: boolean }) => {
        options.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 显示操作菜单
 */
export const showActionSheet = (options: {
  itemList: string[];
  itemColor?: string;
  success?: (result: { tapIndex: number }) => void;
  fail?: (error: any) => void;
}): Promise<{ tapIndex: number }> => {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      ...options,
      success: (result: { tapIndex: number }) => {
        options.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 下拉刷新 & 上拉加载 ====================

/**
 * 停止当前页面下拉刷新
 */
export const stopPullDownRefresh = (): void => {
  uni.stopPullDownRefresh();
};

// ==================== 设备相关 ====================

/**
 * 使手机发生较短时间的振动
 */
export const vibrateShort = (options?: {
  type?: 'heavy' | 'medium' | 'light';
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.vibrateShort({
      type: 'light',
      ...options,
      success: () => {
        options?.success?.();
        resolve();
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 设置系统剪贴板的内容
 */
export const setClipboardData = (options: {
  data: string;
  showToast?: boolean;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.setClipboardData({
      showToast: true,
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 获取系统剪贴板的内容
 */
export const getClipboardData = (options?: {
  success?: (result: { data: string }) => void;
  fail?: (error: any) => void;
}): Promise<{ data: string }> => {
  return new Promise((resolve, reject) => {
    uni.getClipboardData({
      ...options,
      success: (result: { data: string }) => {
        options?.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 界面相关 ====================

/**
 * 打开地图选择位置
 */
export const chooseLocation = (options?: {
  latitude?: number;
  longitude?: number;
  success?: (result: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  fail?: (error: any) => void;
}): Promise<{
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    uni.chooseLocation({
      ...options,
      success: (result: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
      }) => {
        options?.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 动态设置当前页面的标题
 */
export const setNavigationBarTitle = (options: {
  title: string;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.setNavigationBarTitle({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 数据存储 ====================

/**
 * 将数据存储在本地缓存中指定的 key 中
 */
export const setStorage = (options: {
  key: string;
  data: any;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 从本地缓存中异步获取指定 key 的内容
 */
export const getStorage = (options: {
  key: string;
  success?: (result: { data: any }) => void;
  fail?: (error: any) => void;
}): Promise<{ data: any }> => {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      ...options,
      success: (result: { data: any }) => {
        options.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 从本地缓存中移除指定 key
 */
export const removeStorage = (options: {
  key: string;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 清理本地数据缓存
 */
export const clearStorage = () => {
  return uni.clearStorage();
};

/**
 * 获取当前storage的相关信息
 */
export const getStorageInfo = (options?: {
  success?: (result: {
    keys: string[];
    currentSize: number;
    limitSize: number;
  }) => void;
  fail?: (error: any) => void;
}): Promise<{ keys: string[]; currentSize: number; limitSize: number }> => {
  return new Promise((resolve, reject) => {
    uni.getStorageInfo({
      ...options,
      success: (result: {
        keys: string[];
        currentSize: number;
        limitSize: number;
      }) => {
        options?.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 路由工具函数 ====================

/**
 * 获取当前页面栈
 */
export const getPages = (): any[] => {
  try {
    // 使用uni-app的全局API
    const pages = getCurrentPages();
    return pages || [];
  } catch (error) {
    console.error('getCurrentPages failed:', error);
    return [];
  }
};

// ==================== 网络请求 ====================

/**
 * 发起网络请求
 */
export const request = (options: {
  url: string;
  data?: any;
  header?: Record<string, string>;
  method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'HEAD'
    | 'OPTIONS'
    | 'TRACE';
  timeout?: number;
  dataType?: 'json' | 'text' | 'base64';
  responseType?: 'text' | 'arraybuffer';
  success?: (result: any) => void;
  fail?: (error: any) => void;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    uni.request({
      method: 'GET',
      dataType: 'json',
      ...options,
      success: (result: any) => {
        options.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 媒体相关 ====================

/**
 * 从相册选择图片或使用相机拍照
 */
export const chooseImage = (options?: {
  count?: number;
  sizeType?: ('original' | 'compressed')[];
  sourceType?: ('album' | 'camera')[];
  success?: (result: {
    tempFilePaths: string | string[];
    tempFiles: any;
  }) => void;
  fail?: (error: any) => void;
}): Promise<{ tempFilePaths: string | string[]; tempFiles: any }> => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      ...options,
      success: (result: {
        tempFilePaths: string | string[];
        tempFiles: any;
      }) => {
        options?.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 预览图片
 */
export const previewImage = (options: {
  urls: string[];
  current?: string | number;
  success?: () => void;
  fail?: (error: any) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    uni.previewImage({
      ...options,
      success: () => {
        options.success?.();
        resolve();
      },
      fail: (error: any) => {
        options.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 系统相关 ====================

/**
 * 获取系统信息
 */
export const getSystemInfo = (options?: {
  success?: (result: any) => void;
  fail?: (error: any) => void;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    uni.getSystemInfo({
      ...options,
      success: (result: any) => {
        options?.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 获取位置信息
 */
export const getLocation = (options?: {
  type?: 'wgs84' | 'gcj02';
  altitude?: boolean;
  highAccuracyExpireTime?: number;
  success?: (result: {
    latitude: number;
    longitude: number;
    speed: number;
    accuracy: number;
    altitude: number;
    verticalAccuracy: number;
    horizontalAccuracy: number;
  }) => void;
  fail?: (error: any) => void;
}): Promise<{
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  altitude: number;
  verticalAccuracy: number;
  horizontalAccuracy: number;
}> => {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      ...options,
      success: (result: {
        latitude: number;
        longitude: number;
        speed: number;
        accuracy: number;
        altitude: number;
        verticalAccuracy: number;
        horizontalAccuracy: number;
      }) => {
        options?.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

/**
 * 调用扫码功能
 */
export const scanCode = (options?: {
  onlyFromCamera?: boolean;
  scanType?: ('barCode' | 'qrCode')[];
  success?: (result: {
    result: string;
    scanType: string;
    charSet: string;
    path: string;
  }) => void;
  fail?: (error: any) => void;
}): Promise<{
  result: string;
  scanType: string;
  charSet: string;
  path: string;
}> => {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      ...options,
      success: (result: {
        result: string;
        scanType: string;
        charSet: string;
        path: string;
      }) => {
        options?.success?.(result);
        resolve(result);
      },
      fail: (error: any) => {
        options?.fail?.(error);
        reject(error);
      },
    });
  });
};

// ==================== 常用的业务封装 ====================

/**
 * 显示成功提示
 */
export const showSuccessToast = (title: string): Promise<void> => {
  return showToast({ title, icon: 'success' });
};

/**
 * 显示错误提示
 */
export const showErrorToast = (title: string): Promise<void> => {
  return showToast({ title, icon: 'none' });
};

/**
 * 显示确认对话框
 */
export const showConfirm = (
  content: string,
  title?: string,
): Promise<boolean> => {
  return showModal({
    title: title || '提示',
    content,
    showCancel: true,
  }).then((result) => result.confirm);
};
