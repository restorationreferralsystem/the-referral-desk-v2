import nextPlugin from 'eslint-plugin-next'

export default [
  {
    plugins: {
      next: nextPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
]
