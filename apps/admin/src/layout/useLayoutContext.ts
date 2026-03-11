import { reactive, readonly, provide, inject, InjectionKey } from 'vue';

export interface LayoutVisible {
  header: boolean;
  nav: boolean;
}

export interface HeaderVisible {
  logoIcon: boolean;
  logoTitle: boolean;
  themeSwitch: boolean;
  localeSwitch: boolean;
  setting: boolean;
  avatar: boolean;
}

const defaultLayoutConfig: LayoutVisible = {
  header: true,
  nav: true,
};

const defaultHeaderConfig: HeaderVisible = {
  logoIcon: true,
  logoTitle: true,
  themeSwitch: true,
  localeSwitch: true,
  setting: true,
  avatar: true,
};

export interface LayoutContextType {
  layoutVisible: LayoutVisible;
  headerVisible: HeaderVisible;
  setLayoutVisible: (visible: Partial<LayoutVisible>) => void;
  setHeaderVisible: (visible: Partial<HeaderVisible>) => void;
}

export const LayoutContextKey: InjectionKey<LayoutContextType> =
  Symbol('LayoutContext');

export function createLayoutContext(): LayoutContextType {
  const state = reactive({
    layoutVisible: { ...defaultLayoutConfig },
    headerVisible: { ...defaultHeaderConfig },
  });

  const setLayoutVisible = (visible: Partial<LayoutVisible>) => {
    Object.assign(state.layoutVisible, visible);
  };

  const setHeaderVisible = (visible: Partial<HeaderVisible>) => {
    Object.assign(state.headerVisible, visible);
  };

  return {
    layoutVisible: readonly(state.layoutVisible) as LayoutVisible,
    headerVisible: readonly(state.headerVisible) as HeaderVisible,
    setLayoutVisible,
    setHeaderVisible,
  };
}

export function provideLayoutContext(): LayoutContextType {
  const context = createLayoutContext();
  provide(LayoutContextKey, context);
  return context;
}

export function useLayout(): LayoutContextType {
  const context = inject(LayoutContextKey);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

export function useHeaderControl() {
  const { headerVisible, setHeaderVisible } = useLayout();
  return { headerVisible, setHeaderVisible };
}

export function useLayoutControl() {
  const { layoutVisible, setLayoutVisible } = useLayout();
  return { layoutVisible, setLayoutVisible };
}
