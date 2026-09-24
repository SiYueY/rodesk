import eslint from '@eslint/js'
import vue from 'eslint-plugin-vue'

export default [
  eslint.configs.recommended,
  ...vue.configs['flat/recommended'],
]
