import '@testing-library/jest-dom';

jest.mock('next/image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('img', props),
  };
});

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('monaco-editor', () => ({
  editor: {
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
  },
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: jest.fn(),
      },
    },
  },
}));

jest.mock('@monaco-editor/react', () => {
  const React = require('react');
  const monaco = require('monaco-editor');

  const createEditor = (textarea) => ({
    addAction: jest.fn(),
    getModel: () => ({
      getValue: () => textarea?.value ?? '',
      setValue: (value) => {
        if (textarea) {
          textarea.value = value;
        }
      },
    }),
    getValue: () => textarea?.value ?? '',
    onDidBlurEditorText: jest.fn(),
    onDidFocusEditorText: jest.fn(),
    onKeyDown: jest.fn(),
    updateOptions: jest.fn(),
  });

  const MonacoEditorMock = ({
    onChange,
    onMount,
    options,
    value,
  }) => {
    const ref = React.useRef(null);

    React.useEffect(() => {
      if (ref.current && onMount) {
        onMount(createEditor(ref.current), monaco);
      }
    }, [onMount]);

    return React.createElement('textarea', {
      'aria-label': options?.ariaLabel ?? 'JSON editor',
      onChange: (event) => onChange?.(event.target.value),
      ref,
      value,
    });
  };

  return {
    __esModule: true,
    default: MonacoEditorMock,
    loader: {
      config: jest.fn(),
    },
  };
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}
